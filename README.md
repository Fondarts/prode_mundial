# ⚽ Fixture Interactivo Mundial 2026

Aplicación web interactiva para predecir resultados y visualizar los cruces del Mundial de Fútbol 2026.

## Características

- **12 Grupos**: Visualiza los 12 grupos con sus 4 equipos cada uno
- **Predicciones de Partidos**: Ingresa los resultados de cada partido de la fase de grupos
- **Tabla de Posiciones**: Se calcula automáticamente según los resultados ingresados
- **Fases Eliminatorias**: Visualiza los cruces desde dieciseisavos de final hasta la final
- **Persistencia**: Los datos se guardan automáticamente en el navegador
- **Exportar/Importar**: Guarda y carga tus predicciones en formato JSON

## Cómo usar

1. Abre `index.html` en tu navegador
2. Ve a la pestaña "Grupos" para ingresar los resultados de los partidos
3. Las posiciones se calculan automáticamente
4. Navega por las pestañas de fases eliminatorias para ver los cruces
5. Ingresa los resultados de las eliminatorias para ver quién avanza

## Estructura del Proyecto

- `index.html` - Estructura principal de la aplicación
- `styles.css` - Estilos y diseño
- `app.js` - Lógica de la aplicación
- `data.js` - Datos de grupos y equipos del Mundial 2026

## Formato del Mundial 2026

- **48 equipos** divididos en **12 grupos** de 4 equipos
- Clasifican: **2 primeros de cada grupo** (24 equipos) + **8 mejores terceros** (8 equipos) = **32 equipos** a dieciseisavos
- Fases eliminatorias: Dieciseisavos → Octavos → Cuartos → Semifinales → Final

## Personalización

Puedes modificar los equipos y grupos en el archivo `data.js` según el sorteo oficial del Mundial 2026.

## Notas

- Los datos se guardan automáticamente en el localStorage del navegador
- Puedes exportar tus predicciones para compartirlas o guardarlas
- La aplicación calcula automáticamente las posiciones según puntos, diferencia de goles y goles a favor

