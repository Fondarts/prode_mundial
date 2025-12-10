# 🚀 Despliegue en Vercel

## Pasos para desplegar en Vercel

### Opción 1: Desde la interfaz web de Vercel (Recomendado)

1. **Crear cuenta en Vercel**
   - Ve a https://vercel.com
   - Regístrate con tu cuenta de GitHub (es más fácil)

2. **Importar proyecto**
   - Haz clic en "Add New Project" (Agregar nuevo proyecto)
   - Selecciona el repositorio `prode_mundial` de GitHub
   - Vercel detectará automáticamente que es un sitio estático

3. **Configuración del proyecto**
   - **Framework Preset**: "Other" o "Static Site"
   - **Root Directory**: Deja vacío (o `.` si pide algo)
   - **Build Command**: Deja vacío (no necesitas build)
   - **Output Directory**: Deja vacío
   - Haz clic en "Deploy"

4. **Esperar el despliegue**
   - Vercel desplegará automáticamente tu sitio
   - Te dará una URL como: `prode-mundial.vercel.app`
   - El sitio estará disponible en unos minutos

### Opción 2: Desde la línea de comandos

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Iniciar sesión**
   ```bash
   vercel login
   ```

3. **Desplegar**
   ```bash
   vercel
   ```
   - Sigue las instrucciones en pantalla
   - Acepta las configuraciones por defecto

4. **Desplegar a producción**
   ```bash
   vercel --prod
   ```

## Configurar dominio personalizado (Opcional)

1. En el dashboard de Vercel, ve a tu proyecto
2. Ve a "Settings" > "Domains"
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar los DNS

## Configurar AdSense con Vercel

Una vez desplegado en Vercel:

1. **Agregar sitio en AdSense**
   - Ve a AdSense > Sitios
   - Agrega la URL de Vercel: `https://tu-proyecto.vercel.app`
   - O si tienes dominio personalizado: `https://tu-dominio.com`

2. **Verificar propiedad**
   - Usa el método de meta tag (ya está en el HTML)
   - O el método de archivo HTML si prefieres

3. **Ventajas de Vercel**
   - El sitio se sirve desde la raíz del dominio (no hay subcarpetas)
   - AdSense debería poder verificar sin problemas
   - Despliegues automáticos con cada push a GitHub

## Actualizaciones automáticas

Vercel se conecta automáticamente con GitHub:
- Cada vez que hagas `git push`, Vercel desplegará automáticamente
- No necesitas hacer nada manual después de la primera configuración

## Notas importantes

- El archivo `vercel.json` ya está configurado para servir el sitio estático
- Todos los archivos JavaScript y CSS se servirán correctamente
- El sitio funcionará igual que en GitHub Pages, pero desde la raíz del dominio



