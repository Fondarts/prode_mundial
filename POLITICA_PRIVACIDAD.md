# 📋 Política de Privacidad - Guía de Configuración

## 🚀 Cómo Publicarla

### Paso 1: Desplegar en Vercel

El archivo `privacidad.html` ya está incluido en el script de copia, así que cuando hagas `git push`, Vercel lo desplegará automáticamente.

**O manualmente:**
1. Copia `privacidad.html` a la carpeta `www/` (ya está hecho con `node copy-files.js`)
2. Haz commit y push:
   ```bash
   git add privacidad.html www/privacidad.html
   git commit -m "Agregar política de privacidad"
   git push
   ```

### Paso 2: Obtener la URL

Una vez desplegado en Vercel, tu política de privacidad estará disponible en:

```
https://tu-proyecto.vercel.app/privacidad.html
```

**Ejemplo:** Si tu proyecto se llama `prode-mundial`, la URL sería:
```
https://prode-mundial.vercel.app/privacidad.html
```

### Paso 3: Usar en Google Play Console

1. Ve a Google Play Console > Tu app > Contenido de la app > Política de Privacidad
2. En el campo "URL de la política de privacidad", pega la URL completa:
   ```
   https://tu-proyecto.vercel.app/privacidad.html
   ```
3. Haz clic en "Guardar"

## 📝 Personalización Opcional

Antes de publicar, puedes personalizar:

1. **Email de contacto** (línea ~240):
   ```html
   <strong>Email:</strong> [Tu email de contacto]
   ```
   Reemplaza `[Tu email de contacto]` con tu email real.

2. **Nombre del proyecto**: Si tu app tiene otro nombre, busca y reemplaza "Fixture Mundial 2026" en el archivo.

## ✅ Verificación

Después de desplegar, verifica que la página funciona:
1. Abre la URL en tu navegador
2. Verifica que se ve bien y es legible
3. Asegúrate de que la fecha de actualización se muestra correctamente

## 📱 Para Android

La política también estará disponible cuando publiques la app en Play Store, y los usuarios podrán acceder a ella desde la página de la app.

## 🔄 Actualizaciones Futuras

Si necesitas actualizar la política:
1. Edita `privacidad.html`
2. Ejecuta `node copy-files.js` (o haz push y Vercel lo hará automáticamente)
3. La fecha se actualizará automáticamente cuando se cargue la página

---

**Nota:** La política está diseñada para cumplir con:
- ✅ Requisitos de Google Play Store
- ✅ GDPR (Reglamento General de Protección de Datos)
- ✅ Leyes de protección de datos internacionales
- ✅ Políticas de privacidad de aplicaciones móviles

