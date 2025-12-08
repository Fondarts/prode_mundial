// Datos del Mundial 2026
// 12 grupos de 4 equipos cada uno

// Calendario del Mundial 2026 - Horarios oficiales
// El Mundial 2026 se jugará del 11 de junio al 19 de julio de 2026
// NOTA: Los horarios almacenados aquí están en hora de Madrid (España) - UTC+2 en verano
// Estos horarios se convierten automáticamente a la zona horaria local del usuario
// Mapeo directo de partidos a horarios oficiales basado en equipos y fechas

// Función para convertir horario desde Madrid (UTC+2 en verano) a la zona horaria del usuario
function convertirHorarioAMadridPrecisa(fecha, horario) {
    if (!fecha || !horario) return { fecha: '', horario: '' };
    
    try {
        // Parsear fecha y horario
        const [year, month, day] = fecha.split('-');
        const [hours, minutes] = horario.split(':');
        
        // Crear fecha en Madrid (UTC+2 en verano)
        // Usar formato ISO con offset explícito
        const fechaMadridISO = `${year}-${month}-${day}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00+02:00`;
        const fechaMadrid = new Date(fechaMadridISO);
        
        // Obtener zona horaria del usuario
        const usuarioTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Formatear en la zona horaria del usuario
        const fechaUsuarioStr = fechaMadrid.toLocaleString('en-US', {
            timeZone: usuarioTimezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        
        // Parsear la fecha formateada
        const [fechaPart, horaPart] = fechaUsuarioStr.split(', ');
        const [mes, dia, año] = fechaPart.split('/');
        const [horas, minutos] = horaPart.split(':');
        
        const fechaFormateada = `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        const horarioFormateado = `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}`;
        
        return { fecha: fechaFormateada, horario: horarioFormateado };
    } catch (error) {
        return { fecha: fecha, horario: horario };
    }
}
// Estructura: [grupoIndex][partidoIndex] = { fecha, horario }
const MAPEO_HORARIOS_PARTIDOS = {
    // Grupo A
    0: {
        0: { fecha: '2026-06-11', horario: '20:00' }, // México vs Sudáfrica
        1: { fecha: '2026-06-12', horario: '03:00' }, // Corea del Sur vs Playoff D
        2: { fecha: '2026-06-17', horario: '02:00' }, // México vs Corea del Sur
        3: { fecha: '2026-06-16', horario: '19:00' }, // Playoff D vs Sudáfrica
        4: { fecha: '2026-06-21', horario: '04:00' }, // Playoff D vs México
        5: { fecha: '2026-06-21', horario: '04:00' }  // Sudáfrica vs Corea del Sur
    },
    // Grupo B
    1: {
        0: { fecha: '2026-06-11', horario: '22:00' }, // Canadá vs Playoff B1
        1: { fecha: '2026-06-11', horario: '19:00' }, // Catar vs Suiza
        2: { fecha: '2026-06-16', horario: '22:00' }, // Canadá vs Catar
        3: { fecha: '2026-06-16', horario: '19:00' }, // Suiza vs Playoff B1
        4: { fecha: '2026-06-20', horario: '19:00' }, // Suiza vs Canadá
        5: { fecha: '2026-06-20', horario: '19:00' }  // Playoff B1 vs Catar
    },
    // Grupo C
    2: {
        0: { fecha: '2026-06-12', horario: '01:00' }, // Brasil vs Marruecos
        1: { fecha: '2026-06-12', horario: '04:00' }, // Haití vs Escocia
        2: { fecha: '2026-06-17', horario: '04:00' }, // Brasil vs Haití
        3: { fecha: '2026-06-17', horario: '01:00' }, // Escocia vs Marruecos
        4: { fecha: '2026-06-21', horario: '01:00' }, // Escocia vs Brasil
        5: { fecha: '2026-06-21', horario: '01:00' }  // Marruecos vs Haití
    },
    // Grupo D
    3: {
        0: { fecha: '2026-06-12', horario: '01:00' }, // USA vs Paraguay
        1: { fecha: '2026-06-12', horario: '04:00' }, // Australia vs Playoff C
        2: { fecha: '2026-06-16', horario: '19:00' }, // USA vs Australia
        3: { fecha: '2026-06-17', horario: '04:00' }, // Playoff C vs Paraguay
        4: { fecha: '2026-06-21', horario: '02:00' }, // Playoff C vs USA
        5: { fecha: '2026-06-21', horario: '02:00' }  // Paraguay vs Australia
    },
    // Grupo E
    4: {
        0: { fecha: '2026-06-11', horario: '19:00' }, // Alemania vs Curazao
        1: { fecha: '2026-06-12', horario: '02:00' }, // Costa de Marfil vs Ecuador
        2: { fecha: '2026-06-16', horario: '23:00' }, // Alemania vs Costa de Marfil
        3: { fecha: '2026-06-17', horario: '02:00' }, // Ecuador vs Curazao
        4: { fecha: '2026-06-20', horario: '23:00' }, // Ecuador vs Alemania
        5: { fecha: '2026-06-20', horario: '23:00' }  // Curazao vs Costa de Marfil
    },
    // Grupo F
    5: {
        0: { fecha: '2026-06-11', horario: '20:00' }, // Países Bajos vs Japón
        1: { fecha: '2026-06-12', horario: '03:00' }, // Playoff B2 vs Túnez
        2: { fecha: '2026-06-16', horario: '19:00' }, // Países Bajos vs Playoff B2
        3: { fecha: '2026-06-17', horario: '05:00' }, // Túnez vs Japón
        4: { fecha: '2026-06-21', horario: '01:00' }, // Túnez vs Países Bajos
        5: { fecha: '2026-06-21', horario: '01:00' }  // Japón vs Playoff B2
    },
    // Grupo G
    6: {
        0: { fecha: '2026-06-11', horario: '19:00' }, // Bélgica vs Egipto
        1: { fecha: '2026-06-12', horario: '01:00' }, // Irán vs Nueva Zelanda
        2: { fecha: '2026-06-16', horario: '19:00' }, // Bélgica vs Irán
        3: { fecha: '2026-06-17', horario: '01:00' }, // Nueva Zelanda vs Egipto
        4: { fecha: '2026-06-21', horario: '03:00' }, // Nueva Zelanda vs Bélgica
        5: { fecha: '2026-06-21', horario: '03:00' }  // Egipto vs Irán
    },
    // Grupo H
    7: {
        0: { fecha: '2026-06-11', horario: '21:00' }, // España vs Cabo Verde
        1: { fecha: '2026-06-12', horario: '01:00' }, // Arabia Saudita vs Uruguay
        2: { fecha: '2026-06-16', horario: '19:00' }, // España vs Arabia Saudita
        3: { fecha: '2026-06-17', horario: '01:00' }, // Uruguay vs Cabo Verde
        4: { fecha: '2026-06-21', horario: '01:00' }, // Uruguay vs España
        5: { fecha: '2026-06-21', horario: '01:00' }  // Cabo Verde vs Arabia Saudita
    },
    // Grupo I
    8: {
        0: { fecha: '2026-06-11', horario: '20:00' }, // Francia vs Senegal
        1: { fecha: '2026-06-12', horario: '01:00' }, // Playoff 2 vs Noruega
        2: { fecha: '2026-06-16', horario: '22:00' }, // Francia vs Playoff 2
        3: { fecha: '2026-06-17', horario: '03:00' }, // Noruega vs Senegal
        4: { fecha: '2026-06-20', horario: '20:00' }, // Noruega vs Francia
        5: { fecha: '2026-06-20', horario: '20:00' }  // Senegal vs Playoff 2
    },
    // Grupo J
    9: {
        0: { fecha: '2026-06-12', horario: '03:00' }, // Argentina vs Argelia
        1: { fecha: '2026-06-12', horario: '04:00' }, // Austria vs Jordania
        2: { fecha: '2026-06-16', horario: '19:00' }, // Argentina vs Austria
        3: { fecha: '2026-06-17', horario: '03:00' }, // Jordania vs Argelia
        4: { fecha: '2026-06-21', horario: '04:00' }, // Jordania vs Argentina
        5: { fecha: '2026-06-21', horario: '04:00' }  // Argelia vs Austria
    },
    // Grupo K
    10: {
        0: { fecha: '2026-06-11', horario: '19:00' }, // Portugal vs Playoff 1
        1: { fecha: '2026-06-12', horario: '03:00' }, // Uzbekistán vs Colombia
        2: { fecha: '2026-06-16', horario: '19:00' }, // Portugal vs Uzbekistán
        3: { fecha: '2026-06-17', horario: '03:00' }, // Colombia vs Playoff 1
        4: { fecha: '2026-06-21', horario: '02:30' }, // Colombia vs Portugal
        5: { fecha: '2026-06-21', horario: '02:30' }  // Playoff 1 vs Uzbekistán
    },
    // Grupo L
    11: {
        0: { fecha: '2026-06-11', horario: '20:00' }, // Inglaterra vs Croacia
        1: { fecha: '2026-06-12', horario: '02:00' }, // Ghana vs Panamá
        2: { fecha: '2026-06-16', horario: '21:00' }, // Inglaterra vs Ghana
        3: { fecha: '2026-06-17', horario: '02:00' }, // Panamá vs Croacia
        4: { fecha: '2026-06-20', horario: '20:00' }, // Panamá vs Inglaterra
        5: { fecha: '2026-06-20', horario: '20:00' }  // Croacia vs Ghana
    }
};

// Función para obtener fecha y horario de un partido
// Convierte automáticamente desde hora de Madrid a la zona horaria del usuario
function obtenerFechaHorarioPartido(grupoIndex, partidoIndex) {
    const grupo = GRUPOS_MUNDIAL_2026[grupoIndex];
    if (!grupo || !grupo.partidos[partidoIndex]) {
        return { fecha: '', horario: '' };
    }
    
    // Obtener horario en hora de Madrid
    let horarioMadrid = null;
    if (MAPEO_HORARIOS_PARTIDOS[grupoIndex] && MAPEO_HORARIOS_PARTIDOS[grupoIndex][partidoIndex]) {
        horarioMadrid = MAPEO_HORARIOS_PARTIDOS[grupoIndex][partidoIndex];
    } else {
        return { fecha: '', horario: '' };
    }
    
    // Convertir a la zona horaria del usuario
    return convertirHorarioAMadridPrecisa(horarioMadrid.fecha, horarioMadrid.horario);
}

// Mapeo de playoffs a sus opciones
const PLAYOFFS_OPCIONES = {
    'Playoff D': ['Rep. Checa', 'Irlanda', 'Dinamarca', 'Macedonia del Norte'],
    'Playoff B1': ['Gales', 'Bosnia', 'Italia', 'Irlanda del Norte'],
    'Playoff C': ['Eslovaquia', 'Kosovo', 'Turquía', 'Rumania'],
    'Playoff B2': ['Ucrania', 'Suecia', 'Polonia', 'Albania'],
    'Playoff 2': ['Bolivia', 'Surinam', 'Irak'],
    'Playoff 1': ['Nueva Caledonia', 'Jamaica', 'RD Congo']
};

const GRUPOS_MUNDIAL_2026 = [
    {
        nombre: 'Grupo A',
        equipos: ['México', 'Sudáfrica', 'Corea del Sur', 'Playoff D'],
        partidos: [
            { local: 0, visitante: 1, fecha: 1 },
            { local: 2, visitante: 3, fecha: 1 },
            { local: 0, visitante: 2, fecha: 2 },
            { local: 1, visitante: 3, fecha: 2 },
            { local: 0, visitante: 3, fecha: 3 },
            { local: 1, visitante: 2, fecha: 3 }
        ]
    },
    {
        nombre: 'Grupo B',
        equipos: ['Canadá', 'Playoff B1', 'Qatar', 'Suiza'],
        partidos: [
            { local: 0, visitante: 1, fecha: 1 },
            { local: 2, visitante: 3, fecha: 1 },
            { local: 0, visitante: 2, fecha: 2 },
            { local: 1, visitante: 3, fecha: 2 },
            { local: 0, visitante: 3, fecha: 3 },
            { local: 1, visitante: 2, fecha: 3 }
        ]
    },
    {
        nombre: 'Grupo C',
        equipos: ['Brasil', 'Marruecos', 'Haití', 'Escocia'],
        partidos: [
            { local: 0, visitante: 1, fecha: 1 },
            { local: 2, visitante: 3, fecha: 1 },
            { local: 0, visitante: 2, fecha: 2 },
            { local: 1, visitante: 3, fecha: 2 },
            { local: 0, visitante: 3, fecha: 3 },
            { local: 1, visitante: 2, fecha: 3 }
        ]
    },
    {
        nombre: 'Grupo D',
        equipos: ['USA', 'Paraguay', 'Australia', 'Playoff C'],
        partidos: [
            { local: 0, visitante: 1, fecha: 1 },
            { local: 2, visitante: 3, fecha: 1 },
            { local: 0, visitante: 2, fecha: 2 },
            { local: 1, visitante: 3, fecha: 2 },
            { local: 0, visitante: 3, fecha: 3 },
            { local: 1, visitante: 2, fecha: 3 }
        ]
    },
    {
        nombre: 'Grupo E',
        equipos: ['Alemania', 'Curaçao', 'C de Marfil', 'Ecuador'],
        partidos: [
            { local: 0, visitante: 1, fecha: 1 },
            { local: 2, visitante: 3, fecha: 1 },
            { local: 0, visitante: 2, fecha: 2 },
            { local: 1, visitante: 3, fecha: 2 },
            { local: 0, visitante: 3, fecha: 3 },
            { local: 1, visitante: 2, fecha: 3 }
        ]
    },
    {
        nombre: 'Grupo F',
        equipos: ['Holanda', 'Japón', 'Playoff B2', 'Túnez'],
        partidos: [
            { local: 0, visitante: 1, fecha: 1 },
            { local: 2, visitante: 3, fecha: 1 },
            { local: 0, visitante: 2, fecha: 2 },
            { local: 1, visitante: 3, fecha: 2 },
            { local: 0, visitante: 3, fecha: 3 },
            { local: 1, visitante: 2, fecha: 3 }
        ]
    },
    {
        nombre: 'Grupo G',
        equipos: ['Bélgica', 'Egipto', 'Irán', 'N. Zelanda'],
        partidos: [
            { local: 0, visitante: 1, fecha: 1 },
            { local: 2, visitante: 3, fecha: 1 },
            { local: 0, visitante: 2, fecha: 2 },
            { local: 1, visitante: 3, fecha: 2 },
            { local: 0, visitante: 3, fecha: 3 },
            { local: 1, visitante: 2, fecha: 3 }
        ]
    },
    {
        nombre: 'Grupo H',
        equipos: ['España', 'Cabo Verde', 'Arabia Saudí', 'Uruguay'],
        partidos: [
            { local: 0, visitante: 1, fecha: 1 },
            { local: 2, visitante: 3, fecha: 1 },
            { local: 0, visitante: 2, fecha: 2 },
            { local: 1, visitante: 3, fecha: 2 },
            { local: 0, visitante: 3, fecha: 3 },
            { local: 1, visitante: 2, fecha: 3 }
        ]
    },
    {
        nombre: 'Grupo I',
        equipos: ['Francia', 'Senegal', 'Playoff 2', 'Noruega'],
        partidos: [
            { local: 0, visitante: 1, fecha: 1 },
            { local: 2, visitante: 3, fecha: 1 },
            { local: 0, visitante: 2, fecha: 2 },
            { local: 1, visitante: 3, fecha: 2 },
            { local: 0, visitante: 3, fecha: 3 },
            { local: 1, visitante: 2, fecha: 3 }
        ]
    },
    {
        nombre: 'Grupo J',
        equipos: ['Argentina', 'Argelia', 'Austria', 'Jordania'],
        partidos: [
            { local: 0, visitante: 1, fecha: 1 },
            { local: 2, visitante: 3, fecha: 1 },
            { local: 0, visitante: 2, fecha: 2 },
            { local: 1, visitante: 3, fecha: 2 },
            { local: 0, visitante: 3, fecha: 3 },
            { local: 1, visitante: 2, fecha: 3 }
        ]
    },
    {
        nombre: 'Grupo K',
        equipos: ['Portugal', 'Playoff 1', 'Colombia', 'Uzbekistán'],
        partidos: [
            { local: 0, visitante: 1, fecha: 1 },
            { local: 2, visitante: 3, fecha: 1 },
            { local: 0, visitante: 2, fecha: 2 },
            { local: 1, visitante: 3, fecha: 2 },
            { local: 0, visitante: 3, fecha: 3 },
            { local: 1, visitante: 2, fecha: 3 }
        ]
    },
    {
        nombre: 'Grupo L',
        equipos: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'],
        partidos: [
            { local: 0, visitante: 1, fecha: 1 },
            { local: 2, visitante: 3, fecha: 1 },
            { local: 0, visitante: 2, fecha: 2 },
            { local: 1, visitante: 3, fecha: 2 },
            { local: 0, visitante: 3, fecha: 3 },
            { local: 1, visitante: 2, fecha: 3 }
        ]
    }
];

// Estructura para almacenar resultados
let resultados = {};

// Estructura para almacenar qué partidos ya se jugaron (resultados reales bloqueados)
let partidosJugados = {};

// Inicializar resultados vacíos
function inicializarResultados() {
    resultados = {};
    GRUPOS_MUNDIAL_2026.forEach((grupo, grupoIndex) => {
        resultados[grupoIndex] = {
            partidos: grupo.partidos.map(() => ({ golesLocal: '', golesVisitante: '' })),
            posiciones: [],
            playoffSelecciones: {}
        };
        
        // Inicializar selecciones de playoffs
        grupo.equipos.forEach((equipo, equipoIndex) => {
            if (PLAYOFFS_OPCIONES[equipo]) {
                resultados[grupoIndex].playoffSelecciones[equipoIndex] = '';
            }
        });
    });
    
    // Cargar desde localStorage si existe
    const guardado = localStorage.getItem('mundial2026_resultados');
    if (guardado) {
        try {
            resultados = JSON.parse(guardado);
            // Asegurar que playoffSelecciones existe para cada grupo
            GRUPOS_MUNDIAL_2026.forEach((grupo, grupoIndex) => {
                if (!resultados[grupoIndex]) {
                    resultados[grupoIndex] = {
                        partidos: grupo.partidos.map(() => ({ golesLocal: '', golesVisitante: '' })),
                        posiciones: [],
                        playoffSelecciones: {}
                    };
                }
                if (!resultados[grupoIndex].playoffSelecciones) {
                    resultados[grupoIndex].playoffSelecciones = {};
                }
                grupo.equipos.forEach((equipo, equipoIndex) => {
                    if (PLAYOFFS_OPCIONES[equipo] && !resultados[grupoIndex].playoffSelecciones[equipoIndex]) {
                        resultados[grupoIndex].playoffSelecciones[equipoIndex] = '';
                    }
                });
            });
        } catch (e) {
        }
    }
    
    // Cargar partidos jugados
    cargarPartidosJugados();
}

// Guardar resultados en localStorage
function guardarResultados() {
    localStorage.setItem('mundial2026_resultados', JSON.stringify(resultados));
}

// Función para verificar si un partido ya se jugó
function partidoYaJugado(grupoIndex, partidoIndex) {
    if (!partidosJugados[grupoIndex]) return false;
    return partidosJugados[grupoIndex][partidoIndex] === true;
}

// Función para marcar un partido como jugado
function marcarPartidoJugado(grupoIndex, partidoIndex) {
    if (!partidosJugados[grupoIndex]) {
        partidosJugados[grupoIndex] = {};
    }
    partidosJugados[grupoIndex][partidoIndex] = true;
    guardarPartidosJugados();
}

// Función para verificar si un partido de eliminatoria ya se jugó
function partidoEliminatoriaYaJugado(fase, partidoIndex) {
    if (!partidosJugados[fase]) return false;
    return partidosJugados[fase][partidoIndex] === true;
}

// Función para marcar un partido de eliminatoria como jugado
function marcarPartidoEliminatoriaJugado(fase, partidoIndex) {
    if (!partidosJugados[fase]) {
        partidosJugados[fase] = {};
    }
    partidosJugados[fase][partidoIndex] = true;
    guardarPartidosJugados();
}

// Guardar partidos jugados en localStorage
function guardarPartidosJugados() {
    localStorage.setItem('mundial2026_partidos_jugados', JSON.stringify(partidosJugados));
}

// Cargar partidos jugados desde localStorage
function cargarPartidosJugados() {
    const guardado = localStorage.getItem('mundial2026_partidos_jugados');
    if (guardado) {
        try {
            partidosJugados = JSON.parse(guardado);
        } catch (e) {
            partidosJugados = {};
        }
    }
}

// Fecha límite para modificar predicciones: 7 de junio de 2026 (inclusive)
const FECHA_LIMITE_MODIFICACION = new Date('2026-06-08T00:00:00'); // 8 de junio a las 00:00 = después del 7

// Verificar si se puede modificar una predicción
function sePuedeModificarPrediccion(grupoIndex, partidoIndex, tienePrediccionExistente) {
    const fechaActual = new Date();
    
    // Si estamos antes del 8 de junio (hasta el 7 inclusive), permitir modificar cualquier predicción
    if (fechaActual < FECHA_LIMITE_MODIFICACION) {
        return true;
    }
    
    // Después del 7 de junio:
    // - Si ya tiene predicción, no se puede modificar
    if (tienePrediccionExistente) {
        return false;
    }
    
    // - Si no tiene predicción, verificar si el partido aún no ha empezado
    if (typeof obtenerFechaHorarioPartido === 'function') {
        const fechaHorario = obtenerFechaHorarioPartido(grupoIndex, partidoIndex);
        if (fechaHorario && fechaHorario.fecha) {
            // Comparar fecha del partido con fecha actual
            const fechaPartido = new Date(fechaHorario.fecha + 'T00:00:00');
            const ahora = new Date();
            
            // Si el partido aún no ha empezado, permitir hacer la predicción
            return fechaPartido > ahora;
        }
    }
    
    // Por defecto, no permitir modificar después del 7 de junio
    return false;
}

// Verificar si se puede modificar una predicción de eliminatoria
function sePuedeModificarPrediccionEliminatoria(fase, partidoIndex, tienePrediccionExistente) {
    const fechaActual = new Date();
    
    // Si estamos antes del 8 de junio (hasta el 7 inclusive), permitir modificar cualquier predicción
    if (fechaActual < FECHA_LIMITE_MODIFICACION) {
        return true;
    }
    
    // Después del 7 de junio:
    // - Si ya tiene predicción, no se puede modificar
    if (tienePrediccionExistente) {
        return false;
    }
    
    // Para eliminatorias, necesitaríamos la fecha del partido
    // Por ahora, permitir hacer nuevas predicciones si no hay una existente
    // (esto se puede mejorar cuando tengamos las fechas de las eliminatorias)
    return !tienePrediccionExistente;
}

