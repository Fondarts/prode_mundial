# 📱 Crear Iconos para la App

La app necesita iconos en diferentes tamaños. Aquí te explico cómo crearlos.

## Iconos Necesarios

### Para PWA (manifest.json)
- `icon-192.png` - 192x192 píxeles
- `icon-512.png` - 512x512 píxeles

### Para Android
- Múltiples tamaños (se generan automáticamente desde un icono base)

## Opciones para Crear los Iconos

### Opción 1: Herramientas Online (Recomendado)

1. **PWA Asset Generator** (Más fácil)
   - Ve a: https://www.pwabuilder.com/imageGenerator
   - Sube una imagen cuadrada (mínimo 512x512px)
   - Descarga los iconos generados
   - Coloca `icon-192.png` e `icon-512.png` en la raíz del proyecto

2. **RealFaviconGenerator**
   - Ve a: https://realfavicongenerator.net/
   - Sube tu imagen
   - Descarga y coloca los archivos

### Opción 2: Capacitor Assets (Para Android)

Después de instalar Capacitor, puedes usar:

```bash
npx @capacitor/assets generate --iconBackgroundColor '#1a1a2e' --iconBackgroundColorDark '#1a1a2e' --splashBackgroundColor '#1a1a2e' --splashBackgroundColorDark '#1a1a2e'
```

Esto requiere que tengas un archivo `icon.png` (1024x1024px) en la raíz.

### Opción 3: Crear Manualmente

1. Crea una imagen cuadrada de 1024x1024 píxeles
2. Usa un editor de imágenes (Photoshop, GIMP, Canva, etc.)
3. Exporta en los tamaños necesarios:
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)

## Diseño del Icono

Sugerencias para el diseño:
- **Fondo**: Usa el color de tu tema (#1a1a2e o similar)
- **Elemento principal**: Un balón de fútbol, el logo del Mundial, o algo relacionado
- **Texto**: Si incluyes texto, que sea legible en tamaños pequeños
- **Forma**: Cuadrada, pero el diseño puede ser circular dentro

## Colocar los Iconos

Una vez creados, coloca los archivos en la raíz del proyecto:
```
mundial/
├── icon-192.png
├── icon-512.png
└── ...
```

## Verificar

Después de agregar los iconos:
1. Recarga la página web
2. Verifica que el manifest.json los encuentre
3. En Android, los iconos se generarán automáticamente cuando compiles

## Nota Temporal

Si no tienes los iconos aún, la app funcionará igual, pero:
- No se verá bien cuando se instale como PWA
- Android usará un icono por defecto

Puedes continuar con el desarrollo y agregar los iconos después.



