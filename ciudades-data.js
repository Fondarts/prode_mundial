// Datos de ciudades, estadios y partidos del Mundial 2026

const CIUDADES_MUNDIAL_2026 = {
    'toronto': {
        nombre: 'Toronto',
        pais: 'Canadá',
        bandera: '🇨🇦',
        ciudadInfo: {
            descripcion: 'Toronto es la ciudad más grande de Canadá y capital de la provincia de Ontario. Es conocida por su diversidad cultural, su arquitectura moderna y su vibrante escena artística.',
            poblacion: 'Aproximadamente 2.9 millones de habitantes',
            clima: 'Veranos cálidos e inviernos fríos'
        },
        estadio: {
            nombre: 'BMO Field',
            capacidad: '30,000 (ampliable a 45,000 para el Mundial)',
            inauguracion: '2007',
            caracteristicas: 'Estadio de fútbol específico, sede del Toronto FC de la MLS',
            direccion: '170 Princes\' Blvd, Toronto, ON M6K 3C3, Canadá'
        },
        partidos: [
            { fecha: '2026-06-12', fase: 'Fase de Grupos', descripcion: 'Partido inaugural de Canadá' },
            { fecha: '2026-06-15', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-18', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-21', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' }
        ]
    },
    'vancouver': {
        nombre: 'Vancouver',
        pais: 'Canadá',
        bandera: '🇨🇦',
        ciudadInfo: {
            descripcion: 'Vancouver es una ciudad costera en la provincia de Columbia Británica, conocida por su belleza natural, su puerto y su calidad de vida.',
            poblacion: 'Aproximadamente 675,000 habitantes',
            clima: 'Clima oceánico templado'
        },
        estadio: {
            nombre: 'BC Place',
            capacidad: '54,500 espectadores',
            inauguracion: '1983 (renovado en 2011)',
            caracteristicas: 'Estadio con techo retráctil, sede del Vancouver Whitecaps',
            direccion: '777 Pacific Blvd, Vancouver, BC V6B 4Y8, Canadá'
        },
        partidos: [
            { fecha: '2026-06-13', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-16', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-19', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-22', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' }
        ]
    },
    'ciudad-de-mexico': {
        nombre: 'Ciudad de México',
        pais: 'México',
        bandera: '🇲🇽',
        ciudadInfo: {
            descripcion: 'Ciudad de México es la capital y ciudad más grande de México. Es un centro cultural, económico y político de gran importancia en América Latina.',
            poblacion: 'Aproximadamente 9.2 millones de habitantes',
            clima: 'Clima templado de altura'
        },
        estadio: {
            nombre: 'Estadio Azteca',
            capacidad: '83,264 espectadores',
            inauguracion: '1966',
            caracteristicas: 'Estadio histórico que ha albergado dos finales de Copa del Mundo (1970 y 1986)',
            direccion: 'Calzada de Tlalpan 3465, Col. Santa Úrsula Coapa, 04650 Ciudad de México, CDMX, México'
        },
        partidos: [
            { fecha: '2026-06-11', fase: 'Fase de Grupos', descripcion: 'Partido inaugural del Mundial 2026' },
            { fecha: '2026-06-14', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-17', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-20', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' }
        ]
    },
    'guadalajara': {
        nombre: 'Guadalajara',
        pais: 'México',
        bandera: '🇲🇽',
        ciudadInfo: {
            descripcion: 'Guadalajara es la segunda ciudad más grande de México y capital del estado de Jalisco. Es conocida como la cuna del mariachi y el tequila.',
            poblacion: 'Aproximadamente 1.5 millones de habitantes',
            clima: 'Clima templado'
        },
        estadio: {
            nombre: 'Estadio Akron',
            capacidad: '46,355 espectadores',
            inauguracion: '2010',
            caracteristicas: 'Estadio moderno, sede del Club Deportivo Guadalajara (Chivas)',
            direccion: 'Av. Circuito JVC 2800, 45645 Zapopan, Jal., México'
        },
        partidos: [
            { fecha: '2026-06-12', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-15', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-18', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-21', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' }
        ]
    },
    'monterrey': {
        nombre: 'Monterrey',
        pais: 'México',
        bandera: '🇲🇽',
        ciudadInfo: {
            descripcion: 'Monterrey es la capital del estado de Nuevo León y un importante centro industrial y empresarial de México.',
            poblacion: 'Aproximadamente 1.1 millones de habitantes',
            clima: 'Clima semiárido'
        },
        estadio: {
            nombre: 'Estadio BBVA',
            capacidad: '51,000 espectadores',
            inauguracion: '2015',
            caracteristicas: 'Estadio moderno con excelente acústica, sede del Club de Fútbol Monterrey',
            direccion: 'Av. Pablo Livas 2011, La Pastora, 67110 Guadalupe, N.L., México'
        },
        partidos: [
            { fecha: '2026-06-13', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-16', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-19', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-22', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' }
        ]
    },
    'atlanta': {
        nombre: 'Atlanta',
        pais: 'Estados Unidos',
        bandera: '🇺🇸',
        ciudadInfo: {
            descripcion: 'Atlanta es la capital y ciudad más poblada del estado de Georgia. Es un importante centro de negocios, cultura y entretenimiento en el sureste de Estados Unidos.',
            poblacion: 'Aproximadamente 498,000 habitantes (área metropolitana: 6 millones)',
            clima: 'Clima subtropical húmedo'
        },
        estadio: {
            nombre: 'Mercedes-Benz Stadium',
            capacidad: '71,000 espectadores',
            inauguracion: '2017',
            caracteristicas: 'Estadio con techo retráctil, sede de los Atlanta Falcons (NFL) y Atlanta United (MLS)',
            direccion: '1 AMB Drive NW, Atlanta, GA 30313, Estados Unidos'
        },
        partidos: [
            { fecha: '2026-06-16', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-19', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-22', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-28', fase: 'Dieciseisavos', descripcion: 'Octavos de final' },
            { fecha: '2026-07-01', fase: 'Octavos', descripcion: 'Cuartos de final' },
            { fecha: '2026-07-05', fase: 'Cuartos', descripcion: 'Semifinal' },
            { fecha: '2026-07-14', fase: 'Semifinal', descripcion: 'Semifinal' }
        ]
    },
    'boston': {
        nombre: 'Boston',
        pais: 'Estados Unidos',
        bandera: '🇺🇸',
        ciudadInfo: {
            descripcion: 'Boston es la capital y ciudad más grande de Massachusetts. Es una de las ciudades más antiguas de Estados Unidos, rica en historia y cultura.',
            poblacion: 'Aproximadamente 695,000 habitantes (área metropolitana: 4.9 millones)',
            clima: 'Clima continental húmedo'
        },
        estadio: {
            nombre: 'Gillette Stadium',
            capacidad: '68,756 espectadores',
            inauguracion: '2002',
            caracteristicas: 'Sede de los New England Patriots (NFL) y New England Revolution (MLS)',
            direccion: '1 Patriot Place, Foxborough, MA 02035, Estados Unidos'
        },
        partidos: [
            { fecha: '2026-06-14', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-17', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-20', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-27', fase: 'Dieciseisavos', descripcion: 'Octavos de final' },
            { fecha: '2026-07-09', fase: 'Cuartos', descripcion: 'Cuartos de final' }
        ]
    },
    'dallas': {
        nombre: 'Dallas',
        pais: 'Estados Unidos',
        bandera: '🇺🇸',
        ciudadInfo: {
            descripcion: 'Dallas es una importante ciudad en el estado de Texas, conocida por su economía diversificada, su cultura y su rica historia.',
            poblacion: 'Aproximadamente 1.3 millones de habitantes (área metropolitana: 7.6 millones)',
            clima: 'Clima subtropical húmedo'
        },
        estadio: {
            nombre: 'AT&T Stadium',
            capacidad: '80,000 espectadores',
            inauguracion: '2009',
            caracteristicas: 'Estadio con techo retráctil y pantalla gigante, sede de los Dallas Cowboys (NFL)',
            direccion: '1 AT&T Way, Arlington, TX 76011, Estados Unidos'
        },
        partidos: [
            { fecha: '2026-06-15', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-18', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-21', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-29', fase: 'Dieciseisavos', descripcion: 'Octavos de final' },
            { fecha: '2026-07-02', fase: 'Octavos', descripcion: 'Cuartos de final' },
            { fecha: '2026-07-14', fase: 'Semifinal', descripcion: 'Semifinal' }
        ]
    },
    'houston': {
        nombre: 'Houston',
        pais: 'Estados Unidos',
        bandera: '🇺🇸',
        ciudadInfo: {
            descripcion: 'Houston es la ciudad más grande de Texas y la cuarta más grande de Estados Unidos. Es un importante centro de energía, aeronáutica y tecnología.',
            poblacion: 'Aproximadamente 2.3 millones de habitantes (área metropolitana: 7.1 millones)',
            clima: 'Clima subtropical húmedo'
        },
        estadio: {
            nombre: 'NRG Stadium',
            capacidad: '72,220 espectadores',
            inauguracion: '2002',
            caracteristicas: 'Estadio con techo retráctil, sede de los Houston Texans (NFL)',
            direccion: '1 NRG Parkway, Houston, TX 77054, Estados Unidos'
        },
        partidos: [
            { fecha: '2026-06-13', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-16', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-19', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-30', fase: 'Dieciseisavos', descripcion: 'Octavos de final' },
            { fecha: '2026-07-04', fase: 'Octavos', descripcion: 'Octavos de final' }
        ]
    },
    'kansas-city': {
        nombre: 'Kansas City',
        pais: 'Estados Unidos',
        bandera: '🇺🇸',
        ciudadInfo: {
            descripcion: 'Kansas City es una ciudad ubicada en la frontera entre Missouri y Kansas, conocida por su música jazz, su barbacoa y su arquitectura.',
            poblacion: 'Aproximadamente 508,000 habitantes (área metropolitana: 2.2 millones)',
            clima: 'Clima continental húmedo'
        },
        estadio: {
            nombre: 'Arrowhead Stadium',
            capacidad: '76,416 espectadores',
            inauguracion: '1972',
            caracteristicas: 'Sede de los Kansas City Chiefs (NFL) y Kansas City Current (NWSL)',
            direccion: '1 Arrowhead Drive, Kansas City, MO 64129, Estados Unidos'
        },
        partidos: [
            { fecha: '2026-06-14', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-17', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-20', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-28', fase: 'Dieciseisavos', descripcion: 'Octavos de final' },
            { fecha: '2026-07-11', fase: 'Cuartos', descripcion: 'Cuartos de final' }
        ]
    },
    'los-angeles': {
        nombre: 'Los Ángeles',
        pais: 'Estados Unidos',
        bandera: '🇺🇸',
        ciudadInfo: {
            descripcion: 'Los Ángeles es la segunda ciudad más grande de Estados Unidos, conocida por su industria del entretenimiento, su diversidad cultural y su clima mediterráneo.',
            poblacion: 'Aproximadamente 4 millones de habitantes (área metropolitana: 13 millones)',
            clima: 'Clima mediterráneo'
        },
        estadio: {
            nombre: 'SoFi Stadium',
            capacidad: '70,000 espectadores',
            inauguracion: '2020',
            caracteristicas: 'Estadio ultramoderno con techo translúcido, sede de los Los Angeles Rams y Chargers (NFL)',
            direccion: '1001 Stadium Drive, Inglewood, CA 90301, Estados Unidos'
        },
        partidos: [
            { fecha: '2026-06-12', fase: 'Fase de Grupos', descripcion: 'Partido inaugural de EE.UU.' },
            { fecha: '2026-06-15', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-18', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-21', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-27', fase: 'Dieciseisavos', descripcion: 'Octavos de final' },
            { fecha: '2026-07-01', fase: 'Octavos', descripcion: 'Cuartos de final' }
        ]
    },
    'miami': {
        nombre: 'Miami',
        pais: 'Estados Unidos',
        bandera: '🇺🇸',
        ciudadInfo: {
            descripcion: 'Miami es una ciudad costera en el sureste de Florida, conocida por su cultura latina, sus playas, su vida nocturna y su arquitectura Art Deco.',
            poblacion: 'Aproximadamente 442,000 habitantes (área metropolitana: 6.1 millones)',
            clima: 'Clima tropical monzónico'
        },
        estadio: {
            nombre: 'Hard Rock Stadium',
            capacidad: '65,326 espectadores',
            inauguracion: '1987',
            caracteristicas: 'Sede de los Miami Dolphins (NFL) y Miami Hurricanes (NCAA)',
            direccion: '347 Don Shula Drive, Miami Gardens, FL 33056, Estados Unidos'
        },
        partidos: [
            { fecha: '2026-06-13', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-16', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-19', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-29', fase: 'Dieciseisavos', descripcion: 'Octavos de final' },
            { fecha: '2026-07-18', fase: 'Tercer Puesto', descripcion: 'Partido por el tercer puesto' }
        ]
    },
    'nueva-york': {
        nombre: 'Nueva York / Nueva Jersey',
        pais: 'Estados Unidos',
        bandera: '🇺🇸',
        ciudadInfo: {
            descripcion: 'Nueva York es la ciudad más poblada de Estados Unidos y un importante centro global de comercio, finanzas, cultura y entretenimiento.',
            poblacion: 'Aproximadamente 8.3 millones de habitantes (área metropolitana: 20 millones)',
            clima: 'Clima continental húmedo'
        },
        estadio: {
            nombre: 'MetLife Stadium',
            capacidad: '82,500 espectadores',
            inauguracion: '2010',
            caracteristicas: 'Sede de los New York Giants y New York Jets (NFL)',
            direccion: '1 MetLife Stadium Drive, East Rutherford, NJ 07073, Estados Unidos'
        },
        partidos: [
            { fecha: '2026-06-14', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-17', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-20', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-30', fase: 'Dieciseisavos', descripcion: 'Octavos de final' },
            { fecha: '2026-07-03', fase: 'Octavos', descripcion: 'Cuartos de final' },
            { fecha: '2026-07-10', fase: 'Cuartos', descripcion: 'Cuartos de final' },
            { fecha: '2026-07-19', fase: 'Final', descripcion: 'FINAL DEL MUNDIAL 2026' }
        ]
    },
    'filadelfia': {
        nombre: 'Filadelfia',
        pais: 'Estados Unidos',
        bandera: '🇺🇸',
        ciudadInfo: {
            descripcion: 'Filadelfia es la ciudad más grande de Pensilvania y una de las ciudades más históricamente significativas de Estados Unidos, siendo el lugar donde se firmó la Declaración de Independencia.',
            poblacion: 'Aproximadamente 1.6 millones de habitantes (área metropolitana: 6 millones)',
            clima: 'Clima continental húmedo'
        },
        estadio: {
            nombre: 'Lincoln Financial Field',
            capacidad: '67,594 espectadores',
            inauguracion: '2003',
            caracteristicas: 'Sede de los Philadelphia Eagles (NFL) y Temple Owls (NCAA)',
            direccion: '1 Lincoln Financial Field Way, Philadelphia, PA 19148, Estados Unidos'
        },
        partidos: [
            { fecha: '2026-06-15', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-18', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-21', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-27', fase: 'Dieciseisavos', descripcion: 'Octavos de final' }
        ]
    },
    'san-francisco': {
        nombre: 'San Francisco',
        pais: 'Estados Unidos',
        bandera: '🇺🇸',
        ciudadInfo: {
            descripcion: 'San Francisco es una ciudad en el norte de California, conocida por su arquitectura victoriana, sus colinas, el Golden Gate Bridge y su cultura tecnológica.',
            poblacion: 'Aproximadamente 873,000 habitantes (área metropolitana: 4.7 millones)',
            clima: 'Clima mediterráneo'
        },
        estadio: {
            nombre: 'Levi\'s Stadium',
            capacidad: '68,500 espectadores',
            inauguracion: '2014',
            caracteristicas: 'Sede de los San Francisco 49ers (NFL), estadio con tecnología de punta',
            direccion: '4900 Marie P DeBartolo Way, Santa Clara, CA 95054, Estados Unidos'
        },
        partidos: [
            { fecha: '2026-06-12', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-15', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-18', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-21', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' }
        ]
    },
    'seattle': {
        nombre: 'Seattle',
        pais: 'Estados Unidos',
        bandera: '🇺🇸',
        ciudadInfo: {
            descripcion: 'Seattle es la ciudad más grande del estado de Washington, conocida por su industria tecnológica, su música, su café y su proximidad a la naturaleza.',
            poblacion: 'Aproximadamente 737,000 habitantes (área metropolitana: 4 millones)',
            clima: 'Clima oceánico templado'
        },
        estadio: {
            nombre: 'Lumen Field',
            capacidad: '72,000 espectadores',
            inauguracion: '2002',
            caracteristicas: 'Sede de los Seattle Seahawks (NFL) y Seattle Sounders (MLS)',
            direccion: '800 Occidental Ave S, Seattle, WA 98134, Estados Unidos'
        },
        partidos: [
            { fecha: '2026-06-13', fase: 'Fase de Grupos', descripcion: 'Segundo partido del grupo de EE.UU.' },
            { fecha: '2026-06-16', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-19', fase: 'Fase de Grupos', descripcion: 'Partido de grupos' },
            { fecha: '2026-06-30', fase: 'Dieciseisavos', descripcion: 'Octavos de final' }
        ]
    }
};

// Función para obtener información de una ciudad
function obtenerInfoCiudad(ciudadKey) {
    return CIUDADES_MUNDIAL_2026[ciudadKey] || null;
}

// Función para formatear fecha
function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr + 'T00:00:00');
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
}

