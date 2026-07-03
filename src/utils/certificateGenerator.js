const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const QRCode = require('qrcode')
const db = require('../../database/models')
const appConfig = require('../data/appConfig')

// generate certificate PDF for a passed inscription
async function generateCertificate(inscriptionId, forceGenerate = false) {
  // get inscription with all related data
  const inscription = await db.Students_inscriptions.findByPk(inscriptionId, {
    include: [
      { model: db.Students, as: 'student_data' },
      { model: db.Courses, as: 'course_data' },
      { model: db.Users_companies, as: 'company_data' }
    ]
  })

  if (!inscription) return null

  const course = inscription.course_data
  const student = inscription.student_data

  // check if certificate should be generated (skip checks if forceGenerate)
  if (!forceGenerate) {
    if (!course.has_certificate) return null
    if (!student.photo) return null
  }

  // get template data
  const template = await db.Templates_certificates.findOne({
    where: { id_courses: course.id }
  })

  if (!template) return null

  // determine exam type text
  let examTypeText = ''
  if (course.has_theorical && course.has_practical) {
    examTypeText = 'teórico-práctico'
  } else if (course.has_practical) {
    examTypeText = 'práctico'
  } else {
    examTypeText = 'teórico'
  }

  // dates
  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = today.getFullYear()
  const todayFormatted = `${day}/${month}/${year}`

  // expiration date
  let expirationFormatted = ''
  if (course.validity_months) {
    const expDate = new Date(today)
    expDate.setMonth(expDate.getMonth() + course.validity_months)
    const expDay = String(expDate.getDate()).padStart(2, '0')
    const expMonth = String(expDate.getMonth() + 1).padStart(2, '0')
    const expYear = expDate.getFullYear()
    expirationFormatted = `${expDay}/${expMonth}/${expYear}`
  }

  // file name
  const fullName = `${student.last_name} ${student.first_name}`
  const fileName = `CE ${inscriptionId} - ${course.course_name} - ${fullName} (DNI ${student.dni}).pdf`
  const outputPath = path.join(__dirname, '../../public/certificatesAndCredentials', fileName)

  // generate verification token and save it
  const verificationToken = crypto.randomUUID()
  await db.Students_inscriptions.update(
    { verification_token: verificationToken },
    { where: { id: inscriptionId } }
  )

  // generate QR code as buffer (URL to verification page)
  const verificationUrl = `${appConfig.baseUrl}/verificar/${verificationToken}`
  const qrBuffer = await QRCode.toBuffer(verificationUrl, { width: 100, margin: 1 })

  // image paths
  const templatesImgPath = path.join(__dirname, '../../public/images/templatesImages')
  const companyLogoPath = path.join(__dirname, '../../public/images/companyLogo.png')

  // create PDF (landscape A4, fit to page on open)
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0, autoFirstPage: true })
  doc.info.Title = `Certificado - ${fullName}`
  const stream = fs.createWriteStream(outputPath)
  doc.pipe(stream)

  const pageWidth = doc.page.width
  const pageHeight = doc.page.height

  // --- OUTER FRAME: grey with shadow/relief effect ---
  const frameMargin = 25
  // outer shadow (darker)
  doc.rect(frameMargin + 3, frameMargin + 3, pageWidth - frameMargin * 2, pageHeight - frameMargin * 2)
    .fill('#d0d0d0')
  // main frame
  doc.rect(frameMargin, frameMargin, pageWidth - frameMargin * 2, pageHeight - frameMargin * 2)
    .fill('#e8e8e8')
  // inner white area
  const innerMargin = frameMargin + 6
  doc.rect(innerMargin, innerMargin, pageWidth - innerMargin * 2, pageHeight - innerMargin * 2)
    .fill('#ffffff')

  // --- ORANGE BAR on the left ---
  const barX = innerMargin
  const barWidth = 7
  doc.rect(barX, innerMargin, barWidth, pageHeight - innerMargin * 2).fill('#FF6501')

  // --- ORANGE BAR on the bottom ---
  const bottomBarY = pageHeight - innerMargin - barWidth
  doc.rect(innerMargin, bottomBarY, pageWidth - innerMargin * 2, barWidth).fill('#FF6501')

  // --- TRIANGLE at bottom-left corner (where bars meet) ---
  const triSize = 18
  doc.save()
  doc.moveTo(barX + barWidth, bottomBarY)
    .lineTo(barX + barWidth + triSize, bottomBarY)
    .lineTo(barX + barWidth, bottomBarY - triSize)
    .closePath()
    .fill('#FF6501')
  doc.restore()

  // --- CONTENT AREA ---
  const contentLeft = innerMargin + barWidth + 20
  const contentRight = pageWidth - innerMargin - 20
  const contentWidth = contentRight - contentLeft

  // --- HEADER SECTION ---
  // Company logo (top left)
  if (fs.existsSync(companyLogoPath)) {
    doc.image(companyLogoPath, contentLeft, innerMargin + 12, { height: 45 })
  }

  // Right side header text
  const rightTextWidth = 280
  const rightTextX = contentRight - rightTextWidth

  doc.font('Helvetica-BoldOblique')
    .fontSize(12)
    .fillColor('#333')
  doc.text(`Certificado de aprobación curso ${examTypeText}`, rightTextX, innerMargin + 14, { align: 'right', width: rightTextWidth })

  doc.font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#333')
  doc.text(`ARGENTINA, Neuquén ${todayFormatted}`, rightTextX, innerMargin + 32, { align: 'right', width: rightTextWidth })

  doc.font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#333')
  doc.text(`Código: xxxx-xxxxxxxxxx`, rightTextX, innerMargin + 50, { align: 'right', width: rightTextWidth })

  // --- MAIN CONTENT ---
  // Student name (bold+italic, very large, centered, uppercase)
  doc.font('Helvetica-BoldOblique')
    .fontSize(34)
    .fillColor('#333')
  const nameText = fullName.toUpperCase()
  doc.text(nameText, contentLeft, innerMargin + 110, { align: 'center', width: contentWidth })

  // DNI
  doc.font('Helvetica')
    .fontSize(16)
    .fillColor('#333')
  doc.text(`DNI: ${student.dni}`, contentLeft, innerMargin + 155, { align: 'center', width: contentWidth })

  // Course name in certificate (bold, large, orange, centered, uppercase)
  doc.font('Helvetica-Bold')
    .fontSize(30)
    .fillColor('#FF6501')
  doc.text(template.course_name_in_certificate.toUpperCase(), contentLeft, innerMargin + 195, { align: 'center', width: contentWidth })

  // Expiration (italic)
  if (expirationFormatted) {
    doc.font('Helvetica-Oblique')
      .fontSize(17)
      .fillColor('#333')
    doc.text(`Vigente hasta el ${expirationFormatted}`, contentLeft, innerMargin + 285, { align: 'center', width: contentWidth })
  }

  // Normatives (italic, same size as vigente)
  doc.font('Helvetica-Oblique')
    .fontSize(17)
    .fillColor('#333')
  doc.text(template.certificate_normatives, contentLeft + 20, innerMargin + 315, { align: 'center', width: contentWidth - 40 })

  // --- FOOTER: Signatures and logo (centered horizontally) ---
  const footerY = bottomBarY - 100
  const hasSignature2 = template.signature_2 != null && template.signature_2 !== ''

  const itemCount = hasSignature2 ? 3 : 2
  const itemWidth = 170
  const itemHeight = 80
  const totalWidth = itemCount * itemWidth
  const startX = contentLeft + (contentWidth - totalWidth) / 2

  // Signature 1
  const sig1Path = path.join(templatesImgPath, template.signature_1)
  if (fs.existsSync(sig1Path)) {
    doc.image(sig1Path, startX + 10, footerY, { fit: [itemWidth - 20, itemHeight] })
  }

  // Signature 2 (if exists)
  if (hasSignature2) {
    const sig2Path = path.join(templatesImgPath, template.signature_2)
    if (fs.existsSync(sig2Path)) {
      doc.image(sig2Path, startX + itemWidth + 10, footerY, { fit: [itemWidth - 20, itemHeight] })
    }
  }

  // Certificate logo
  const logoPath = path.join(templatesImgPath, template.certificate_logo)
  const logoX = hasSignature2 ? startX + itemWidth * 2 : startX + itemWidth
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, logoX + 10, footerY, { fit: [itemWidth - 20, itemHeight] })
  }

  // --- QR Code (bottom right) ---
  const qrSize = 65
  const qrX = contentRight - qrSize - 5
  const qrY = bottomBarY - qrSize - 10
  doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize })

  // finalize
  doc.end()

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(fileName))
    stream.on('error', reject)
  })
}

module.exports = { generateCertificate }
