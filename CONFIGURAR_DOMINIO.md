# 🌐 Configurar Dominio Personalizado en Vercel

## Paso 1: Agregar dominio en Vercel

1. **Ve a tu proyecto en Vercel**
   - Entra a https://vercel.com
   - Selecciona tu proyecto `prode_mundial`

2. **Ve a la configuración de dominios**
   - Haz clic en **Settings** (Configuración)
   - Selecciona **Domains** (Dominios) en el menú lateral

3. **Agrega tu dominio**
   - Haz clic en **Add Domain** (Agregar Dominio)
   - Ingresa tu dominio completo (ej: `tudominio.com` o `www.tudominio.com`)
   - Haz clic en **Add**

4. **Vercel te mostrará los registros DNS necesarios**
   - Anota los valores que te muestra Vercel
   - Normalmente verás algo como:
     - **Tipo A**: `76.76.21.21` (o una IP similar)
     - **Tipo CNAME**: `cname.vercel-dns.com` (para www)

## Paso 2: Configurar DNS en Namecheap

1. **Accede a tu cuenta de Namecheap**
   - Ve a https://www.namecheap.com
   - Inicia sesión en tu cuenta

2. **Ve a la gestión de dominios**
   - En el panel, ve a **Domain List** (Lista de Dominios)
   - Encuentra tu dominio y haz clic en **Manage** (Gestionar)

3. **Configura los registros DNS**
   - Ve a la pestaña **Advanced DNS** (DNS Avanzado)
   - En la sección **Host Records** (Registros de Host)

4. **Elimina los registros existentes (IMPORTANTE)**
   - Si ves registros como `parkingpage.namecheap.com` o URL Redirects, **elimínalos primero**
   - Haz clic en el ícono de papelera (🗑️) al lado de cada registro antiguo
   - Estos registros pueden interferir con la configuración de Vercel

5. **Agrega los registros que Vercel te indicó**

   **Para el dominio principal (sin www):**
   - Haz clic en **ADD NEW RECORD** (botón rojo con +)
   - **Tipo**: Selecciona **A Record**
   - **Host**: Escribe `@` o déjalo en blanco
   - **Value**: La IP que Vercel te dio (ej: `76.76.21.21`)
   - **TTL**: Selecciona **30 min** o **Automatic**
   - Haz clic en el checkmark (✓) para guardar

   **Para el subdominio www (opcional pero recomendado):**
   - Haz clic en **ADD NEW RECORD** nuevamente
   - **Tipo**: Selecciona **CNAME Record**
   - **Host**: Escribe `www`
   - **Value**: `cname.vercel-dns.com` (o el que Vercel te indique)
   - **TTL**: Selecciona **30 min** o **Automatic**
   - Haz clic en el checkmark (✓) para guardar

6. **Verifica que solo tengas estos registros**
   - Deberías tener solo 2 registros: uno A Record para `@` y uno CNAME para `www`
   - Si hay otros registros que no reconoces, puedes dejarlos o eliminarlos según necesites

## Paso 3: Verificar en Vercel

1. **Vuelve a Vercel**
   - En la página de **Domains**, verás el estado de tu dominio
   - Inicialmente dirá "Pending" (Pendiente) o "Configuring" (Configurando)

2. **Espera la verificación**
   - Vercel verificará automáticamente los registros DNS
   - Esto puede tardar desde unos minutos hasta 48 horas
   - Normalmente toma entre 1-24 horas

3. **Cuando esté listo**
   - El estado cambiará a "Valid" (Válido)
   - Tu sitio estará disponible en `https://tudominio.com`

## Paso 4: Configurar SSL (Automático)

- Vercel configura automáticamente el certificado SSL
- Tu sitio estará disponible con HTTPS automáticamente
- No necesitas hacer nada adicional

## Paso 5: Actualizar AdSense (si aplica)

1. **Ve a Google AdSense**
   - Entra a https://www.google.com/adsense
   - Ve a **Sitios** en el menú

2. **Agrega tu nuevo dominio**
   - Haz clic en **Agregar sitio**
   - Ingresa `https://tudominio.com`
   - AdSense verificará automáticamente (el meta tag ya está en tu HTML)

3. **Elimina el dominio antiguo (opcional)**
   - Si tenías `fondarts.github.io/prode_mundial`, puedes eliminarlo
   - O mantenerlo si quieres seguir usando ambos

## Troubleshooting (Solución de Problemas)

### El dominio no se verifica después de 24 horas

1. **Verifica los registros DNS**
   - Usa una herramienta como https://dnschecker.org
   - Busca tu dominio y verifica que los registros A y CNAME estén correctos
   - Asegúrate de que apunten a los valores que Vercel te dio

2. **Verifica en Namecheap**
   - Asegúrate de que los registros estén guardados correctamente
   - Verifica que no haya errores de sintaxis

3. **Contacta a Namecheap**
   - Si todo parece correcto pero no funciona, contacta al soporte de Namecheap
   - Puede haber un problema con la propagación DNS

### El sitio carga pero muestra "Not Found"

- Esto significa que el DNS está funcionando pero Vercel no está sirviendo el sitio
- Verifica en Vercel que el dominio esté correctamente agregado
- Asegúrate de que el proyecto esté desplegado

### Quieres usar solo www o solo sin www

- Puedes configurar redirecciones en Vercel
- Ve a **Settings** > **Domains** > selecciona tu dominio
- Configura las redirecciones según prefieras

## Notas Importantes

- ⏱️ **Propagación DNS**: Puede tardar hasta 48 horas, pero normalmente es más rápido
- 🔒 **SSL**: Vercel configura HTTPS automáticamente, no necesitas hacer nada
- 🔄 **Actualizaciones**: Los cambios en tu código se desplegarán automáticamente en el dominio personalizado
- 📱 **Subdominios**: Si quieres agregar subdominios (ej: `api.tudominio.com`), sigue el mismo proceso pero usa CNAME

## Recursos Útiles

- [Documentación oficial de Vercel sobre dominios](https://vercel.com/docs/concepts/projects/domains)
- [Guía de Namecheap sobre DNS](https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-can-i-set-up-an-a-address-record-for-my-domain/)
- [Verificador de DNS](https://dnschecker.org)

