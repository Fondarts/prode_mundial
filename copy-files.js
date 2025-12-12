// Script para copiar archivos web a la carpeta www para Capacitor
const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, 'www');
const filesToCopy = [
  'index.html',
  'styles.css',
  'app.js',
  'translations.js',
  'paises-data.js',
  'data.js',
  'ciudades-data.js',
  'manifest.json',
  'sw.js',
  'supabase-config.js',
  'supabase-service.js',
  'auth-service.js',
  'auth-ui.js',
  'api-config.js',
  'api-service.js',
  'torneo.js'
];

// Crear carpeta www si no existe
if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

// Copiar archivos
let copied = 0;
filesToCopy.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(wwwDir, file);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    copied++;
  } else {
    console.warn(`⚠ Archivo no encontrado: ${file}`);
  }
});

console.log(`✅ ${copied} archivos copiados a la carpeta www/`);



