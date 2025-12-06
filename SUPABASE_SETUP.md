# Configuración de Supabase

## Paso 1: Crear cuenta y proyecto en Supabase

1. Ve a https://supabase.com
2. Crea una cuenta (puedes usar GitHub para registrarte)
3. Crea un nuevo proyecto
4. Elige un nombre para tu proyecto y una contraseña para la base de datos
5. Espera a que se cree el proyecto (puede tardar 1-2 minutos)

## Paso 2: Obtener credenciales

1. En tu proyecto de Supabase, ve a **Settings** (Configuración) → **API**
2. Copia los siguientes valores:
   - **Project URL** (URL del proyecto)
   - **anon public** key (clave pública anónima)

## Paso 3: Configurar el proyecto

1. Abre el archivo `supabase-config.js`
2. Reemplaza `TU_SUPABASE_URL` con tu Project URL
3. Reemplaza `TU_SUPABASE_ANON_KEY` con tu anon public key

Ejemplo:
```javascript
const SUPABASE_CONFIG = {
    url: 'https://abcdefghijklmnop.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

## Paso 4: Crear las tablas

1. En Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase-schema.sql`
3. Copia todo el contenido
4. Pégalo en el SQL Editor de Supabase
5. Haz clic en **Run** (Ejecutar)

Esto creará:
- Tabla `torneos`
- Tabla `participantes`
- Índices para mejorar el rendimiento
- Políticas de seguridad (RLS)

## Paso 5: Verificar la configuración

1. Abre la aplicación principal (`index.html`) en tu navegador
2. Abre la consola del navegador (F12)
3. Deberías ver "Supabase inicializado correctamente"
4. Si ves "Supabase no configurado, usando localStorage", verifica que las credenciales estén correctas

### Test rápido de conexión

También puedes abrir `test-supabase.html` en tu navegador para hacer una prueba rápida de conexión.

## Notas importantes

- **Seguridad**: Las políticas RLS permiten que cualquiera lea y cree torneos, pero solo el creador puede actualizar resultados reales
- **Backup**: Los datos se guardan tanto en Supabase como en localStorage (como respaldo)
- **Migración**: La primera vez que uses Supabase, se sincronizarán automáticamente los datos de localStorage

## Solución de problemas

- **Error de conexión**: Verifica que las credenciales sean correctas
- **Error de permisos**: Asegúrate de haber ejecutado el script SQL completo
- **Datos no aparecen**: Revisa la consola del navegador para ver errores

