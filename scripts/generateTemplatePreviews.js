const sharp = require('sharp')
const path = require('path')

const outputDir = path.join(__dirname, '../public/images/templatesImages')

async function generatePreviews() {
  // Template 1 preview
  const svg1 = `<svg width="400" height="280">
    <rect x="0" y="0" width="400" height="280" fill="#f5f5f5"/>
    <rect x="10" y="10" width="380" height="260" fill="white" stroke="#ccc" rx="8"/>
    <rect x="15" y="15" width="5" height="250" fill="#FF6501"/>
    <rect x="15" y="255" width="375" height="5" fill="#FF6501"/>
    <text x="200" y="80" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" font-style="italic" fill="#333">NOMBRE ALUMNO</text>
    <text x="200" y="105" text-anchor="middle" font-family="Arial" font-size="12" fill="#555">DNI: 12345678</text>
    <text x="200" y="145" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#FF6501">NOMBRE DEL CURSO</text>
    <text x="200" y="175" text-anchor="middle" font-family="Arial" font-size="10" font-style="italic" fill="#555">Vigente hasta el dd/mm/yyyy</text>
    <text x="200" y="195" text-anchor="middle" font-family="Arial" font-size="9" fill="#888">Normativas</text>
    <text x="200" y="250" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#333">TEMPLATE 1</text>
  </svg>`

  await sharp(Buffer.from(svg1)).png().toFile(path.join(outputDir, 'certificate-template1-preview.png'))

  // Template 2 preview
  const svg2 = `<svg width="400" height="280">
    <rect x="0" y="0" width="400" height="280" fill="#f5f5f5"/>
    <rect x="10" y="10" width="380" height="260" fill="white" stroke="#ccc" rx="8"/>
    <rect x="15" y="15" width="5" height="250" fill="#FF6501"/>
    <rect x="15" y="255" width="375" height="5" fill="#FF6501"/>
    <rect x="330" y="40" width="45" height="45" fill="#eee" stroke="#ccc" rx="4"/>
    <text x="352" y="67" text-anchor="middle" font-family="Arial" font-size="8" fill="#999">FOTO</text>
    <text x="180" y="80" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" font-style="italic" fill="#333">NOMBRE ALUMNO</text>
    <text x="180" y="105" text-anchor="middle" font-family="Arial" font-size="12" fill="#555">DNI: 12345678</text>
    <text x="200" y="140" text-anchor="middle" font-family="Arial" font-size="11" font-style="italic" fill="#333">Texto + CURSO EN NEGRITA</text>
    <text x="200" y="165" text-anchor="middle" font-family="Arial" font-size="10" font-style="italic" fill="#555">Vigente hasta el dd/mm/yyyy</text>
    <text x="200" y="185" text-anchor="middle" font-family="Arial" font-size="9" fill="#888">Normativas</text>
    <text x="200" y="210" text-anchor="middle" font-family="Arial" font-size="9" font-style="italic" fill="#FF6501">El dia X de Mes de YYYY, texto adicional</text>
    <text x="200" y="250" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#333">TEMPLATE 2</text>
  </svg>`

  await sharp(Buffer.from(svg2)).png().toFile(path.join(outputDir, 'certificate-template2-preview.png'))

  console.log('Template previews generated!')
}

generatePreviews().catch(console.error)
