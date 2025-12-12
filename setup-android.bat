@echo off
echo ========================================
echo Configurando App Android con Capacitor
echo ========================================
echo.

echo [1/3] Instalando dependencias...
call npm install
if errorlevel 1 (
    echo ERROR: No se pudieron instalar las dependencias
    pause
    exit /b 1
)

echo.
echo [2/4] Copiando archivos web a carpeta www...
if not exist www mkdir www
copy /Y index.html www\ >nul
copy /Y styles.css www\ >nul
copy /Y *.js www\ >nul 2>nul
copy /Y manifest.json www\ >nul 2>nul
copy /Y sw.js www\ >nul 2>nul
echo Archivos copiados.

echo.
echo [3/4] Agregando plataforma Android...
call npx cap add android
if errorlevel 1 (
    echo ERROR: No se pudo agregar la plataforma Android
    pause
    exit /b 1
)

echo.
echo [4/4] Sincronizando archivos...
call npx cap sync
if errorlevel 1 (
    echo ERROR: No se pudieron sincronizar los archivos
    pause
    exit /b 1
)

echo.
echo ========================================
echo ¡Configuración completada!
echo ========================================
echo.
echo Próximos pasos:
echo 1. Abre Android Studio
echo 2. Abre la carpeta "android" dentro de este proyecto
echo 3. Espera a que Gradle sincronice
echo 4. Haz clic en "Run" para probar la app
echo.
echo O ejecuta: npx cap open android
echo.
pause

