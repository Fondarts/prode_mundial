// Configuración de API para resultados automáticos
// Opciones: 'football-data', 'api-football', 'sportmonks', 'manual'

const API_CONFIG = {
    // Tipo de API a usar
    provider: 'api-football', // Cambiar a 'manual' si no quieres usar API
    
    // Configuración para Football-Data.org (gratis con límites)
    footballData: {
        apiKey: '', // Obtener en https://www.football-data.org/
        baseUrl: 'https://api.football-data.org/v4',
        competitionId: null // ID de la competición (se configurará cuando esté disponible)
    },
    
    // Configuración para API-Football (https://www.api-football.com/)
    // Plan gratuito: 100 requests/día - No requiere tarjeta de crédito
    // Registrarse en: https://dashboard.api-football.com/
    apiFootball: {
        apiKey: 'fe5980d77da7dfc18baf8d7bf57ed382', // API Key configurada
        baseUrl: 'https://v3.football.api-sports.io',
        leagueId: 1, // FIFA World Cup (ID 1) - Verificar cuando el Mundial 2026 esté disponible
        season: 2026,
        // Nota: El leagueId puede necesitar ajustarse cuando el Mundial 2026 esté disponible
        // Puedes buscar el ID correcto en la documentación de API-Football
    },
    
    // Configuración para Sportmonks
    sportmonks: {
        apiKey: '', // Obtener en https://www.sportmonks.com/
        baseUrl: 'https://api.sportmonks.com/v3',
        leagueId: null
    },
    
    // Intervalo de actualización automática (en milisegundos)
    updateInterval: 60000, // 1 minuto por defecto
    
    // Activar/desactivar actualización automática
    autoUpdate: false,
    
    // Modo de prueba (simula resultados para testing)
    testMode: true // Activar para probar sin API real
};

// Función para verificar si hay una API configurada
function tieneApiConfigurada() {
    if (API_CONFIG.provider === 'manual') {
        return false;
    }
    
    switch (API_CONFIG.provider) {
        case 'football-data':
            return API_CONFIG.footballData.apiKey !== '';
        case 'api-football':
            return API_CONFIG.apiFootball.apiKey !== '';
        case 'sportmonks':
            return API_CONFIG.sportmonks.apiKey !== '';
        default:
            return false;
    }
}

// Función para obtener la configuración activa
function obtenerConfiguracionActiva() {
    switch (API_CONFIG.provider) {
        case 'football-data':
            return API_CONFIG.footballData;
        case 'api-football':
            return API_CONFIG.apiFootball;
        case 'sportmonks':
            return API_CONFIG.sportmonks;
        default:
            return null;
    }
}

