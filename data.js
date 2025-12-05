// Datos del Mundial 2026
// 12 grupos de 4 equipos cada uno

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

// Inicializar resultados vacíos
function inicializarResultados() {
    resultados = {};
    GRUPOS_MUNDIAL_2026.forEach((grupo, grupoIndex) => {
        resultados[grupoIndex] = {
            partidos: grupo.partidos.map(() => ({ golesLocal: '', golesVisitante: '' })),
            posiciones: []
        };
    });
    
    // Cargar desde localStorage si existe
    const guardado = localStorage.getItem('mundial2026_resultados');
    if (guardado) {
        try {
            resultados = JSON.parse(guardado);
        } catch (e) {
            console.error('Error al cargar resultados guardados:', e);
        }
    }
}

// Guardar resultados en localStorage
function guardarResultados() {
    localStorage.setItem('mundial2026_resultados', JSON.stringify(resultados));
}

