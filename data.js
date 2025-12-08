// Datos del Mundial 2026
// 12 grupos de 4 equipos cada uno

// Calendario del Mundial 2026 - Fechas y horarios estimados
// El Mundial 2026 se jugará del 11 de junio al 19 de julio de 2026
const CALENDARIO_MUNDIAL_2026 = {
    // Fecha 1 de grupos: 11-15 de junio
    '1': [
        { fecha: '2026-06-11', horario: '17:00' }, // Jueves
        { fecha: '2026-06-11', horario: '20:00' },
        { fecha: '2026-06-12', horario: '14:00' }, // Viernes
        { fecha: '2026-06-12', horario: '17:00' },
        { fecha: '2026-06-12', horario: '20:00' },
        { fecha: '2026-06-13', horario: '14:00' }, // Sábado
        { fecha: '2026-06-13', horario: '17:00' },
        { fecha: '2026-06-13', horario: '20:00' },
        { fecha: '2026-06-14', horario: '14:00' }, // Domingo
        { fecha: '2026-06-14', horario: '17:00' },
        { fecha: '2026-06-14', horario: '20:00' },
        { fecha: '2026-06-15', horario: '14:00' }, // Lunes
        { fecha: '2026-06-15', horario: '17:00' },
        { fecha: '2026-06-15', horario: '20:00' },
        { fecha: '2026-06-15', horario: '23:00' },
        { fecha: '2026-06-15', horario: '02:00' }  // Martes (horario siguiente día)
    ],
    // Fecha 2 de grupos: 16-20 de junio
    '2': [
        { fecha: '2026-06-16', horario: '14:00' }, // Martes
        { fecha: '2026-06-16', horario: '17:00' },
        { fecha: '2026-06-16', horario: '20:00' },
        { fecha: '2026-06-17', horario: '14:00' }, // Miércoles
        { fecha: '2026-06-17', horario: '17:00' },
        { fecha: '2026-06-17', horario: '20:00' },
        { fecha: '2026-06-18', horario: '14:00' }, // Jueves
        { fecha: '2026-06-18', horario: '17:00' },
        { fecha: '2026-06-18', horario: '20:00' },
        { fecha: '2026-06-19', horario: '14:00' }, // Viernes
        { fecha: '2026-06-19', horario: '17:00' },
        { fecha: '2026-06-19', horario: '20:00' },
        { fecha: '2026-06-20', horario: '14:00' }, // Sábado
        { fecha: '2026-06-20', horario: '17:00' },
        { fecha: '2026-06-20', horario: '20:00' },
        { fecha: '2026-06-20', horario: '23:00' }
    ],
    // Fecha 3 de grupos: 21-25 de junio
    '3': [
        { fecha: '2026-06-21', horario: '14:00' }, // Domingo
        { fecha: '2026-06-21', horario: '17:00' },
        { fecha: '2026-06-21', horario: '20:00' },
        { fecha: '2026-06-22', horario: '14:00' }, // Lunes
        { fecha: '2026-06-22', horario: '17:00' },
        { fecha: '2026-06-22', horario: '20:00' },
        { fecha: '2026-06-23', horario: '14:00' }, // Martes
        { fecha: '2026-06-23', horario: '17:00' },
        { fecha: '2026-06-23', horario: '20:00' },
        { fecha: '2026-06-24', horario: '14:00' }, // Miércoles
        { fecha: '2026-06-24', horario: '17:00' },
        { fecha: '2026-06-24', horario: '20:00' },
        { fecha: '2026-06-25', horario: '14:00' }, // Jueves
        { fecha: '2026-06-25', horario: '17:00' },
        { fecha: '2026-06-25', horario: '20:00' },
        { fecha: '2026-06-25', horario: '23:00' }
    ]
};

// Función para obtener fecha y horario de un partido
function obtenerFechaHorarioPartido(grupoIndex, partidoIndex) {
    const grupo = GRUPOS_MUNDIAL_2026[grupoIndex];
    if (!grupo || !grupo.partidos[partidoIndex]) {
        return { fecha: '', horario: '' };
    }
    
    const fechaGrupo = grupo.partidos[partidoIndex].fecha;
    const calendarioFecha = CALENDARIO_MUNDIAL_2026[fechaGrupo.toString()];
    
    if (!calendarioFecha) {
        return { fecha: '', horario: '' };
    }
    
    // Calcular índice del partido dentro de la fecha del grupo (0 o 1, ya que hay 2 partidos por fecha)
    // Los partidos están ordenados: fecha 1 (0,1), fecha 2 (2,3), fecha 3 (4,5)
    const indiceEnFecha = partidoIndex % 2; // 0 o 1
    
    // Calcular índice global: cada grupo tiene 2 partidos por fecha
    // Fecha 1: grupos 0-11, partidos 0-1 de cada grupo = índices 0-23
    // Fecha 2: grupos 0-11, partidos 2-3 de cada grupo = índices 0-23
    // Fecha 3: grupos 0-11, partidos 4-5 de cada grupo = índices 0-23
    const indiceGlobal = grupoIndex * 2 + indiceEnFecha;
    
    if (indiceGlobal < calendarioFecha.length) {
        return calendarioFecha[indiceGlobal];
    }
    
    return { fecha: '', horario: '' };
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
            console.error('Error al cargar resultados guardados:', e);
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
            console.error('Error al cargar partidos jugados:', e);
            partidosJugados = {};
        }
    }
}

