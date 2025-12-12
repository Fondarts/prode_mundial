# Guía para Generar la App Android

Esta guía te ayudará a convertir tu aplicación web en una app Android usando Capacitor.

## Requisitos Previos

1. **Node.js** (versión 18 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **Android Studio**
   - Descargar desde: https://developer.android.com/studio
   - Instalar Android SDK (API Level 33 o superior)
   - Configurar variables de entorno:
     - `ANDROID_HOME` = ruta a tu Android SDK
     - Agregar a PATH: `%ANDROID_HOME%\platform-tools` y `%ANDROID_HOME%\tools`

3. **Java JDK** (versión 17 recomendada)
   - Android Studio incluye JDK, pero puedes instalar uno separado si es necesario

## Pasos para Generar el APK

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Agregar Plataforma Android

```bash
npx cap add android
```

### 3. Sincronizar Archivos Web con Android

```bash
npx cap sync
```

Este comando copia todos los archivos web a la carpeta `android/app/src/main/assets/public/`

### 4. Abrir Proyecto en Android Studio

```bash
npx cap open android
```

O manualmente:
- Abre Android Studio
- Selecciona "Open an Existing Project"
- Navega a la carpeta `android/` dentro de tu proyecto

### 5. Configurar el Proyecto Android

En Android Studio:

1. **Configurar el nombre de la app y package:**
   - Abre `android/app/build.gradle`
   - Busca `applicationId` y verifica que sea `com.mundial2026.app`
   - Busca `versionName` y `versionCode` para actualizar la versión

2. **Configurar permisos (si es necesario):**
   - Abre `android/app/src/main/AndroidManifest.xml`
   - Agrega permisos si tu app necesita acceso a internet, cámara, etc.

### 6. Generar APK de Prueba (Debug)

1. En Android Studio, ve a: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Espera a que termine la compilación
3. El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

### 7. Generar APK de Producción (Release)

#### 7.1. Crear Keystore (solo primera vez)

```bash
keytool -genkey -v -keystore mundial-2026-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mundial-2026
```

Guarda la contraseña y la información que te pide.

#### 7.2. Configurar build.gradle

Abre `android/app/build.gradle` y agrega antes de `android {`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Y dentro de `android {`, reemplaza `buildTypes` con:

```gradle
signingConfigs {
    release {
        if (keystorePropertiesFile.exists()) {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

#### 7.3. Crear archivo keystore.properties

Crea `android/keystore.properties` (NO lo subas a Git):

```properties
storeFile=../mundial-2026-release-key.jks
keyAlias=mundial-2026
storePassword=TU_CONTRASEÑA_AQUI
keyPassword=TU_CONTRASEÑA_AQUI
```

#### 7.4. Generar APK Release

1. En Android Studio: **Build > Generate Signed Bundle / APK**
2. Selecciona **APK**
3. Selecciona tu keystore y completa la información
4. El APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

### 8. Probar la App

#### Opción A: Instalar en dispositivo físico
1. Habilita "Modo desarrollador" en tu Android
2. Habilita "Depuración USB"
3. Conecta el dispositivo por USB
4. En Android Studio, haz clic en "Run" (botón verde ▶️)

#### Opción B: Usar emulador
1. En Android Studio: **Tools > Device Manager**
2. Crea un dispositivo virtual (AVD)
3. Ejecuta el emulador
4. Haz clic en "Run"

## Comandos Útiles

```bash
# Sincronizar cambios web con Android
npx cap sync

# Abrir Android Studio
npx cap open android

# Ver información del proyecto
npx cap doctor
```

## Actualizar la App

Cada vez que hagas cambios en los archivos web:

1. Ejecuta: `npx cap sync`
2. Abre Android Studio: `npx cap open android`
3. Recompila y genera el nuevo APK

## Publicar en Google Play Store

1. Crea una cuenta de desarrollador en Google Play Console ($25 USD una vez)
2. Prepara los assets necesarios:
   - Icono de la app (512x512px)
   - Screenshots (mínimo 2)
   - Descripción de la app
   - Política de privacidad (si recolectas datos)
3. Sube el APK o AAB (Android App Bundle) desde Android Studio
4. Completa la información de la tienda
5. Envía para revisión

## Notas Importantes

- El archivo `keystore.properties` y `*.jks` NO deben subirse a Git (agrégalos a `.gitignore`)
- Mantén una copia segura de tu keystore, es necesaria para actualizar la app
- El APK de debug es solo para pruebas, no para publicar
- Para producción, siempre usa el APK firmado (release)

## Solución de Problemas

### Error: "SDK location not found"
- Configura `ANDROID_HOME` en las variables de entorno

### Error: "Gradle sync failed"
- Abre Android Studio y deja que descargue las dependencias
- Ve a **File > Sync Project with Gradle Files**

### La app no carga correctamente
- Verifica que ejecutaste `npx cap sync` después de cambios
- Revisa la consola de Android Studio para errores

## Recursos Adicionales

- Documentación de Capacitor: https://capacitorjs.com/docs
- Guía de Android Studio: https://developer.android.com/studio/intro
- Google Play Console: https://play.google.com/console



