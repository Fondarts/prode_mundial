# Guía para Publicar en Google Play Store

## 1. Preparar el AAB (Android App Bundle)

### Opción A: Desde Android Studio
1. Abre Android Studio
2. Ve a **Build** → **Generate Signed Bundle / APK**
3. Selecciona **Android App Bundle**
4. Si no tienes un keystore, créalo:
   - Haz clic en "Create new..."
   - Completa los datos (alias, contraseña, nombre, organización, etc.)
   - Guarda el archivo `.jks` en un lugar seguro (¡IMPORTANTE! No lo pierdas)
5. Selecciona el keystore y completa la contraseña
6. Selecciona **release** como build variant
7. Haz clic en **Finish**
8. El AAB se generará en: `android/app/release/app-release.aab`

### Opción B: Desde línea de comandos
```bash
cd android
./gradlew bundleRelease
```
El AAB estará en: `android/app/build/outputs/bundle/release/app-release.aab`

## 2. Crear la Aplicación en Play Console

1. Ve a https://play.google.com/console
2. Inicia sesión con tu cuenta de desarrollador
3. Haz clic en **"Crear aplicación"**
4. Completa:
   - **Nombre de la app**: "Mundial 2026" (o el que prefieras)
   - **Idioma predeterminado**: Español
   - **Tipo de app**: App
   - **Gratis o de pago**: Gratis
   - Acepta los términos

## 3. Configurar la Tienda

### Información de la app
- **Nombre**: Fixture Interactivo Mundial 2026
- **Descripción corta**: Máximo 80 caracteres
- **Descripción completa**: Describe tu app
- **Icono**: 512x512px PNG (sin transparencia)
- **Capturas de pantalla**: Mínimo 2, máximo 8
  - Teléfono: 16:9 o 9:16, mínimo 320px, máximo 3840px
  - Tablet (opcional): 16:9 o 9:16

### Clasificación de contenido
- Selecciona la categoría apropiada (Deportes)
- Completa el cuestionario de contenido

### Precios y distribución
- Selecciona países donde distribuir
- Configura si es gratuita o de pago

## 4. Subir el AAB

1. En Play Console, ve a **Producción** → **Crear nueva versión**
2. Haz clic en **"Subir"** y selecciona tu archivo `.aab`
3. Completa las **Notas de la versión** (qué hay de nuevo)
4. Haz clic en **"Guardar"**

## 5. Revisar y Publicar

1. Revisa toda la información
2. Completa cualquier sección pendiente (marcada con ⚠️)
3. Haz clic en **"Enviar para revisión"**
4. Google revisará tu app (puede tardar horas o días)
5. Una vez aprobada, estará disponible en Play Store

## Requisitos Importantes

### Iconos y Assets Necesarios
- **Icono de la app**: 512x512px PNG
- **Capturas de pantalla**: Mínimo 2
- **Banner promocional** (opcional): 1024x500px

### Información Requerida
- Política de privacidad (URL)
- Email de contacto
- Descripción de la app
- Clasificación de contenido

### Configuración Técnica
- **Versión del código**: Incrementa en cada actualización
- **Versión del nombre**: Ej: "1.0.0"
- **SDK mínimo**: Verifica en `android/app/build.gradle`

## Comandos Útiles

### Generar AAB firmado
```bash
cd android
./gradlew bundleRelease
```

### Verificar el AAB
```bash
bundletool build-apks --bundle=app-release.aab --output=app.apks
```

### Sincronizar cambios web antes de generar AAB
```bash
node copy-files.js
npx cap sync
```

## Notas Importantes

⚠️ **GUARDA TU KEYSTORE**: Si pierdes el archivo `.jks` y la contraseña, NO podrás actualizar tu app nunca más.

⚠️ **Prueba antes de publicar**: Prueba el AAB en un dispositivo real antes de subirlo.

⚠️ **Versiones**: Cada vez que subas una actualización, incrementa el `versionCode` en `android/app/build.gradle`.

## Archivos de Configuración

### android/app/build.gradle
Asegúrate de tener:
```gradle
android {
    defaultConfig {
        versionCode 1
        versionName "1.0.0"
        minSdkVersion 22
        targetSdkVersion 34
    }
}
```

### android/app/release/app-release.aab
Este es el archivo que subirás a Play Store.


