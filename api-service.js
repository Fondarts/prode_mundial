// Servicio para obtener resultados de partidos desde APIs externas

// Mapeo de nombres de equipos a IDs/nombres de la API
// Esto es necesario porque los nombres pueden variar entre nuestra app y la API
const MAPEO_EQUIPOS = {
    'México': ['Mexico', 'MEX', 'Mexican National Team'],
    'Sudáfrica': ['South Africa', 'RSA', 'South African National Team'],
    'Corea del Sur': ['South Korea', 'KOR', 'Korea Republic'],
    'Canadá': ['Canada', 'CAN', 'Canadian National Team'],
    'Qatar': ['Qatar', 'QAT', 'Qatari National Team'],
    'Suiza': ['Switzerland', 'SUI', 'Swiss National Team'],
    'Brasil': ['Brazil', 'BRA', 'Brazilian National Team'],
    'Marruecos': ['Morocco', 'MAR', 'Moroccan National Team'],
    'Haití': ['Haiti', 'HAI', 'Haitian National Team'],
    'Escocia': ['Scotland', 'SCO', 'Scottish National Team'],
    'USA': ['United States', 'USA', 'USMNT', 'United States National Team'],
    'Paraguay': ['Paraguay', 'PAR', 'Paraguayan National Team'],
    'Australia': ['Australia', 'AUS', 'Australian National Team'],
    // Agregar más equipos según sea necesario
};

// Función para normalizar nombres de equipos
function normalizarNombreEquipo(nombre) {
    // Buscar en el mapeo
    for (const [key, variants] of Object.entries(MAPEO_EQUIPOS)) {
        if (variants.includes(nombre) || key === nombre) {
            return key;
        }
    }
    return nombre;
}

// Función para obtener resultados desde Football-Data.org
async function obtenerResultadosFootballData(competitionId) {
    if (!tieneApiConfigurada() || API_CONFIG.provider !== 'football-data') {
        return null;
    }
    
    const config = API_CONFIG.footballData;
    
    try {
        const response = await fetch(`${config.baseUrl}/competitions/${competitionId}/matches`, {
            headers: {
                'X-Auth-Token': config.apiKey
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return procesarResultadosFootballData(data);
    } catch (error) {
        return null;
    }
}

// Función para procesar resultados de Football-Data.org
function procesarResultadosFootballData(data) {
    const resultados = {};
    
    if (data.matches) {
        data.matches.forEach(match => {
            if (match.status === 'FINISHED' && match.score) {
                const local = normalizarNombreEquipo(match.homeTeam.name);
                const visitante = normalizarNombreEquipo(match.awayTeam.name);
                const golesLocal = match.score.fullTime.home;
                const golesVisitante = match.score.fullTime.away;
                
                // Buscar el partido en nuestros grupos
                const partidoInfo = buscarPartidoEnGrupos(local, visitante);
                if (partidoInfo) {
                    if (!resultados[partidoInfo.grupoIndex]) {
                        resultados[partidoInfo.grupoIndex] = {};
                    }
                    resultados[partidoInfo.grupoIndex][partidoInfo.partidoIndex] = {
                        golesLocal: golesLocal,
                        golesVisitante: golesVisitante
                    };
                }
            }
        });
    }
    
    return resultados;
}

// Función para obtener resultados desde API-Football
// Documentación: https://www.api-football.com/documentation-v3
async function obtenerResultadosApiFootball(leagueId, season) {
    if (!tieneApiConfigurada() || API_CONFIG.provider !== 'api-football') {
        return null;
    }
    
    const config = API_CONFIG.apiFootball;
    
    if (!config.apiKey) {
        return null;
    }
    
    try {
        // Endpoint para obtener fixtures (partidos) de una liga y temporada
        // Si leagueId es null, intentar buscar el Mundial 2026
        let url = `${config.baseUrl}/fixtures`;
        const params = new URLSearchParams();
        
        if (leagueId) {
            params.append('league', leagueId);
        } else {
            // Buscar el Mundial (league ID 1 es típicamente FIFA World Cup)
            params.append('league', '1'); // FIFA World Cup
        }
        
        if (season) {
            params.append('season', season);
        }
        
        url += '?' + params.toString();
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': config.apiKey,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        
        // Verificar si hay errores en la respuesta
        if (data.errors && data.errors.length > 0) {
            return null;
        }
        
        return procesarResultadosApiFootball(data);
    } catch (error) {
        return null;
    }
}

// Función para procesar resultados de API-Football
function procesarResultadosApiFootball(data) {
    const resultados = {};
    
    // API-Football devuelve los datos en data.response
    if (data.response && Array.isArray(data.response)) {
        data.response.forEach(fixture => {
            // Verificar que el partido esté finalizado
            // FT = Full Time, AET = After Extra Time, PEN = Penalties
            const status = fixture.fixture.status.short;
            if (status === 'FT' || status === 'AET' || status === 'PEN') {
                const localNombre = fixture.teams.home.name;
                const visitanteNombre = fixture.teams.away.name;
                const golesLocal = fixture.goals.home !== null ? fixture.goals.home : 0;
                const golesVisitante = fixture.goals.away !== null ? fixture.goals.away : 0;
                
                // Normalizar nombres de equipos
                const local = normalizarNombreEquipo(localNombre);
                const visitante = normalizarNombreEquipo(visitanteNombre);
                
                // Buscar el partido en nuestros grupos
                const partidoInfo = buscarPartidoEnGrupos(local, visitante);
                if (partidoInfo) {
                    if (!resultados[partidoInfo.grupoIndex]) {
                        resultados[partidoInfo.grupoIndex] = {};
                    }
                    resultados[partidoInfo.grupoIndex][partidoInfo.partidoIndex] = {
                        golesLocal: golesLocal,
                        golesVisitante: golesVisitante
                    };
                } else {
                    // Log para debugging - ver qué partidos no se encontraron
                }
            }
        });
    } else {
    }
    
    return resultados;
}

// Función auxiliar para buscar un partido en nuestros grupos
function buscarPartidoEnGrupos(equipoLocal, equipoVisitante) {
    if (typeof GRUPOS_MUNDIAL_2026 === 'undefined') {
        return null;
    }
    
    for (let grupoIndex = 0; grupoIndex < GRUPOS_MUNDIAL_2026.length; grupoIndex++) {
        const grupo = GRUPOS_MUNDIAL_2026[grupoIndex];
        
        for (let partidoIndex = 0; partidoIndex < grupo.partidos.length; partidoIndex++) {
            const partido = grupo.partidos[partidoIndex];
            
            // Usar la función obtenerNombreEquipo si está disponible
            let local, visitante;
            if (typeof obtenerNombreEquipo === 'function') {
                local = obtenerNombreEquipo(grupo, grupoIndex, partido.local);
                visitante = obtenerNombreEquipo(grupo, grupoIndex, partido.visitante);
            } else {
                local = grupo.equipos[partido.local];
                visitante = grupo.equipos[partido.visitante];
            }
            
            if ((local === equipoLocal && visitante === equipoVisitante) ||
                (local === equipoVisitante && visitante === equipoLocal)) {
                return { grupoIndex, partidoIndex, partido };
            }
        }
    }
    return null;
}

// Función principal para obtener resultados
async function obtenerResultadosAPI() {
    if (!tieneApiConfigurada()) {
        return null;
    }
    
    switch (API_CONFIG.provider) {
        case 'football-data':
            return await obtenerResultadosFootballData(API_CONFIG.footballData.competitionId);
        case 'api-football':
            return await obtenerResultadosApiFootball(
                API_CONFIG.apiFootball.leagueId,
                API_CONFIG.apiFootball.season
            );
        case 'sportmonks':
            // Implementar cuando sea necesario
            return null;
        default:
            return null;
    }
}

// Caché de resultados de API
let cacheResultadosAPI = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función para actualizar resultados en la aplicación
async function actualizarResultadosDesdeAPI() {
    let resultadosAPI;
    
    // Verificar caché
    const ahora = Date.now();
    if (cacheResultadosAPI && cacheTimestamp && (ahora - cacheTimestamp) < CACHE_DURATION) {
        resultadosAPI = cacheResultadosAPI;
    } else {
        if (API_CONFIG.testMode) {
            // Modo de prueba: simular algunos resultados
            resultadosAPI = simularResultados();
        } else {
            resultadosAPI = await obtenerResultadosAPI();
        }
        
        // Guardar en caché
        if (resultadosAPI && Object.keys(resultadosAPI).length > 0) {
            cacheResultadosAPI = resultadosAPI;
            cacheTimestamp = ahora;
        }
    }
    
    if (!resultadosAPI || Object.keys(resultadosAPI).length === 0) {
        return { exito: false, mensaje: 'No se encontraron resultados nuevos' };
    }
    
    // Actualizar resultados en la aplicación
    let actualizados = 0;
    for (const grupoIndex in resultadosAPI) {
        const grupoNum = parseInt(grupoIndex);
        if (!resultados[grupoNum]) {
            resultados[grupoNum] = { partidos: [], posiciones: [], playoffSelecciones: {} };
        }
        
        for (const partidoIndex in resultadosAPI[grupoIndex]) {
            const partidoNum = parseInt(partidoIndex);
            const resultado = resultadosAPI[grupoIndex][partidoIndex];
            
            if (!resultados[grupoNum].partidos[partidoNum]) {
                resultados[grupoNum].partidos[partidoNum] = {};
            }
            
            // Solo actualizar si el resultado es diferente o no existe
            const resultadoActual = resultados[grupoNum].partidos[partidoNum];
            if (!resultadoActual.golesLocal || 
                resultadoActual.golesLocal !== resultado.golesLocal ||
                resultadoActual.golesVisitante !== resultado.golesVisitante) {
                resultados[grupoNum].partidos[partidoNum].golesLocal = resultado.golesLocal;
                resultados[grupoNum].partidos[partidoNum].golesVisitante = resultado.golesVisitante;
                actualizados++;
            }
        }
    }
    
    // Guardar resultados
    guardarResultados();
    
    // Actualizar interfaz
    if (typeof renderizarGrupos === 'function') {
        renderizarGrupos();
    }
    if (typeof actualizarEliminatorias === 'function') {
        actualizarEliminatorias();
    }
    
    // Actualizar en Supabase si está configurado
    if (typeof guardarResultadoRealSupabase === 'function') {
        for (const grupoIndex in resultadosAPI) {
            for (const partidoIndex in resultadosAPI[grupoIndex]) {
                const resultado = resultadosAPI[grupoIndex][partidoIndex];
                // Aquí se actualizaría en Supabase para cada torneo activo
            }
        }
    }
    
    return { exito: true, mensaje: `Se actualizaron ${actualizados} resultados`, actualizados };
}

// Función para simular resultados (modo de prueba)
function simularResultados() {
    if (typeof GRUPOS_MUNDIAL_2026 === 'undefined') {
        return {};
    }
    
    // Simular resultados realistas para varios grupos
    const resultadosSimulados = {};
    
    // Grupo A - Simular algunos partidos
    if (GRUPOS_MUNDIAL_2026[0]) {
        resultadosSimulados[0] = {
            0: { golesLocal: 2, golesVisitante: 1 }, // México vs Sudáfrica
            1: { golesLocal: 1, golesVisitante: 0 },  // Corea del Sur vs Playoff D
            2: { golesLocal: 3, golesVisitante: 1 },  // México vs Corea del Sur
            3: { golesVisitante: 2, golesLocal: 0 }  // Sudáfrica vs Playoff D (invertido)
        };
    }
    
    // Grupo B - Simular algunos partidos
    if (GRUPOS_MUNDIAL_2026[1]) {
        resultadosSimulados[1] = {
            0: { golesLocal: 1, golesVisitante: 1 }, // Canadá vs Playoff B1
            1: { golesLocal: 0, golesVisitante: 2 },  // Qatar vs Suiza
            2: { golesLocal: 2, golesVisitante: 0 },  // Canadá vs Qatar
            3: { golesLocal: 1, golesVisitante: 1 }   // Playoff B1 vs Suiza
        };
    }
    
    // Grupo C - Simular algunos partidos
    if (GRUPOS_MUNDIAL_2026[2]) {
        resultadosSimulados[2] = {
            0: { golesLocal: 2, golesVisitante: 0 }, // Brasil vs Marruecos
            1: { golesLocal: 1, golesVisitante: 1 },  // Haití vs Escocia
            2: { golesLocal: 4, golesVisitante: 1 },  // Brasil vs Haití
            3: { golesLocal: 0, golesVisitante: 2 }   // Marruecos vs Escocia
        };
    }
    
    // Grupo D - Simular algunos partidos
    if (GRUPOS_MUNDIAL_2026[3]) {
        resultadosSimulados[3] = {
            0: { golesLocal: 1, golesVisitante: 0 }, // USA vs Paraguay
            1: { golesLocal: 2, golesVisitante: 1 }, // Australia vs Playoff C
            2: { golesLocal: 2, golesVisitante: 2 }, // USA vs Australia
            3: { golesLocal: 0, golesVisitante: 1 }  // Paraguay vs Playoff C
        };
    }
    
    // Agregar más grupos si existen
    for (let i = 4; i < Math.min(GRUPOS_MUNDIAL_2026.length, 8); i++) {
        if (GRUPOS_MUNDIAL_2026[i]) {
            resultadosSimulados[i] = {
                0: { golesLocal: Math.floor(Math.random() * 3) + 1, golesVisitante: Math.floor(Math.random() * 2) },
                1: { golesLocal: Math.floor(Math.random() * 2), golesVisitante: Math.floor(Math.random() * 3) + 1 },
                2: { golesLocal: Math.floor(Math.random() * 2) + 1, golesVisitante: Math.floor(Math.random() * 2) },
                3: { golesLocal: Math.floor(Math.random() * 2), golesVisitante: Math.floor(Math.random() * 2) + 1 }
            };
        }
    }
    
    return resultadosSimulados;
}

// Variable para el intervalo de actualización automática
let intervaloActualizacion = null;

// Función para iniciar actualización automática
function iniciarActualizacionAutomatica() {
    if (intervaloActualizacion) {
        clearInterval(intervaloActualizacion);
    }
    
    if (API_CONFIG.autoUpdate && tieneApiConfigurada()) {
        intervaloActualizacion = setInterval(async () => {
            await actualizarResultadosDesdeAPI();
        }, API_CONFIG.updateInterval);
        
        // Primera actualización inmediata
        actualizarResultadosDesdeAPI();
    }
}

// Función para detener actualización automática
function detenerActualizacionAutomatica() {
    if (intervaloActualizacion) {
        clearInterval(intervaloActualizacion);
        intervaloActualizacion = null;
    }
}

// Hacer funciones disponibles globalmente
window.iniciarActualizacionAutomatica = iniciarActualizacionAutomatica;
window.detenerActualizacionAutomatica = detenerActualizacionAutomatica;
window.actualizarResultadosDesdeAPI = actualizarResultadosDesdeAPI;

