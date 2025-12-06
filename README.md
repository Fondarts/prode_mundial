# ⚽ Fixture Interactivo Mundial 2026

Sistema completo de predicciones para el Mundial de Fútbol 2026 con torneos entre amigos, autenticación y actualización automática de resultados.

## 🚀 Características

- **Grupos**: Predicciones interactivas para todos los grupos del Mundial 2026
- **Eliminatorias**: Bracket completo desde 16avos hasta la final
- **Torneos**: Sistema de torneos con códigos de 6 dígitos para competir con amigos
- **Autenticación**: Sistema simple de usuarios (nombre + clave de 5 dígitos)
- **Base de Datos**: Integración con Supabase para almacenamiento en la nube
- **API de Resultados**: Integración con API-Football para actualización automática
- **Sistema de Puntos**: 5 puntos (exacto), 3 puntos (acertado), 0 puntos (error)
- **Diseño Responsive**: Adaptado para móviles, tablets y desktop
- **Banners Publicitarios**: Espacios laterales para publicidad

## 📋 Requisitos

- Navegador web moderno
- Cuenta en Supabase (opcional, para base de datos)
- API Key de API-Football (opcional, para resultados automáticos)

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/Fondarts/prode_mundial.git
cd prode_mundial
```

2. Configura Supabase (opcional):
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Ejecuta el script `supabase-schema.sql` en el SQL Editor
   - Actualiza `supabase-config.js` con tus credenciales

3. Configura API-Football (opcional):
   - Regístrate en [API-Football](https://www.api-football.com/)
   - Obtén tu API Key
   - Actualiza `api-config.js` con tu API Key

4. Abre `index.html` en tu navegador o usa un servidor local

## 🌐 Despliegue Online

### GitHub Pages (Recomendado)

1. Ve a Settings > Pages en tu repositorio de GitHub
2. Selecciona la rama `main` como source
3. El sitio estará disponible en: `https://Fondarts.github.io/prode_mundial/`

### Netlify

1. Ve a [Netlify](https://www.netlify.com/)
2. Arrastra la carpeta del proyecto o conecta con GitHub
3. Deploy automático

### Vercel

1. Ve a [Vercel](https://vercel.com/)
2. Importa el repositorio de GitHub
3. Deploy automático

## 📖 Uso

1. **Registrarse/Iniciar Sesión**: Crea una cuenta o inicia sesión
2. **Hacer Predicciones**: Completa los resultados en la pestaña "Grupos"
3. **Enviar Predicciones**: Haz clic en "Enviar Predicciones" y crea o únete a un torneo
4. **Ver Eliminatorias**: La pestaña "Eliminatorias" muestra el bracket completo
5. **Ver Torneos**: La pestaña "Torneo" muestra tus torneos y la tabla global

## 🔧 Configuración

### Supabase

Ver `SUPABASE_SETUP.md` para instrucciones detalladas.

### API-Football

Ver `API_SETUP.md` para instrucciones detalladas.

## 📝 Estructura del Proyecto

```
prode_mundial/
├── index.html              # Página principal
├── styles.css              # Estilos
├── app.js                  # Lógica principal
├── data.js                 # Datos de grupos y equipos
├── torneo.js               # Sistema de torneos
├── auth-service.js         # Autenticación
├── auth-ui.js              # UI de autenticación
├── supabase-config.js      # Configuración Supabase
├── supabase-service.js     # Servicios Supabase
├── supabase-schema.sql     # Esquema de base de datos
├── api-config.js           # Configuración API
├── api-service.js          # Servicios API
└── README.md               # Este archivo
```

## 🎯 Próximas Mejoras

- [ ] Integración con API de resultados reales
- [ ] Notificaciones push
- [ ] Estadísticas avanzadas
- [ ] Modo admin mejorado
- [ ] Exportar/importar predicciones

## 📄 Licencia

Este proyecto es de código abierto.

## 👤 Autor

Federico Ondarts - [GitHub](https://github.com/Fondarts)
