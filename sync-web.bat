@echo off
echo Copiando archivos web a carpeta www...
if not exist www mkdir www
copy /Y index.html www\ >nul
copy /Y styles.css www\ >nul
copy /Y *.js www\ >nul 2>nul
copy /Y manifest.json www\ >nul 2>nul
copy /Y sw.js www\ >nul 2>nul
echo Archivos copiados.
echo.
echo Sincronizando con Capacitor...
call npx cap sync
echo.
echo ¡Listo! Puedes abrir Android Studio con: npx cap open android
pause



