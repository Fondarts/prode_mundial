// Script para actualizar ads.txt desde el servicio de Ezoic
// Basado en el método cURL recomendado por Ezoic para Standalone
// https://support.ezoic.com/kb/article/everything-you-need-to-know-about-adstxt
// Comando equivalente: curl https://srv.adstxtmanager.com/19390/prode2026.com > ads.txt

const https = require('https');
const fs = require('fs');
const path = require('path');

const DOMAIN = 'prode2026.com';
const EZOIC_ACCOUNT_ID = '19390';
const ADS_TXT_URL = `https://srv.adstxtmanager.com/${EZOIC_ACCOUNT_ID}/${DOMAIN}`;
const ADS_TXT_FILE = path.join(__dirname, 'ads.txt');

console.log(`📥 Actualizando ads.txt desde Ezoic...`);
console.log(`   URL: ${ADS_TXT_URL}`);

https.get(ADS_TXT_URL, (res) => {
  let data = '';

  // Verificar el código de estado
  if (res.statusCode !== 200) {
    console.error(`❌ Error: El servicio respondió con código ${res.statusCode}`);
    console.log(`   Usando archivo ads.txt existente como respaldo.`);
    process.exit(0); // Salir sin error para no romper el build
  }

  // Recopilar los datos
  res.on('data', (chunk) => {
    data += chunk;
  });

  // Cuando termine la respuesta, escribir el archivo
  res.on('end', () => {
    if (data.trim().length === 0) {
      console.warn(`⚠️  Advertencia: El servicio devolvió contenido vacío.`);
      console.log(`   Usando archivo ads.txt existente como respaldo.`);
      process.exit(0);
    }

    // Escribir el archivo
    fs.writeFileSync(ADS_TXT_FILE, data, 'utf8');
    console.log(`✅ ads.txt actualizado correctamente (${data.length} bytes)`);
    console.log(`   Archivo guardado en: ${ADS_TXT_FILE}`);
    process.exit(0);
  });

}).on('error', (err) => {
  console.error(`❌ Error al descargar ads.txt: ${err.message}`);
  console.log(`   Usando archivo ads.txt existente como respaldo.`);
  process.exit(0); // Salir sin error para no romper el build
});
