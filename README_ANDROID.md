# 🚀 Convertir a App Android

Tu aplicación web ahora puede convertirse en una app Android nativa usando **Capacitor**.

## ⚡ Inicio Rápido

### 1. Instalar Node.js y dependencias

```bash
npm install
```

### 2. Agregar plataforma Android

```bash
npx cap add android
npx cap sync
```

### 3. Abrir en Android Studio

```bash
npx cap open android
```

### 4. Generar APK

En Android Studio:
- **Build > Build Bundle(s) / APK(s) > Build APK(s)**

## 📱 Características

- ✅ App nativa Android
- ✅ Mantiene todo tu código web existente
- ✅ Acceso a APIs nativas si las necesitas
- ✅ Puede publicarse en Google Play Store
- ✅ También funciona como PWA (instalable desde navegador)

## 📖 Documentación Completa

Lee `ANDROID_SETUP.md` para instrucciones detalladas sobre:
- Configuración completa
- Generar APK de producción
- Publicar en Google Play Store
- Solución de problemas

## 🔄 Actualizar la App

Cada vez que hagas cambios:

```bash
npx cap sync
npx cap open android
```

Luego recompila en Android Studio.

## 📝 Notas

- Los archivos web se copian automáticamente a la app Android
- Puedes agregar funcionalidades nativas usando plugins de Capacitor
- La app también funciona como PWA (Progressive Web App)



