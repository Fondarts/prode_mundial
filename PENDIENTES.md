# 📋 Lista de Pendientes

## Tareas Pendientes para Futuras Actualizaciones

### 1. 🎨 Icono de la App
- [ ] Crear icono de la app (512x512px PNG)
- [ ] Crear iconos en diferentes tamaños (192x192, 512x512)
- [ ] Agregar iconos a la carpeta `icons/`
- [ ] Actualizar `manifest.json` con los iconos
- [ ] Actualizar configuración de Android para usar los iconos
- [ ] Probar que los iconos se muestren correctamente en la app

**Notas:**
- El icono debe ser PNG sin transparencia para Play Store
- Debe ser reconocible incluso en tamaños pequeños
- Considerar usar el logo del Mundial 2026 o un diseño relacionado

---

### 2. 📢 Agregar Publicidad a la App
- [ ] Investigar plataformas de publicidad (AdMob, etc.)
- [ ] Crear cuenta en la plataforma de publicidad elegida
- [ ] Integrar SDK de publicidad en el proyecto Android
- [ ] Agregar banners publicitarios en ubicaciones estratégicas:
  - [ ] Banner en la parte inferior de la pantalla principal
  - [ ] Banner entre grupos
  - [ ] Banner en la parte inferior de las plantillas de jugadores
- [ ] Implementar publicidad intersticial (opcional):
  - [ ] Al abrir la app (solo ocasionalmente)
  - [ ] Al cambiar de sección
- [ ] Probar la publicidad en modo de prueba
- [ ] Asegurar que la publicidad no afecte la experiencia del usuario
- [ ] Configurar políticas de privacidad relacionadas con publicidad

**Notas:**
- Esta tarea debe hacerse DESPUÉS de subir la app inicial
- Considerar usar Google AdMob (más común para Android)
- La publicidad debe ser discreta y no molestar al usuario

---

### 3. 📱 Corregir Paneles que no se Ven Bien en Móvil
- [ ] Revisar panel de selección de torneo
  - [ ] Ajustar tamaño de fuente
  - [ ] Ajustar espaciado y padding
  - [ ] Asegurar que los botones sean táctiles
  - [ ] Verificar que el contenido quepa en pantalla vertical
  - [ ] Probar en diferentes tamaños de pantalla
- [ ] Revisar otros paneles:
  - [ ] Panel de creación de torneo
  - [ ] Panel de configuración
  - [ ] Panel de resultados
  - [ ] Panel de estadísticas
- [ ] Aplicar media queries consistentes
- [ ] Probar en dispositivos reales (diferentes tamaños)

**Notas:**
- Priorizar el panel de selección de torneo
- Usar las mismas técnicas de responsive design ya aplicadas
- Asegurar que todos los elementos sean accesibles con el dedo

---

### 4. 📲 Compartir Link por WhatsApp para Unirse al Torneo ✅ COMPLETADO
- [x] Generar enlaces únicos para cada torneo
- [x] Implementar función de compartir:
  - [x] Botón "Invitar" en la página del torneo (con logo de WhatsApp)
  - [x] Opción de compartir por WhatsApp
- [x] Crear página de landing para unirse al torneo:
  - [x] Página que recibe el código del torneo por URL (`?torneo=CODIGO`)
  - [x] Validar que el torneo existe
  - [x] Mostrar información del torneo
  - [x] Botón para unirse (si el usuario está autenticado)
  - [x] Redirigir a login si no está autenticado
- [x] Formatear mensaje de WhatsApp con:
  - [x] Nombre del torneo
  - [x] Descripción breve
  - [x] Link directo para unirse
- [x] Limpiar URL después de unirse
- [x] Probar el flujo completo

**Notas:**
- El link debe ser corto y fácil de compartir
- Considerar usar un servicio de acortamiento de URLs
- El link debe funcionar tanto en web como en la app Android
- Implementar deep linking para abrir directamente en la app si está instalada

---

## Análisis de Dificultad

### 🟢 Fácil (1-2 horas)
**3. Corregir Paneles Móvil**
- ✅ Similar a lo que ya hicimos con las tablas de grupos
- ✅ Solo requiere CSS y ajustes de HTML
- ✅ El panel de selección de torneo está en `torneo.js` con estilos inline
- ✅ Ya tenemos experiencia con media queries para móvil
- **Dificultad**: ⭐⭐☆☆☆ (2/5)

### 🟡 Moderado (2-4 horas)
**1. Icono de la App**
- ⚠️ Técnicamente fácil (solo copiar archivos y configurar)
- ⚠️ Pero requiere diseño gráfico
- ✅ Si tienes un diseñador o usas herramientas online (Canva, etc.) es fácil
- ✅ Si no tienes habilidades de diseño, puede ser complicado crear algo profesional
- **Dificultad**: ⭐⭐☆☆☆ (2/5) técnicamente, ⭐⭐⭐⭐☆ (4/5) si necesitas diseñar

**2. Agregar Publicidad**
- ✅ Google AdMob tiene mucha documentación
- ✅ SDK bien documentado
- ⚠️ Requiere crear cuenta y configurar
- ⚠️ Necesita probar en modo de prueba
- ⚠️ Requiere actualizar políticas de privacidad
- **Dificultad**: ⭐⭐⭐☆☆ (3/5)

### ✅ Completado
**4. Compartir Link WhatsApp** ✅
- ✅ Página de landing implementada
- ✅ Manejo de autenticación y redirección
- ✅ Validación de torneo y mostrar información
- ✅ Generación de URLs únicas
- ✅ Compartir por WhatsApp funcionando
- ⚠️ Deep linking para Android (opcional, para futura mejora)
- **Estado**: Completado y funcionando

## Prioridad Sugerida

1. **Icono de la App** - Necesario para publicar en Play Store
2. **Corregir Paneles Móvil** - Mejora la experiencia del usuario (¡más fácil!)
3. ~~**Compartir Link WhatsApp**~~ ✅ **COMPLETADO**
4. **Agregar Publicidad** - Monetización (hacer después de tener usuarios)

---

## Notas Generales

- Todas estas tareas son para futuras actualizaciones
- Probar cada cambio en dispositivos reales antes de publicar
- Mantener la experiencia del usuario como prioridad
- Documentar cambios importantes en el código
