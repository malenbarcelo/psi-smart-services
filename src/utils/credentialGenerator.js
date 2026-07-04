const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')
const QRCode = require('qrcode')
const db = require('../../database/models')
const appConfig = require('../data/appConfig')

// generate credential PDF for a passed inscription
async function generateCredential(inscriptionId, forceGenerate = false) {
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

  // check if credential should be generated
  if (!forceGenerate) {
    if (!course.has_credential) return null
    if (!student.photo) return null
  }

  // get template data
  const template = await db.Templates_credentials.findOne({
    where: { id_courses: course.id }
  })

  if (!template) return null

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

  // code: xxxx.ddmmaaaa.xx
  const code = `xxxx-${day}${month}${year}-xx`

  // file name
  const fullName = `${student.last_name} ${student.first_name}`
  const fileName = `CR ${inscriptionId} - ${course.course_name} - ${fullName} (DNI ${student.dni}).pdf`
  const outputPath = path.join(__dirname, '../../public/certificatesAndCredentials', fileName)

  // image paths
  const templatesImgPath = path.join(__dirname, '../../public/images/templatesImages')
  const studentPhotoPath = path.join(__dirname, '../../public/studentsPhotos', student.photo || '')

  // generate QR code (use existing verification_token)
  const verificationToken = inscription.verification_token
  let qrBuffer = null
  if (verificationToken) {
    const verificationUrl = `${appConfig.baseUrl}/verificar/${verificationToken}?type=credential`
    qrBuffer = await QRCode.toBuffer(verificationUrl, { width: 80, margin: 1 })
  }

  // create PDF - A4 landscape, cards drawn inside with margin
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 })
  const stream = fs.createWriteStream(outputPath)
  doc.pipe(stream)

  const pageWidth = doc.page.width
  const pageHeight = doc.page.height

  // full white background
  doc.rect(0, 0, pageWidth, pageHeight).fill('#ffffff')

  const blueColor = '#080867'
  const cornerRadius = 18
  const cardWidth = 370
  const cardHeight = 245
  const gap = 20
  const totalWidth = cardWidth * 2 + gap
  const startX = (pageWidth - totalWidth) / 2
  const startY = 110

  // ====== FRONT CARD (left) ======
  const frontX = startX
  const frontY = startY

  // rounded border
  doc.roundedRect(frontX, frontY, cardWidth, cardHeight, cornerRadius)
    .lineWidth(2.5)
    .stroke(blueColor)

  // top blue filled bar (clipped to rounded top corners)
  const barHeight = 35
  doc.save()
  doc.roundedRect(frontX, frontY, cardWidth, cornerRadius * 2 + barHeight, cornerRadius).clip()
  doc.rect(frontX, frontY, cardWidth, barHeight).fill(blueColor)
  doc.restore()

  // credential_forehead text (white, bold, centered in blue bar)
  doc.font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#ffffff')
  doc.text(template.credential_forehead.toUpperCase(), frontX + 14, frontY + 11, { width: cardWidth - 28, align: 'center' })

  // student data section
  const dataY = frontY + barHeight + 10
  doc.font('Helvetica-Bold')
    .fontSize(13)
    .fillColor('#000000')
  doc.text(fullName.toUpperCase(), frontX + 12, dataY)
  doc.text(`DNI: ${student.dni}`, frontX + 12, dataY + 16)
  doc.text(`EMISIÓN: ${todayFormatted}`, frontX + 12, dataY + 32)
  doc.text(`VENCIMIENTO: ${expirationFormatted}`, frontX + 12, dataY + 48)

  // student photo (right side of front card)
  const photoX = frontX + cardWidth - 95
  const photoY = dataY
  if (student.photo && fs.existsSync(studentPhotoPath)) {
    doc.image(studentPhotoPath, photoX, photoY, { width: 70, height: 70, fit: [70, 70] })
    doc.rect(photoX, photoY, 70, 70).lineWidth(0.5).stroke('#999')
  }

  // code below photo
  doc.font('Helvetica')
    .fontSize(10)
    .fillColor('#333')
  doc.text(code, photoX - 10, photoY + 75, { width: 90, align: 'center' })

  // signatures section
  const sigY = frontY + cardHeight - 100
  const sig1Path = path.join(templatesImgPath, template.signature_1)
  if (fs.existsSync(sig1Path)) {
    doc.image(sig1Path, frontX + 12, sigY, { fit: [101, 66] })
  }

  const hasSignature2 = template.signature_2 != null && template.signature_2 !== ''
  if (hasSignature2) {
    const sig2Path = path.join(templatesImgPath, template.signature_2)
    if (fs.existsSync(sig2Path)) {
      doc.image(sig2Path, frontX + 121, sigY, { fit: [101, 66] })
    }
  }

  // QR on front card
  if (qrBuffer) {
    doc.image(qrBuffer, frontX + cardWidth - 67, sigY + 6, { width: 55, height: 55 })
  }

  // bottom line for normatives section (edge to edge inside card)
  const normLineY = frontY + cardHeight - 27
  doc.moveTo(frontX, normLineY)
    .lineTo(frontX + cardWidth, normLineY)
    .lineWidth(1.3)
    .stroke(blueColor)

  // normatives centered vertically between line and bottom of card
  const normAreaTop = normLineY
  const normAreaBottom = frontY + cardHeight
  const normAreaHeight = normAreaBottom - normAreaTop
  doc.font('Helvetica')
    .fontSize(9)
    .fillColor('#333')
  const normTextWidth = cardWidth - 20
  // position text at vertical center of the area
  const normTextHeight = doc.heightOfString(template.credential_normatives, { width: normTextWidth })
  const normTextY = normAreaTop + (normAreaHeight - normTextHeight) / 2 + 2
  doc.text(template.credential_normatives, frontX + 10, normTextY, { width: normTextWidth, align: 'center' })

  // ====== BACK CARD (right) ======
  const backX = frontX + cardWidth + gap
  const backY = startY

  // rounded border
  doc.roundedRect(backX, backY, cardWidth, cardHeight, cornerRadius)
    .lineWidth(2.5)
    .stroke(blueColor)

  // top blue filled bar (clipped to rounded top corners)
  doc.save()
  doc.roundedRect(backX, backY, cardWidth, cornerRadius * 2 + barHeight, cornerRadius).clip()
  doc.rect(backX, backY, cardWidth, barHeight).fill(blueColor)
  doc.restore()

  // credential_back text (white, bold, centered in blue bar)
  doc.font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#ffffff')
  doc.text(template.credential_back.toUpperCase(), backX + 14, backY + 11, { width: cardWidth - 28, align: 'center' })

  // credential logo (centered in back card area below bar)
  const logoPath = path.join(templatesImgPath, template.credential_logo)
  if (fs.existsSync(logoPath)) {
    const logoAreaTop = backY + barHeight
    const logoAreaHeight = cardHeight - barHeight
    const logoFitHeight = 140
    const logoFitWidth = cardWidth - 60
    const logoY = logoAreaTop + (logoAreaHeight - logoFitHeight) / 2
    doc.image(logoPath, backX + 30, logoY, { fit: [logoFitWidth, logoFitHeight], align: 'center', valign: 'center' })
  }

  // finalize
  doc.end()

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(fileName))
    stream.on('error', reject)
  })
}

module.exports = { generateCredential }
