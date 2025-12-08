# Guía para Agregar Publicidad en los Banners Laterales

## Ubicación de los Banners

Los banners están ubicados en `index.html`:
- **Banner Izquierdo**: Líneas 12-22
- **Banner Derecho**: Líneas 81-91

## Opciones para Agregar Publicidad

### Opción 1: Google AdSense (Recomendado)

1. **Registrarse en Google AdSense**: https://www.google.com/adsense/
2. **Obtener tu ID de Publisher**: Formato `ca-pub-XXXXXXXXXX`
3. **Crear un anuncio vertical** (160x600 o 300x600)
4. **Reemplazar el código comentado** en los banners:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-TU_ID_DE_PUBLISHER"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-TU_ID_DE_PUBLISHER"
     data-ad-slot="TU_SLOT_ID"
     data-ad-format="vertical"
     data-full-width-responsive="false"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

**Pasos:**
1. Descomenta el código de AdSense (quita `<!--` y `-->`)
2. Reemplaza `TU_ID_DE_PUBLISHER` con tu ID real
3. Reemplaza `TU_SLOT_ID` con el ID del slot que te da AdSense
4. Elimina el placeholder temporal

### Opción 2: Banner Personalizado (Imagen)

Si tienes un banner propio o de un patrocinador:

```html
<a href="https://tu-enlace.com" target="_blank" rel="noopener noreferrer">
    <img src="ruta/a/tu-banner-160x600.jpg" alt="Publicidad" style="width: 100%; height: auto; display: block;">
</a>
```

**Pasos:**
1. Descomenta el código del banner personalizado
2. Reemplaza `https://tu-enlace.com` con el enlace real
3. Reemplaza `ruta/a/tu-banner-160x600.jpg` con la ruta a tu imagen
4. Asegúrate de que la imagen tenga 160px de ancho (altura flexible, recomendado 600px)
5. Elimina el placeholder temporal

### Opción 3: Código HTML Personalizado

Para cualquier otro servicio de publicidad o código personalizado:

```html
<div style="width: 100%; height: 600px; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
    <!-- Pega aquí el código de tu servicio de publicidad -->
    <!-- Ejemplo: Media.net, PropellerAds, etc. -->
</div>
```

**Pasos:**
1. Descomenta el div
2. Pega el código HTML/JavaScript de tu servicio de publicidad dentro del div
3. Elimina el placeholder temporal

## Dimensiones Recomendadas

- **Ancho**: 160px (fijo según el CSS)
- **Alto**: 600px (recomendado, pero flexible)
- **Formato**: Vertical (skyscraper)

## Notas Importantes

1. **Eliminar el placeholder**: Una vez que agregues publicidad real, elimina el div con el placeholder temporal
2. **Probar en diferentes navegadores**: Asegúrate de que la publicidad se vea bien en Chrome, Firefox, Safari, etc.
3. **Responsive**: Los banners se ocultan automáticamente en móviles (según el CSS)
4. **Performance**: Los scripts de publicidad pueden afectar el rendimiento, considera cargarlos de forma asíncrona

## Ejemplo Completo (Google AdSense)

```html
<aside class="banner-ad banner-left">
    <div class="banner-placeholder">
        <p>Publicidad</p>
        <div class="banner-content">
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
                 crossorigin="anonymous"></script>
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-1234567890123456"
                 data-ad-slot="1234567890"
                 data-ad-format="vertical"
                 data-full-width-responsive="false"></ins>
            <script>
                 (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
        </div>
    </div>
</aside>
```

## Servicios de Publicidad Alternativos

- **Media.net**: https://www.media.net/
- **PropellerAds**: https://propellerads.com/
- **Adsterra**: https://adsterra.com/
- **Ezoic**: https://www.ezoic.com/
- **Monumetric**: https://www.monumetric.com/

Cada servicio tiene su propio código de integración. Sigue las instrucciones de cada plataforma.

