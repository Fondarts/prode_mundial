// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // PASO 0: Traducir página
    if (typeof translatePage === 'function') {
        translatePage();
        // Actualizar lang del HTML
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'es';
        document.documentElement.lang = lang;
    }
    
    // PASO 1: Renderizar estado de autenticación INMEDIATAMENTE (SIN await, SIN async)
    // Esto debe ser lo primero para que el usuario vea el estado de inmediato
    if (typeof renderizarEstadoAuth === 'function') {
        renderizarEstadoAuth();
    }
    
    // PASO 2: Configurar tabs y botones inmediatamente para que la página sea interactiva
    configurarTabs();
    configurarBotones();
    
    // PASO 3: Mostrar skeleton mientras carga
    if (typeof renderizarSkeletonGrupos === 'function') {
        renderizarSkeletonGrupos();
    }
    
    // PASO 4: Inicializar resultados y renderizar grupos (operaciones rápidas)
    inicializarResultados();
    renderizarGrupos();
    actualizarEliminatorias();
    
    // PASO 5: Operaciones pesadas de forma asíncrona sin bloquear
    (async () => {
        // Inicializar torneo de forma asíncrona sin bloquear
        if (typeof inicializarTorneo === 'function') {
            try {
                await inicializarTorneo();
                // Actualizar estado de auth después de inicializar torneo si es necesario
                if (typeof renderizarEstadoAuth === 'function') {
                    renderizarEstadoAuth();
                }
            } catch (error) {
                // Si falla, al menos el estado de auth ya está renderizado
            }
        }
        
        // Inicializar actualización automática si está activada
        const autoUpdateGuardado = localStorage.getItem('mundial2026_auto_update');
        if (autoUpdateGuardado === 'true' && typeof iniciarActualizacionAutomatica === 'function') {
            if (typeof API_CONFIG !== 'undefined') {
                API_CONFIG.autoUpdate = true;
            }
            iniciarActualizacionAutomatica();
        }
    })();
});

// Renderizar skeleton screen para grupos
function renderizarSkeletonGrupos() {
    const container = document.getElementById('grupos-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 12; i++) {
        const grupoDiv = document.createElement('div');
        grupoDiv.className = 'grupo skeleton-grupo';
        grupoDiv.innerHTML = `
            <h3 class="skeleton-text" style="width: 120px; height: 24px; margin-bottom: 15px; margin: 0 auto 15px;"></h3>
            <table class="tabla-posiciones skeleton-table">
                <thead>
                    <tr>
                        <th></th><th></th><th></th><th></th><th></th><th></th>
                    </tr>
                </thead>
                <tbody>
                    ${Array(4).fill(0).map(() => `
                        <tr>
                            <td><div class="skeleton-text" style="width: 80%; height: 16px; margin: 0 auto;"></div></td>
                            <td><div class="skeleton-text" style="width: 60%; height: 16px; margin: 0 auto;"></div></td>
                            <td><div class="skeleton-text" style="width: 60%; height: 16px; margin: 0 auto;"></div></td>
                            <td><div class="skeleton-text" style="width: 60%; height: 16px; margin: 0 auto;"></div></td>
                            <td><div class="skeleton-text" style="width: 60%; height: 16px; margin: 0 auto;"></div></td>
                            <td><div class="skeleton-text" style="width: 60%; height: 16px; margin: 0 auto;"></div></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="partidos">
                <h4 class="skeleton-text" style="width: 100px; height: 20px; margin-bottom: 10px;"></h4>
                ${Array(6).fill(0).map(() => `
                    <div class="partido skeleton-partido">
                        <div class="skeleton-text" style="width: 40%; height: 16px;"></div>
                        <div class="skeleton-text" style="width: 60px; height: 32px; margin: 8px auto;"></div>
                        <div class="skeleton-text" style="width: 40%; height: 16px;"></div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(grupoDiv);
    }
}

// Renderizar grupos
function renderizarGrupos() {
    const container = document.getElementById('grupos-container');
    if (!container) return;
    
    container.innerHTML = '';

    const t = typeof window.t === 'function' ? window.t : (key) => key;
    
    // Mapeo de nombres de grupos a traducciones
    const grupoMap = {
        'Grupo A': t('grupoA'),
        'Grupo B': t('grupoB'),
        'Grupo C': t('grupoC'),
        'Grupo D': t('grupoD'),
        'Grupo E': t('grupoE'),
        'Grupo F': t('grupoF'),
        'Grupo G': t('grupoG'),
        'Grupo H': t('grupoH'),
        'Grupo I': t('grupoI'),
        'Grupo J': t('grupoJ'),
        'Grupo K': t('grupoK'),
        'Grupo L': t('grupoL')
    };
    
    GRUPOS_MUNDIAL_2026.forEach((grupo, grupoIndex) => {
        const grupoDiv = document.createElement('div');
        grupoDiv.className = 'grupo';
        
        const nombreGrupoTraducido = grupoMap[grupo.nombre] || grupo.nombre;
        
        grupoDiv.innerHTML = `
            <h3>${nombreGrupoTraducido}</h3>
            ${renderizarTablaPosiciones(grupo, grupoIndex)}
            <div class="partidos">
                <h4 style="margin-bottom: 10px; color: #666;">${t('partidos')}</h4>
                ${renderizarPartidos(grupo, grupoIndex)}
            </div>
        `;
        
        container.appendChild(grupoDiv);
        
        // Configurar event listeners para links de países (todos los grupos)
        // Usar setTimeout para asegurar que el DOM esté completamente renderizado
        setTimeout(() => {
            grupoDiv.querySelectorAll('.pais-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const paisKey = link.getAttribute('data-pais');
                    if (paisKey) {
                        if (typeof obtenerInfoPais === 'function' && typeof mostrarInfoPais === 'function') {
                            mostrarInfoPais(paisKey);
                        } else {
                            console.error('Funciones no disponibles:', {
                                obtenerInfoPais: typeof obtenerInfoPais,
                                mostrarInfoPais: typeof mostrarInfoPais
                            });
                        }
                    }
                });
            });
        }, 0);
    });
    
    // Asegurar que los selects tengan los event listeners correctos
    container.querySelectorAll('.playoff-select').forEach(select => {
        select.addEventListener('change', (e) => {
            e.stopPropagation();
            const grupoIndex = parseInt(e.target.getAttribute('data-grupo'));
            const equipoIndex = parseInt(e.target.getAttribute('data-equipo'));
            const seleccion = e.target.value;
            
            if (!resultados[grupoIndex]) {
                resultados[grupoIndex] = { partidos: [], posiciones: [], playoffSelecciones: {} };
            }
            
            if (!resultados[grupoIndex].playoffSelecciones) {
                resultados[grupoIndex].playoffSelecciones = {};
            }
            
            resultados[grupoIndex].playoffSelecciones[equipoIndex] = seleccion;
            
            // Actualizar la bandera visualmente
            const selectElement = e.target;
            const containerDiv = selectElement.parentElement;
            const flagElement = containerDiv.querySelector('.playoff-flag, .playoff-flag-placeholder');
            
            if (seleccion) {
                const bandera = obtenerBanderaPais(seleccion);
                if (bandera && flagElement) {
                    if (flagElement.classList.contains('playoff-flag-placeholder')) {
                        flagElement.outerHTML = `<img src="${bandera}" alt="${seleccion}" class="playoff-flag" style="width: 20px; height: 15px; vertical-align: middle; margin-right: 6px; border: 1px solid #ddd; border-radius: 2px; display: inline-block;">`;
                    } else {
                        flagElement.src = bandera;
                        flagElement.alt = seleccion;
                    }
                }
            } else {
                if (flagElement && !flagElement.classList.contains('playoff-flag-placeholder')) {
                    flagElement.outerHTML = `<div class="playoff-flag-placeholder" style="width: 20px; height: 15px; border: 1px solid #ddd; border-radius: 2px; display: inline-block; background: white; margin-right: 6px; vertical-align: middle;"></div>`;
                }
            }
            
            guardarResultados();
            renderizarGrupos();
            actualizarEliminatorias();
        });
    });
}

// Función para traducir nombres de países
// Función para obtener la URL de la bandera de un país
// Función auxiliar para obtener el nombre original en español desde un nombre traducido
function obtenerNombreOriginalEspanol(nombreTraducido) {
    const t = typeof window.t === 'function' ? window.t : (key) => key;
    
    // Mapeo inverso: de traducciones a nombres originales en español
    const traducciones = {
        es: {
            'México': 'México',
            'Sudáfrica': 'Sudáfrica',
            'Corea del Sur': 'Corea del Sur',
            'Canadá': 'Canadá',
            'Qatar': 'Qatar',
            'Suiza': 'Suiza',
            'Brasil': 'Brasil',
            'Marruecos': 'Marruecos',
            'Haití': 'Haití',
            'Escocia': 'Escocia',
            'USA': 'USA',
            'Paraguay': 'Paraguay',
            'Australia': 'Australia',
            'Alemania': 'Alemania',
            'Curaçao': 'Curaçao',
            'C de Marfil': 'C de Marfil',
            'Costa de Marfil': 'Costa de Marfil',
            'Ecuador': 'Ecuador',
            'Holanda': 'Holanda',
            'Japón': 'Japón',
            'Túnez': 'Túnez',
            'Bélgica': 'Bélgica',
            'Egipto': 'Egipto',
            'Irán': 'Irán',
            'N. Zelanda': 'N. Zelanda',
            'Nueva Zelanda': 'Nueva Zelanda',
            'España': 'España',
            'Cabo Verde': 'Cabo Verde',
            'Arabia Saudí': 'Arabia Saudí',
            'Uruguay': 'Uruguay',
            'Francia': 'Francia',
            'Senegal': 'Senegal',
            'Noruega': 'Noruega',
            'Argentina': 'Argentina',
            'Argelia': 'Argelia',
            'Austria': 'Austria',
            'Jordania': 'Jordania',
            'Portugal': 'Portugal',
            'Colombia': 'Colombia',
            'Uzbekistán': 'Uzbekistán',
            'Inglaterra': 'Inglaterra',
            'Croacia': 'Croacia',
            'Ghana': 'Ghana',
            'Panamá': 'Panamá',
            'Gales': 'Gales',
            'Bosnia': 'Bosnia',
            'Italia': 'Italia',
            'Irlanda del Norte': 'Irlanda del Norte',
            'Eslovaquia': 'Eslovaquia',
            'Kosovo': 'Kosovo',
            'Turquía': 'Turquía',
            'Rumania': 'Rumania',
            'Ucrania': 'Ucrania',
            'Suecia': 'Suecia',
            'Polonia': 'Polonia',
            'Albania': 'Albania',
            'Bolivia': 'Bolivia',
            'Surinam': 'Surinam',
            'Irak': 'Irak',
            'Nueva Caledonia': 'Nueva Caledonia',
            'Jamaica': 'Jamaica',
            'RD Congo': 'RD Congo',
            'Rep. Checa': 'Rep. Checa',
            'República Checa': 'República Checa',
            'Irlanda': 'Irlanda',
            'Dinamarca': 'Dinamarca',
            'Macedonia del Norte': 'Macedonia del Norte'
        },
        en: {
            'Mexico': 'México',
            'South Africa': 'Sudáfrica',
            'South Korea': 'Corea del Sur',
            'Canada': 'Canadá',
            'Qatar': 'Qatar',
            'Switzerland': 'Suiza',
            'Brazil': 'Brasil',
            'Morocco': 'Marruecos',
            'Haiti': 'Haití',
            'Scotland': 'Escocia',
            'United States': 'USA',
            'USA': 'USA',
            'Paraguay': 'Paraguay',
            'Australia': 'Australia',
            'Germany': 'Alemania',
            'Curaçao': 'Curaçao',
            'Ivory Coast': 'C de Marfil',
            'Ecuador': 'Ecuador',
            'Netherlands': 'Holanda',
            'Japan': 'Japón',
            'Tunisia': 'Túnez',
            'Belgium': 'Bélgica',
            'Egypt': 'Egipto',
            'Iran': 'Irán',
            'New Zealand': 'Nueva Zelanda',
            'Spain': 'España',
            'Cape Verde': 'Cabo Verde',
            'Saudi Arabia': 'Arabia Saudí',
            'Uruguay': 'Uruguay',
            'France': 'Francia',
            'Senegal': 'Senegal',
            'Norway': 'Noruega',
            'Argentina': 'Argentina',
            'Algeria': 'Argelia',
            'Austria': 'Austria',
            'Jordan': 'Jordania',
            'Portugal': 'Portugal',
            'Colombia': 'Colombia',
            'Uzbekistan': 'Uzbekistán',
            'England': 'Inglaterra',
            'Croatia': 'Croacia',
            'Ghana': 'Ghana',
            'Panama': 'Panamá',
            'Wales': 'Gales',
            'Bosnia': 'Bosnia',
            'Italy': 'Italia',
            'Northern Ireland': 'Irlanda del Norte',
            'Slovakia': 'Eslovaquia',
            'Kosovo': 'Kosovo',
            'Turkey': 'Turquía',
            'Romania': 'Rumania',
            'Ukraine': 'Ucrania',
            'Sweden': 'Suecia',
            'Poland': 'Polonia',
            'Albania': 'Albania',
            'Bolivia': 'Bolivia',
            'Suriname': 'Surinam',
            'Iraq': 'Irak',
            'New Caledonia': 'Nueva Caledonia',
            'Jamaica': 'Jamaica',
            'DR Congo': 'RD Congo',
            'Czech Republic': 'Rep. Checa',
            'Czechia': 'Rep. Checa',
            'Ireland': 'Irlanda',
            'Denmark': 'Dinamarca',
            'North Macedonia': 'Macedonia del Norte'
        }
    };
    
    const idioma = getCurrentLanguage();
    const mapa = traducciones[idioma] || traducciones.es;
    return mapa[nombreTraducido] || nombreTraducido;
}

function obtenerBanderaPais(nombre) {
    // Primero intentar con el nombre tal cual
    // Si no funciona, intentar convertir el nombre traducido a español
    let nombreOriginal = nombre;
    
    // Mapeo de nombres de países a códigos ISO para banderas
    const banderasMap = {
        'México': 'mx',
        'Sudáfrica': 'za',
        'Corea del Sur': 'kr',
        'Canadá': 'ca',
        'Qatar': 'qa',
        'Suiza': 'ch',
        'Brasil': 'br',
        'Marruecos': 'ma',
        'Haití': 'ht',
        'Escocia': 'gb-sct',
        'USA': 'us',
        'Paraguay': 'py',
        'Australia': 'au',
        'Alemania': 'de',
        'Curaçao': 'cw',
        'C de Marfil': 'ci',
        'Costa de Marfil': 'ci',
        'Ecuador': 'ec',
        'Holanda': 'nl',
        'Japón': 'jp',
        'Túnez': 'tn',
        'Bélgica': 'be',
        'Egipto': 'eg',
        'Irán': 'ir',
        'N. Zelanda': 'nz',
        'Nueva Zelanda': 'nz',
        'España': 'es',
        'Cabo Verde': 'cv',
        'Arabia Saudí': 'sa',
        'Uruguay': 'uy',
        'Francia': 'fr',
        'Senegal': 'sn',
        'Noruega': 'no',
        'Argentina': 'ar',
        'Argelia': 'dz',
        'Austria': 'at',
        'Jordania': 'jo',
        'Portugal': 'pt',
        'Colombia': 'co',
        'Uzbekistán': 'uz',
        'Inglaterra': 'gb-eng',
        'Croacia': 'hr',
        'Ghana': 'gh',
        'Panamá': 'pa',
        // Playoffs
        'Rep. Checa': 'cz',
        'República Checa': 'cz',
        'Irlanda': 'ie',
        'Dinamarca': 'dk',
        'Macedonia del Norte': 'mk',
        'Gales': 'gb-wls',
        'Bosnia': 'ba',
        'Italia': 'it',
        'Irlanda del Norte': 'gb-nir',
        'Eslovaquia': 'sk',
        'Kosovo': 'xk',
        'Turquía': 'tr',
        'Rumania': 'ro',
        'Ucrania': 'ua',
        'Suecia': 'se',
        'Polonia': 'pl',
        'Albania': 'al',
        'Bolivia': 'bo',
        'Surinam': 'sr',
        'Irak': 'iq',
        'Nueva Caledonia': 'nc',
        'Jamaica': 'jm',
        'RD Congo': 'cd'
    };
    
    let codigo = banderasMap[nombre];
    if (!codigo) {
        // Intentar con el nombre original en español
        nombreOriginal = obtenerNombreOriginalEspanol(nombre);
        codigo = banderasMap[nombreOriginal];
    }
    if (codigo) {
        return `https://flagcdn.com/w160/${codigo}.png`;
    }
    return ''; // Retornar string vacío si no se encuentra
}

function traducirNombrePais(nombre) {
    const t = typeof window.t === 'function' ? window.t : (key) => key;
    
    // Mapeo de nombres de países a claves de traducción
    const paisMap = {
        'México': 'mexico',
        'Sudáfrica': 'sudafrica',
        'Corea del Sur': 'coreaDelSur',
        'Canadá': 'canada',
        'Qatar': 'qatar',
        'Suiza': 'suiza',
        'Brasil': 'brasil',
        'Marruecos': 'marruecos',
        'Haití': 'haiti',
        'Escocia': 'escocia',
        'USA': 'usa',
        'Paraguay': 'paraguay',
        'Australia': 'australia',
        'Alemania': 'alemania',
        'Curaçao': 'curazao',
        'C de Marfil': 'costaDeMarfil',
        'Ecuador': 'ecuador',
        'Holanda': 'holanda',
        'Japón': 'japon',
        'Túnez': 'tunez',
        'Bélgica': 'belgica',
        'Egipto': 'egipto',
        'Irán': 'iran',
        'N. Zelanda': 'nuevaZelanda',
        'España': 'espana',
        'Cabo Verde': 'caboVerde',
        'Arabia Saudí': 'arabiaSaudi',
        'Uruguay': 'uruguay',
        'Francia': 'francia',
        'Senegal': 'senegal',
        'Noruega': 'noruega',
        'Argentina': 'argentina',
        'Argelia': 'argelia',
        'Austria': 'austria',
        'Jordania': 'jordania',
        'Portugal': 'portugal',
        'Colombia': 'colombia',
        'Uzbekistán': 'uzbekistan',
        'Inglaterra': 'inglaterra',
        'Croacia': 'croacia',
        'Ghana': 'ghana',
        'Panamá': 'panama',
        // Playoffs
        'Rep. Checa': 'repCheca',
        'Irlanda': 'irlanda',
        'Dinamarca': 'dinamarca',
        'Macedonia del Norte': 'macedoniaDelNorte',
        'Gales': 'gales',
        'Bosnia': 'bosnia',
        'Italia': 'italia',
        'Irlanda del Norte': 'irlandaDelNorte',
        'Eslovaquia': 'eslovaquia',
        'Kosovo': 'kosovo',
        'Turquía': 'turquia',
        'Rumania': 'rumania',
        'Ucrania': 'ucrania',
        'Suecia': 'suecia',
        'Polonia': 'polonia',
        'Albania': 'albania',
        'Bolivia': 'bolivia',
        'Surinam': 'surinam',
        'Irak': 'irak',
        'Nueva Caledonia': 'nuevaCaledonia',
        'Jamaica': 'jamaica',
        'RD Congo': 'rdCongo'
    };
    
    const clave = paisMap[nombre];
    if (clave) {
        const traduccion = t(clave);
        // Si la traducción es diferente a la clave, usar la traducción
        return traduccion !== clave ? traduccion : nombre;
    }
    return nombre;
}

// Obtener nombre real del equipo (considerando selección de playoff)
function obtenerNombreEquipo(grupo, grupoIndex, equipoIndex) {
    const equipo = grupo.equipos[equipoIndex];
    if (PLAYOFFS_OPCIONES[equipo]) {
        const seleccion = resultados[grupoIndex]?.playoffSelecciones?.[equipoIndex] || '';
        return seleccion ? traducirNombrePais(seleccion) : equipo;
    }
    return traducirNombrePais(equipo);
}

// Renderizar tabla de posiciones
function renderizarTablaPosiciones(grupo, grupoIndex) {
    const posiciones = calcularPosiciones(grupo, grupoIndex);
    
    const t = typeof window.t === 'function' ? window.t : (key) => key;
    let html = '<table class="tabla-posiciones"><thead><tr>';
    html += `<th>${t('pos')}</th><th>${t('equipo')}</th><th>${t('pj')}</th><th>${t('pg')}</th><th>${t('pe')}</th><th>${t('pp')}</th><th>${t('gf')}</th><th>${t('gc')}</th><th>${t('dg')}</th><th>${t('pts')}</th>`;
    html += '</tr></thead><tbody>';
    
    posiciones.forEach((pos, index) => {
        const clasePos = index < 2 ? `pos-${index + 1}` : (index === 2 ? 'pos-3' : '');
        html += `<tr class="${clasePos}">`;
        html += `<td>${index + 1}</td>`;
        html += `<td>`;
        
        // Si es un playoff, mostrar select con bandera
        const equipoOriginal = grupo.equipos[pos.indice];
        if (PLAYOFFS_OPCIONES[equipoOriginal]) {
            const seleccion = resultados[grupoIndex]?.playoffSelecciones?.[pos.indice] || '';
            const banderaSeleccionada = seleccion ? obtenerBanderaPais(seleccion) : '';
            const banderaHtml = banderaSeleccionada 
                ? `<img src="${banderaSeleccionada}" alt="${seleccion}" class="playoff-flag" style="width: 20px; height: 15px; vertical-align: middle; margin-right: 6px; border: 1px solid #ddd; border-radius: 2px; display: inline-block;">` 
                : `<div class="playoff-flag-placeholder" style="width: 20px; height: 15px; border: 1px solid #ddd; border-radius: 2px; display: inline-block; background: white; margin-right: 6px; vertical-align: middle;"></div>`;
            html += `<div style="display: inline-flex; align-items: center;">${banderaHtml}<select class="playoff-select" data-grupo="${grupoIndex}" data-equipo="${pos.indice}">`;
            html += `<option value="">${equipoOriginal}</option>`;
            PLAYOFFS_OPCIONES[equipoOriginal].forEach(opcion => {
                const bandera = obtenerBanderaPais(opcion);
                const banderaHtml = bandera ? `<img src="${bandera}" alt="${opcion}" style="width: 16px; height: 12px; vertical-align: middle; margin-right: 4px;">` : '';
                html += `<option value="${opcion}" ${seleccion === opcion ? 'selected' : ''}>${banderaHtml}${opcion}</option>`;
            });
            html += `</select></div>`;
        } else {
            const nombreEquipo = obtenerNombreEquipo(grupo, grupoIndex, pos.indice);
            const bandera = obtenerBanderaPais(equipoOriginal);
            const banderaHtml = bandera ? `<img src="${bandera}" alt="${nombreEquipo}" style="width: 20px; height: 15px; vertical-align: middle; margin-right: 6px; border: 1px solid #ddd; border-radius: 2px;">` : '';
            // Hacer clickeable si no es un playoff (todos los grupos)
            if (!PLAYOFFS_OPCIONES[equipoOriginal]) {
                // Mapeo de nombres originales a claves de país
                const paisKeyMap = {
                    'México': 'mexico',
                    'Sudáfrica': 'sudafrica',
                    'Corea del Sur': 'corea-del-sur',
                    'Canadá': 'canada',
                    'Qatar': 'qatar',
                    'Suiza': 'suiza',
                    'Brasil': 'brasil',
                    'Marruecos': 'marruecos',
                    'Haití': 'haiti',
                    'Escocia': 'escocia',
                    'USA': 'usa',
                    'Paraguay': 'paraguay',
                    'Australia': 'australia',
                    'Alemania': 'alemania',
                    'Curaçao': 'curazao',
                    'C de Marfil': 'costa-de-marfil',
                    'Costa de Marfil': 'costa-de-marfil',
                    'Ecuador': 'ecuador',
                    'Holanda': 'holanda',
                    'Japón': 'japon',
                    'Túnez': 'tunez',
                    'Bélgica': 'belgica',
                    'Egipto': 'egipto',
                    'Irán': 'iran',
                    'N. Zelanda': 'nueva-zelanda',
                    'Nueva Zelanda': 'nueva-zelanda',
                    'España': 'espana',
                    'Cabo Verde': 'cabo-verde',
                    'Arabia Saudí': 'arabia-saudi',
                    'Uruguay': 'uruguay',
                    'Francia': 'francia',
                    'Senegal': 'senegal',
                    'Noruega': 'noruega',
                    'Argentina': 'argentina',
                    'Argelia': 'argelia',
                    'Austria': 'austria',
                    'Jordania': 'jordania',
                    'Portugal': 'portugal',
                    'Colombia': 'colombia',
                    'Uzbekistán': 'uzbekistan',
                    'Inglaterra': 'inglaterra',
                    'Croacia': 'croacia',
                    'Ghana': 'ghana',
                    'Panamá': 'panama'
                };
                const paisKey = paisKeyMap[equipoOriginal];
                if (paisKey) {
                    html += `<a href="#" class="pais-link" data-pais="${paisKey}" style="color: #2196f3; text-decoration: none; cursor: pointer; font-weight: 500; display: inline-flex; align-items: center;">${banderaHtml}${nombreEquipo}</a>`;
                } else {
                    html += `<span style="display: inline-flex; align-items: center;">${banderaHtml}${nombreEquipo}</span>`;
                }
            } else {
                // Para playoffs, mostrar sin estilo de link (color normal)
                html += `<span style="display: inline-flex; align-items: center; color: inherit;">${banderaHtml}${nombreEquipo}</span>`;
            }
        }
        
        html += `</td>`;
        html += `<td>${pos.partidosJugados}</td>`;
        html += `<td>${pos.ganados}</td>`;
        html += `<td>${pos.empatados}</td>`;
        html += `<td>${pos.perdidos}</td>`;
        html += `<td>${pos.golesFavor}</td>`;
        html += `<td>${pos.golesContra}</td>`;
        html += `<td>${pos.diferenciaGoles}</td>`;
        html += `<td><strong>${pos.puntos}</strong></td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    return html;
}

// Calcular posiciones de un grupo
function calcularPosiciones(grupo, grupoIndex) {
    const equipos = grupo.equipos.map((_, index) => ({
        indice: index,
        puntos: 0,
        partidosJugados: 0,
        ganados: 0,
        empatados: 0,
        perdidos: 0,
        golesFavor: 0,
        golesContra: 0,
        diferenciaGoles: 0
    }));

    const partidos = resultados[grupoIndex]?.partidos || [];
    
    grupo.partidos.forEach((partido, partidoIndex) => {
        const resultado = partidos[partidoIndex];
        if (resultado) {
            // Obtener valores como strings y tratar vacío como 0
            const golesLocalStr = (resultado.golesLocal !== undefined && resultado.golesLocal !== null && resultado.golesLocal !== '') 
                ? String(resultado.golesLocal).trim() : '';
            const golesVisitanteStr = (resultado.golesVisitante !== undefined && resultado.golesVisitante !== null && resultado.golesVisitante !== '') 
                ? String(resultado.golesVisitante).trim() : '';
            
            // Si al menos uno de los valores fue ingresado, procesar el partido
            // Tratando el vacío como 0
            if (golesLocalStr !== '' || golesVisitanteStr !== '') {
                const golesLocal = golesLocalStr !== '' ? (parseInt(golesLocalStr) || 0) : 0;
                const golesVisitante = golesVisitanteStr !== '' ? (parseInt(golesVisitanteStr) || 0) : 0;
                
                // Solo procesar si ambos valores son números válidos
                if (!isNaN(golesLocal) && !isNaN(golesVisitante)) {
                    const equipoLocal = equipos[partido.local];
                    const equipoVisitante = equipos[partido.visitante];
                    
                    equipoLocal.partidosJugados++;
                    equipoVisitante.partidosJugados++;
                    
                    equipoLocal.golesFavor += golesLocal;
                    equipoLocal.golesContra += golesVisitante;
                    equipoVisitante.golesFavor += golesVisitante;
                    equipoVisitante.golesContra += golesLocal;
                    
                    if (golesLocal > golesVisitante) {
                        equipoLocal.puntos += 3;
                        equipoLocal.ganados++;
                        equipoVisitante.perdidos++;
                    } else if (golesLocal < golesVisitante) {
                        equipoVisitante.puntos += 3;
                        equipoVisitante.ganados++;
                        equipoLocal.perdidos++;
                    } else {
                        equipoLocal.puntos += 1;
                        equipoVisitante.puntos += 1;
                        equipoLocal.empatados++;
                        equipoVisitante.empatados++;
                    }
                }
            }
        }
    });

    equipos.forEach(equipo => {
        equipo.diferenciaGoles = equipo.golesFavor - equipo.golesContra;
    });

    // Ordenar por puntos, diferencia de goles, goles a favor
    equipos.sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        if (b.diferenciaGoles !== a.diferenciaGoles) return b.diferenciaGoles - a.diferenciaGoles;
        return b.golesFavor - a.golesFavor;
    });

    return equipos;
}

// Renderizar partidos de un grupo
function renderizarPartidos(grupo, grupoIndex) {
    const partidos = resultados[grupoIndex]?.partidos || [];
    
    return grupo.partidos.map((partido, partidoIndex) => {
        // Si no hay resultado, usar valores vacíos
        const resultado = partidos[partidoIndex] || { golesLocal: '', golesVisitante: '' };
        // Normalizar valores null/undefined a string vacío
        const golesLocal = (resultado.golesLocal === null || resultado.golesLocal === undefined) ? '' : resultado.golesLocal;
        const golesVisitante = (resultado.golesVisitante === null || resultado.golesVisitante === undefined) ? '' : resultado.golesVisitante;
        const yaJugado = typeof partidoYaJugado === 'function' ? partidoYaJugado(grupoIndex, partidoIndex) : false;
        
        // Verificar si tiene predicción existente
        const tienePrediccion = golesLocal !== '' || golesVisitante !== '';
        
        // Verificar si se puede modificar la predicción según las reglas de fecha
        const puedeModificar = typeof sePuedeModificarPrediccion === 'function' 
            ? sePuedeModificarPrediccion(grupoIndex, partidoIndex, tienePrediccion)
            : true;
        
        // En los partidos, solo mostrar el nombre del equipo (usando la selección si existe)
        const equipoLocalNombre = obtenerNombreEquipo(grupo, grupoIndex, partido.local);
        const equipoVisitanteNombre = obtenerNombreEquipo(grupo, grupoIndex, partido.visitante);
        const equipoLocalOriginal = grupo.equipos[partido.local];
        const equipoVisitanteOriginal = grupo.equipos[partido.visitante];
        const banderaLocal = obtenerBanderaPais(equipoLocalOriginal);
        const banderaVisitante = obtenerBanderaPais(equipoVisitanteOriginal);
        const banderaLocalHtml = banderaLocal ? `<img src="${banderaLocal}" alt="${equipoLocalNombre}" style="width: 24px; height: 18px; vertical-align: middle; border: 1px solid #ddd; border-radius: 2px;">` : '';
        const banderaVisitanteHtml = banderaVisitante ? `<img src="${banderaVisitante}" alt="${equipoVisitanteNombre}" style="width: 24px; height: 18px; vertical-align: middle; border: 1px solid #ddd; border-radius: 2px;">` : '';
        
        // Deshabilitar si ya se jugó O si no se puede modificar según las reglas de fecha
        const disabledAttr = (yaJugado || !puedeModificar) ? 'disabled readonly' : '';
        const readonlyClass = (yaJugado || !puedeModificar) ? 'partido-ya-jugado' : '';
        
        // Obtener fecha y horario del partido
        const fechaHorario = typeof obtenerFechaHorarioPartido === 'function' 
            ? obtenerFechaHorarioPartido(grupoIndex, partidoIndex)
            : { fecha: '', horario: '' };
        
        // Formatear fecha para mostrar
        const t = typeof window.t === 'function' ? window.t : (key) => key;
        let fechaFormateada = '';
        let diaSemana = '';
        if (fechaHorario.fecha) {
            const fechaObj = new Date(fechaHorario.fecha + 'T00:00:00');
            const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'es';
            const dias = lang === 'en' 
                ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const meses = lang === 'en'
                ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                : ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
            diaSemana = dias[fechaObj.getDay()];
            fechaFormateada = `${fechaObj.getDate()} ${meses[fechaObj.getMonth()]}`;
        }
        
        return `
            <div class="partido ${readonlyClass}">
                <div class="partido-fecha-horario">
                    ${fechaHorario.fecha ? `<span class="fecha-partido">${diaSemana} ${fechaFormateada}</span>` : ''}
                    ${fechaHorario.horario ? `<span class="horario-partido">${fechaHorario.horario}</span>` : ''}
                </div>
                <div class="partido-equipos-resultado" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                    <div class="bandera-local" style="flex-shrink: 0;">${banderaLocalHtml}</div>
                    <span class="equipo equipo-local" style="flex: 1; text-align: left;">${equipoLocalNombre}</span>
                    <div class="resultado-input" style="flex-shrink: 0;">
                        <input type="number" min="0" max="20" 
                               value="${golesLocal}" 
                               data-grupo="${grupoIndex}" 
                               data-partido="${partidoIndex}" 
                               data-tipo="local"
                               placeholder="-"
                               ${disabledAttr}>
                        <span class="separador">-</span>
                        <input type="number" min="0" max="20" 
                               value="${golesVisitante}" 
                               data-grupo="${grupoIndex}" 
                               data-partido="${partidoIndex}" 
                               data-tipo="visitante"
                               placeholder="-"
                               ${disabledAttr}>
                    </div>
                    <span class="equipo equipo-visitante" style="flex: 1; text-align: left;">${equipoVisitanteNombre}</span>
                    <div class="bandera-visitante" style="flex-shrink: 0;">${banderaVisitanteHtml}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Función para validar input en tiempo real
function validarInputResultado(input) {
    const valor = input.value.trim();
    
    // Permitir vacío mientras se escribe
    if (valor === '') {
        input.classList.remove('input-invalido');
        return true;
    }
    
    // Solo permitir números
    if (!/^\d+$/.test(valor)) {
        input.classList.add('input-invalido');
        return false;
    }
    
    const num = parseInt(valor);
    
    // Validar rango 0-20
    if (num < 0 || num > 20) {
        input.classList.add('input-invalido');
        return false;
    }
    
    input.classList.remove('input-invalido');
    return true;
}

// Convertir resultados a formato legible con nombres de países
function convertirResultadosALegible(resultados) {
    const predicciones = {
        version: '1.0',
        fechaExportacion: new Date().toISOString(),
        grupos: {},
        eliminatorias: {}
    };
    
    // Procesar grupos
    Object.keys(resultados).forEach(key => {
        const grupoIndex = parseInt(key);
        if (!isNaN(grupoIndex) && grupoIndex >= 0 && grupoIndex < 12) {
            const grupo = GRUPOS_MUNDIAL_2026[grupoIndex];
            if (grupo) {
                const grupoData = resultados[key];
                const partidosLegibles = [];
                
                grupo.partidos.forEach((partido, partidoIndex) => {
                    const resultado = grupoData.partidos?.[partidoIndex] || {};
                    const equipoLocal = grupo.equipos[partido.local];
                    const equipoVisitante = grupo.equipos[partido.visitante];
                    
                    partidosLegibles.push({
                        partido: partidoIndex + 1,
                        fecha: partido.fecha,
                        local: equipoLocal,
                        visitante: equipoVisitante,
                        resultado: {
                            golesLocal: resultado.golesLocal || '',
                            golesVisitante: resultado.golesVisitante || ''
                        }
                    });
                });
                
                predicciones.grupos[grupo.nombre] = {
                    partidos: partidosLegibles,
                    posiciones: grupoData.posiciones || [],
                    playoffSelecciones: grupoData.playoffSelecciones || {}
                };
            }
        } else {
            // Es una fase de eliminatorias
            predicciones.eliminatorias[key] = resultados[key];
        }
    });
    
    return predicciones;
}

// Event listeners para inputs de resultados y selects de playoffs
document.addEventListener('input', (e) => {
    // Validar inputs numéricos en tiempo real
    if (e.target.type === 'number' && (e.target.hasAttribute('data-grupo') || e.target.hasAttribute('data-eliminatoria'))) {
        if (!validarInputResultado(e.target)) {
            // Si es inválido, no procesar el cambio
            return;
        }
    }
    
    // Para grupos
    if (e.target.hasAttribute('data-grupo')) {
        // Verificar si el partido ya se jugó
        const grupoIndex = parseInt(e.target.getAttribute('data-grupo'));
        const partidoIndex = parseInt(e.target.getAttribute('data-partido'));
        
        if (typeof partidoYaJugado === 'function' && partidoYaJugado(grupoIndex, partidoIndex)) {
            e.preventDefault();
            e.target.blur();
            return;
        }
        
        // Verificar si se puede modificar según las reglas de fecha
        const resultadoActual = resultados[grupoIndex]?.partidos?.[partidoIndex] || { golesLocal: '', golesVisitante: '' };
        const tienePrediccion = resultadoActual.golesLocal !== '' || resultadoActual.golesVisitante !== '';
        
        if (typeof sePuedeModificarPrediccion === 'function' && !sePuedeModificarPrediccion(grupoIndex, partidoIndex, tienePrediccion)) {
            e.preventDefault();
            e.target.blur();
            // Mostrar mensaje informativo
            if (typeof mostrarModal === 'function') {
                mostrarModal({
                    titulo: 'Predicción no modificable',
                    mensaje: 'Las predicciones existentes no se pueden modificar después del 7 de junio. Solo puedes hacer nuevas predicciones de partidos que aún no han empezado.',
                    cancelar: false
                });
            } else {
                alert('Las predicciones existentes no se pueden modificar después del 7 de junio.');
            }
            return;
        }
        
        const tipo = e.target.getAttribute('data-tipo');
        
        if (!resultados[grupoIndex]) {
            resultados[grupoIndex] = { partidos: [], posiciones: [], playoffSelecciones: {} };
        }
        
        if (!resultados[grupoIndex].partidos[partidoIndex]) {
            resultados[grupoIndex].partidos[partidoIndex] = { golesLocal: '', golesVisitante: '' };
        }
        
        // Guardar el valor (incluso si es vacío, se guarda como string vacío)
        const valorIngresado = e.target.value || '';
        resultados[grupoIndex].partidos[partidoIndex][tipo === 'local' ? 'golesLocal' : 'golesVisitante'] = valorIngresado;
        
        // Si se ingresó un valor y el otro campo está vacío, convertir el otro en "0"
        const otroTipo = tipo === 'local' ? 'golesVisitante' : 'golesLocal';
        const otroValor = resultados[grupoIndex].partidos[partidoIndex][otroTipo];
        
        if (valorIngresado !== '' && (otroValor === '' || otroValor === null || otroValor === undefined)) {
            resultados[grupoIndex].partidos[partidoIndex][otroTipo] = '0';
        }
        
        guardarResultados();
        renderizarGrupos();
        // Actualizar eliminatorias inmediatamente para que los ganadores se propaguen
        actualizarEliminatorias();
        return;
    }
    
    // Para eliminatorias
    if (e.target.hasAttribute('data-eliminatoria')) {
        const fase = e.target.getAttribute('data-eliminatoria');
        const partidoIndex = parseInt(e.target.getAttribute('data-partido'));
        
        // Verificar si el partido ya se jugó
        if (typeof partidoEliminatoriaYaJugado === 'function' && partidoEliminatoriaYaJugado(fase, partidoIndex)) {
            e.preventDefault();
            e.target.blur();
            return;
        }
        
        // Verificar si se puede modificar según las reglas de fecha
        const resultadoActual = resultados[fase]?.[partidoIndex] || { golesLocal: '', golesVisitante: '' };
        const tienePrediccion = resultadoActual.golesLocal !== '' || resultadoActual.golesVisitante !== '';
        
        if (typeof sePuedeModificarPrediccionEliminatoria === 'function' && !sePuedeModificarPrediccionEliminatoria(fase, partidoIndex, tienePrediccion)) {
            e.preventDefault();
            e.target.blur();
            // Mostrar mensaje informativo
            if (typeof mostrarModal === 'function') {
                mostrarModal({
                    titulo: 'Predicción no modificable',
                    mensaje: 'Las predicciones existentes no se pueden modificar después del 7 de junio. Solo puedes hacer nuevas predicciones de partidos que aún no han empezado.',
                    cancelar: false
                });
            } else {
                alert('Las predicciones existentes no se pueden modificar después del 7 de junio.');
            }
            return;
        }
        
        const tipo = e.target.getAttribute('data-tipo');
        
        if (!resultados[fase]) {
            resultados[fase] = {};
        }
        
        if (!resultados[fase][partidoIndex]) {
            resultados[fase][partidoIndex] = { golesLocal: '', golesVisitante: '' };
        }
        
        // Guardar el valor (incluso si es vacío, se guarda como string vacío)
        resultados[fase][partidoIndex][tipo === 'local' ? 'golesLocal' : 'golesVisitante'] = e.target.value || '';
        
        guardarResultados();
        
        // Actualizar todas las eliminatorias y re-renderizar el bracket inmediatamente
        actualizarEliminatorias();
    }
});

// Event listener para cambios en selects de playoffs
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('playoff-select')) {
        const grupoIndex = parseInt(e.target.getAttribute('data-grupo'));
        const equipoIndex = parseInt(e.target.getAttribute('data-equipo'));
        const seleccion = e.target.value;
        
        if (!resultados[grupoIndex]) {
            resultados[grupoIndex] = { partidos: [], posiciones: [], playoffSelecciones: {} };
        }
        
        if (!resultados[grupoIndex].playoffSelecciones) {
            resultados[grupoIndex].playoffSelecciones = {};
        }
        
        resultados[grupoIndex].playoffSelecciones[equipoIndex] = seleccion;
        
        // Actualizar la bandera visualmente
        const selectElement = e.target;
        const containerDiv = selectElement.parentElement;
        const flagElement = containerDiv.querySelector('.playoff-flag, .playoff-flag-placeholder');
        
        if (seleccion) {
            const bandera = obtenerBanderaPais(seleccion);
            if (bandera && flagElement) {
                if (flagElement.classList.contains('playoff-flag-placeholder')) {
                    flagElement.outerHTML = `<img src="${bandera}" alt="${seleccion}" class="playoff-flag" style="width: 20px; height: 15px; vertical-align: middle; margin-right: 6px; border: 1px solid #ddd; border-radius: 2px; display: inline-block;">`;
                } else {
                    flagElement.src = bandera;
                    flagElement.alt = seleccion;
                }
            }
        } else {
            if (flagElement && !flagElement.classList.contains('playoff-flag-placeholder')) {
                flagElement.outerHTML = `<div class="playoff-flag-placeholder" style="width: 20px; height: 15px; border: 1px solid #ddd; border-radius: 2px; display: inline-block; background: white; margin-right: 6px; vertical-align: middle;"></div>`;
            }
        }
        
        guardarResultados();
        renderizarGrupos();
        // Actualizar eliminatorias inmediatamente
        actualizarEliminatorias();
    }
});

// Configurar tabs
function configurarTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tab).classList.add('active');
            
            // Si se activa la pestaña de eliminatorias, actualizarla
            if (tab === 'eliminatorias') {
                actualizarBracketCompleto();
            }
            
            // Si se activa la pestaña de torneo, renderizarla
            if (tab === 'torneo') {
                if (typeof renderizarTorneo === 'function') {
                    renderizarTorneo();
                }
            }
        });
    });
    
    // Configurar enlaces de ciudades
    configurarEnlacesCiudades();
    
    // Configurar botón de reglas del torneo
    configurarBotonReglasTorneo();
}

// Configurar botón de reglas del torneo
function configurarBotonReglasTorneo() {
    const btnReglas = document.getElementById('btn-reglas-torneo');
    const modalOverlay = document.getElementById('modal-reglas-torneo-overlay');
    const btnCerrar = document.getElementById('modal-reglas-torneo-close');
    
    if (!btnReglas || !modalOverlay) return;
    
    // Abrir modal
    btnReglas.addEventListener('click', () => {
        // Traducir el contenido del modal antes de mostrarlo
        if (typeof translatePage === 'function') {
            translatePage();
        }
        modalOverlay.style.display = 'flex';
    });
    
    // Cerrar modal con botón X
    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });
    }
    
    // Cerrar modal al hacer clic fuera
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });
}

function configurarEnlacesCiudades() {
    document.querySelectorAll('.ciudad-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const ciudadKey = link.dataset.ciudad;
            mostrarInfoCiudad(ciudadKey);
        });
    });
}

// Mapeo de partidos específicos a ciudades
// Estructura: [grupoIndex][partidoIndex] = ciudadKey
const MAPEO_PARTIDOS_CIUDADES = {
    0: { // Grupo A
        0: 'ciudad-de-mexico', // México vs Sudáfrica - 11 jun
        1: 'toronto', // Corea del Sur vs Playoff D - 12 jun
        2: 'ciudad-de-mexico', // México vs Corea del Sur - 17 jun
        3: 'guadalajara', // Playoff D vs Sudáfrica - 16 jun
        4: 'monterrey', // Playoff D vs México - 21 jun
        5: 'vancouver' // Sudáfrica vs Corea del Sur - 21 jun
    },
    1: { // Grupo B
        0: 'toronto', // Canadá vs Playoff B1 - 11 jun
        1: 'vancouver', // Catar vs Suiza - 11 jun
        2: 'toronto', // Canadá vs Catar - 16 jun
        3: 'vancouver', // Suiza vs Playoff B1 - 16 jun
        4: 'vancouver', // Suiza vs Canadá - 20 jun
        5: 'toronto' // Playoff B1 vs Catar - 20 jun
    },
    2: { // Grupo C
        0: 'los-angeles', // Brasil vs Marruecos - 12 jun
        1: 'san-francisco', // Haití vs Escocia - 12 jun
        2: 'los-angeles', // Brasil vs Haití - 17 jun
        3: 'san-francisco', // Escocia vs Marruecos - 17 jun
        4: 'san-francisco', // Escocia vs Brasil - 21 jun
        5: 'los-angeles' // Marruecos vs Haití - 21 jun
    },
    3: { // Grupo D
        0: 'dallas', // USA vs Paraguay - 12 jun
        1: 'houston', // Australia vs Playoff C - 12 jun
        2: 'dallas', // USA vs Australia - 16 jun
        3: 'houston', // Playoff C vs Paraguay - 17 jun
        4: 'houston', // Playoff C vs USA - 21 jun
        5: 'dallas' // Paraguay vs Australia - 21 jun
    },
    4: { // Grupo E
        0: 'atlanta', // Alemania vs Curazao - 11 jun
        1: 'miami', // Costa de Marfil vs Ecuador - 12 jun
        2: 'atlanta', // Alemania vs Costa de Marfil - 16 jun
        3: 'miami', // Ecuador vs Curazao - 17 jun
        4: 'atlanta', // Ecuador vs Alemania - 20 jun
        5: 'miami' // Curazao vs Costa de Marfil - 20 jun
    },
    5: { // Grupo F
        0: 'nueva-york', // Países Bajos vs Japón - 11 jun
        1: 'filadelfia', // Playoff B2 vs Túnez - 12 jun
        2: 'nueva-york', // Países Bajos vs Playoff B2 - 16 jun
        3: 'filadelfia', // Túnez vs Japón - 17 jun
        4: 'filadelfia', // Túnez vs Países Bajos - 21 jun
        5: 'nueva-york' // Japón vs Playoff B2 - 21 jun
    },
    6: { // Grupo G
        0: 'boston', // Bélgica vs Egipto - 11 jun
        1: 'kansas-city', // Irán vs Nueva Zelanda - 12 jun
        2: 'boston', // Bélgica vs Irán - 16 jun
        3: 'kansas-city', // Nueva Zelanda vs Egipto - 17 jun
        4: 'kansas-city', // Nueva Zelanda vs Bélgica - 21 jun
        5: 'boston' // Egipto vs Irán - 21 jun
    },
    7: { // Grupo H
        0: 'seattle', // España vs Cabo Verde - 11 jun
        1: 'los-angeles', // Arabia Saudita vs Uruguay - 12 jun
        2: 'seattle', // España vs Arabia Saudita - 16 jun
        3: 'los-angeles', // Uruguay vs Cabo Verde - 17 jun
        4: 'seattle', // Uruguay vs España - 21 jun
        5: 'los-angeles' // Cabo Verde vs Arabia Saudita - 21 jun
    },
    8: { // Grupo I
        0: 'miami', // Francia vs Senegal - 11 jun
        1: 'atlanta', // Playoff 2 vs Noruega - 12 jun
        2: 'miami', // Francia vs Playoff 2 - 16 jun
        3: 'atlanta', // Noruega vs Senegal - 17 jun
        4: 'atlanta', // Noruega vs Francia - 20 jun
        5: 'miami' // Senegal vs Playoff 2 - 20 jun
    },
    9: { // Grupo J
        0: 'nueva-york', // Argentina vs Argelia - 12 jun
        1: 'filadelfia', // Austria vs Jordania - 12 jun
        2: 'nueva-york', // Argentina vs Austria - 16 jun
        3: 'filadelfia', // Jordania vs Argelia - 17 jun
        4: 'filadelfia', // Jordania vs Argentina - 21 jun
        5: 'nueva-york' // Argelia vs Austria - 21 jun
    },
    10: { // Grupo K
        0: 'boston', // Portugal vs Playoff 1 - 11 jun
        1: 'kansas-city', // Uzbekistán vs Colombia - 12 jun
        2: 'boston', // Portugal vs Uzbekistán - 16 jun
        3: 'kansas-city', // Colombia vs Playoff 1 - 17 jun
        4: 'kansas-city', // Colombia vs Portugal - 21 jun
        5: 'boston' // Playoff 1 vs Uzbekistán - 21 jun
    },
    11: { // Grupo L
        0: 'dallas', // Inglaterra vs Croacia - 11 jun
        1: 'houston', // Ghana vs Panamá - 12 jun
        2: 'dallas', // Inglaterra vs Ghana - 16 jun
        3: 'houston', // Panamá vs Croacia - 17 jun
        4: 'houston', // Panamá vs Inglaterra - 20 jun
        5: 'dallas' // Croacia vs Ghana - 20 jun
    }
};

// Función para buscar partidos por fecha y ciudad
function buscarPartidosPorFechaYCiudad(fecha, ciudadKey) {
    const partidosEncontrados = [];
    
    if (typeof GRUPOS_MUNDIAL_2026 === 'undefined' || !MAPEO_PARTIDOS_CIUDADES) return partidosEncontrados;
    
    GRUPOS_MUNDIAL_2026.forEach((grupo, grupoIndex) => {
        grupo.partidos.forEach((partido, partidoIndex) => {
            // Verificar si este partido se juega en esta ciudad
            if (MAPEO_PARTIDOS_CIUDADES[grupoIndex] && MAPEO_PARTIDOS_CIUDADES[grupoIndex][partidoIndex] === ciudadKey) {
                const fechaHorario = obtenerFechaHorarioPartido(grupoIndex, partidoIndex);
                // Verificar que la fecha coincida (puede haber diferencias por zona horaria)
                if (fechaHorario.fecha === fecha || fechaHorario.fecha === fecha.split('T')[0]) {
                    const equipoLocal = grupo.equipos[partido.local];
                    const equipoVisitante = grupo.equipos[partido.visitante];
                    
                    // Traducir nombre del grupo
                    const grupoMap = {
                        'Grupo A': t('grupoA'),
                        'Grupo B': t('grupoB'),
                        'Grupo C': t('grupoC'),
                        'Grupo D': t('grupoD'),
                        'Grupo E': t('grupoE'),
                        'Grupo F': t('grupoF'),
                        'Grupo G': t('grupoG'),
                        'Grupo H': t('grupoH'),
                        'Grupo I': t('grupoI'),
                        'Grupo J': t('grupoJ'),
                        'Grupo K': t('grupoK'),
                        'Grupo L': t('grupoL')
                    };
                    const grupoTraducido = grupoMap[grupo.nombre] || grupo.nombre;
                    
                    partidosEncontrados.push({
                        grupo: grupoTraducido,
                        local: traducirNombrePais(equipoLocal),
                        visitante: traducirNombrePais(equipoVisitante),
                        horario: fechaHorario.horario,
                        fase: t('faseGrupos')
                    });
                }
            }
        });
    });
    
    return partidosEncontrados;
}

function mostrarInfoCiudad(ciudadKey) {
    const ciudad = obtenerInfoCiudad(ciudadKey);
    if (!ciudad) return;
    
    const modal = document.getElementById('modal-ciudad-overlay');
    const title = document.getElementById('modal-ciudad-title');
    const body = document.getElementById('modal-ciudad-body');
    
    const t = typeof window.t === 'function' ? window.t : (key) => key;
    
    // Mapeo directo de claves de ciudad a claves de traducción
    const ciudadTranslationMap = {
        'toronto': 'Toronto',
        'vancouver': 'Vancouver',
        'ciudad-de-mexico': 'CiudadMexico',
        'guadalajara': 'Guadalajara',
        'monterrey': 'Monterrey',
        'atlanta': 'Atlanta',
        'boston': 'Boston',
        'dallas': 'Dallas',
        'houston': 'Houston',
        'kansas-city': 'KansasCity',
        'los-angeles': 'LosAngeles',
        'miami': 'Miami',
        'nueva-york': 'NuevaYork',
        'filadelfia': 'Filadelfia',
        'san-francisco': 'SanFrancisco',
        'seattle': 'Seattle'
    };
    
    const ciudadTranslationKey = ciudadTranslationMap[ciudadKey] || ciudadKey;
    const ciudadDescKey = `ciudad${ciudadTranslationKey}Desc`;
    const ciudadPobKey = `ciudad${ciudadTranslationKey}Pob`;
    const ciudadClimaKey = `ciudad${ciudadTranslationKey}Clima`;
    const estadioCarKey = `estadio${ciudadTranslationKey}Car`;
    
    // Obtener traducciones o usar valores por defecto
    const descripcion = t(ciudadDescKey) !== ciudadDescKey ? t(ciudadDescKey) : ciudad.ciudadInfo.descripcion;
    const poblacion = t(ciudadPobKey) !== ciudadPobKey ? t(ciudadPobKey) : ciudad.ciudadInfo.poblacion;
    const clima = t(ciudadClimaKey) !== ciudadClimaKey ? t(ciudadClimaKey) : ciudad.ciudadInfo.clima;
    const caracteristicas = t(estadioCarKey) !== estadioCarKey ? t(estadioCarKey) : ciudad.estadio.caracteristicas;
    
    title.textContent = `${ciudad.bandera} ${ciudad.nombre}, ${ciudad.pais}`;
    
    // Imagen del estadio
    const imagenEstadio = ciudad.estadio.imagen || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop';
    
    let html = `
        <div style="margin-bottom: 25px;">
            <h3 style="color: #1e3c72; margin-bottom: 15px; font-size: 1.3em;">🏙️ ${t('informacionCiudad')}</h3>
            <p style="line-height: 1.8; color: #475569; margin-bottom: 10px;">${descripcion}</p>
            <p style="line-height: 1.8; color: #475569; margin-bottom: 5px;"><strong>${t('poblacion')}</strong> ${poblacion}</p>
            <p style="line-height: 1.8; color: #475569;"><strong>${t('clima')}</strong> ${clima}</p>
        </div>
        
        <div style="margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h3 style="color: #1e3c72; margin-bottom: 15px; font-size: 1.3em;">🏟️ ${t('estadio')}</h3>
            <div style="margin-bottom: 15px;">
                <img src="${imagenEstadio}" alt="${ciudad.estadio.nombre}" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" onerror="this.src='https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop';">
            </div>
            <h4 style="color: #2a5298; margin-bottom: 10px; font-size: 1.1em;">${ciudad.estadio.nombre}</h4>
            <p style="line-height: 1.8; color: #475569; margin-bottom: 8px;"><strong>${t('capacidadLabel')}:</strong> ${ciudad.estadio.capacidad.replace('espectadores', t('espectadores')).replace('ampliable a', t('ampliableA')).replace('para el Mundial', t('paraElMundial'))}</p>
            <p style="line-height: 1.8; color: #475569; margin-bottom: 8px;"><strong>${t('inauguracion')}</strong> ${ciudad.estadio.inauguracion}</p>
            <p style="line-height: 1.8; color: #475569; margin-bottom: 8px;"><strong>${t('caracteristicas')}</strong> ${caracteristicas}</p>
            <p style="line-height: 1.8; color: #475569;"><strong>${t('direccion')}</strong> ${ciudad.estadio.direccion}</p>
        </div>
        
        <div>
            <h3 style="color: #1e3c72; margin-bottom: 15px; font-size: 1.3em;">⚽ ${t('partidosProgramados')}</h3>
            <div style="display: grid; gap: 12px;">
`;
    
    ciudad.partidos.forEach(partido => {
        const fechaFormateada = formatearFecha(partido.fecha);
        const partidosDetalle = buscarPartidosPorFechaYCiudad(partido.fecha, ciudadKey);
        
        if (partidosDetalle.length > 0) {
            // Mostrar partidos con equipos
            partidosDetalle.forEach(p => {
                html += `
                    <div style="padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 5px;">
                        <p style="margin: 0; color: #1565c0; font-weight: 600; margin-bottom: 8px;">${fechaFormateada} ${p.horario ? '• ' + p.horario : ''}</p>
                        <p style="margin: 0; color: #1e3c72; font-weight: 600; font-size: 1.05em; margin-bottom: 5px;">${p.local} vs ${p.visitante}</p>
                        <p style="margin: 0; color: #666; font-size: 0.9em;"><strong>${p.fase === 'Fase de Grupos' ? t('faseGrupos') : (p.fase === 'Dieciseisavos' ? t('dieciseisavos') : (p.fase === 'Octavos' ? t('octavos') : (p.fase === 'Cuartos' ? t('cuartos') : (p.fase === 'Semifinal' || p.fase === 'Semifinales' ? t('semifinales') : (p.fase === 'Final' ? t('final') : p.fase)))))})</strong> • ${p.grupo || ''}</p>
                    </div>
                `;
            });
        } else {
            // Mostrar partido genérico si no se encuentran detalles
            // Traducir fase y descripción
            let faseTraducida = partido.fase;
            let descripcionTraducida = partido.descripcion;
            
            // Mapeo de fases
            const faseMap = {
                'Fase de Grupos': t('faseGrupos'),
                'Dieciseisavos': t('dieciseisavos'),
                'Octavos': t('octavos'),
                'Cuartos': t('cuartos'),
                'Semifinal': t('semifinales'),
                'Semifinales': t('semifinales'),
                'Final': t('final'),
                'Tercer Puesto': t('tercerPuesto')
            };
            
            // Mapeo de descripciones
            const descMap = {
                'Partido de grupos': t('partidoGrupos'),
                'Partido inaugural de Canadá': t('partidoInauguralCanada'),
                'Partido inaugural del Mundial 2026': t('partidoInauguralMundial'),
                'Partido inaugural de EE.UU.': t('partidoInauguralEEUU'),
                'Segundo partido del grupo de EE.UU.': t('segundoPartidoEEUU'),
                'Octavos de final': t('octavosFinal'),
                'Cuartos de final': t('cuartosFinal'),
                'Semifinal': t('semifinal'),
                'Partido por el tercer puesto': t('partidoTercerPuesto'),
                'FINAL DEL MUNDIAL 2026': t('finalMundial')
            };
            
            if (faseMap[partido.fase]) {
                faseTraducida = faseMap[partido.fase];
            }
            if (descMap[partido.descripcion]) {
                descripcionTraducida = descMap[partido.descripcion];
            }
            
            html += `
                <div style="padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 5px;">
                    <p style="margin: 0; color: #1565c0; font-weight: 600; margin-bottom: 5px;">${fechaFormateada}</p>
                    <p style="margin: 0; color: #475569;"><strong>${faseTraducida}:</strong> ${descripcionTraducida}</p>
                </div>
            `;
        }
    });
    
    html += `
            </div>
        </div>
    `;
    
    body.innerHTML = html;
    modal.style.display = 'flex';
    
    // Cerrar modal
    document.getElementById('modal-ciudad-close').onclick = () => {
        modal.style.display = 'none';
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Función para mostrar información de un país
function mostrarInfoPais(paisKey) {
    if (typeof obtenerInfoPais !== 'function') {
        console.error('obtenerInfoPais no está disponible. Asegúrate de que paises-data.js esté cargado.');
        alert('Error: No se puede cargar la información del país. Por favor recarga la página.');
        return;
    }
    
    const pais = obtenerInfoPais(paisKey);
    if (!pais) {
        console.error('País no encontrado:', paisKey);
        return;
    }
    
    // Validar que el país tenga al menos los datos básicos
    if (!pais.bandera || !pais.nombre) {
        console.error('País con datos incompletos:', pais);
        alert('Error: Los datos del país están incompletos.');
        return;
    }
    
    // Asegurar que existan las estructuras necesarias aunque estén vacías
    if (!pais.camiseta) {
        pais.camiseta = { principal: '', alternativa: '', descripcion: '' };
    }
    if (!pais.jugadores) {
        pais.jugadores = [];
    }
    if (!pais.historial) {
        pais.historial = {
            participaciones: 0,
            mejorResultado: '-',
            ultimaParticipacion: '-',
            titulos: 0,
            partidosJugados: 0,
            victorias: 0,
            empates: 0,
            derrotas: 0,
            golesAFavor: 0,
            golesEnContra: 0,
            resumen: ''
        };
    }
    
    console.log('País cargado:', pais);
    
    const modal = document.getElementById('modal-pais-overlay');
    const title = document.getElementById('modal-pais-title');
    const body = document.getElementById('modal-pais-body');
    
    if (!modal || !title || !body) {
        console.error('Elementos del modal no encontrados', { modal, title, body });
        return;
    }
    
    const t = typeof window.t === 'function' ? window.t : (key) => key;
    const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'es';
    const nombrePais = lang === 'en' ? pais.nombreIngles : pais.nombre;
    const apodo = lang === 'en' ? (pais.apodoIngles || pais.apodo) : pais.apodo;
    const directorTecnico = lang === 'en' ? (pais.directorTecnicoIngles || pais.directorTecnico) : pais.directorTecnico;
    
    // Título del modal sin "MX", solo bandera y nombre
    const banderaImg = pais.bandera || '';
    title.innerHTML = `<img src="${banderaImg}" alt="${nombrePais}" style="width: 24px; height: 18px; vertical-align: middle; margin-right: 8px; border: 1px solid #ddd; border-radius: 2px;"> ${nombrePais}${apodo ? ` - ${apodo}` : ''}`;
    
    // Header con nombre y apodo
    let html = `
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 1.8em; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px;">
                <img src="${banderaImg}" alt="${nombrePais}" style="width: 40px; height: 30px; border: 1px solid rgba(255,255,255,0.3); border-radius: 3px;"> <span>${nombrePais}</span>
            </h2>
            ${apodo ? `<p style="margin: 8px 0 0 0; font-size: 1.1em; color: white;">${apodo}</p>` : ''}
        </div>
        
        ${pais.camiseta && (pais.camiseta.principal || pais.camiseta.alternativa || pais.camiseta.descripcion) ? `
        <div style="margin-bottom: 25px;">
            <h3 style="color: #1e3c72; margin-bottom: 20px; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.5em;">👕</span> ${t('camiseta')}
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; margin-bottom: 15px;">
                ${pais.camiseta.principal ? `
                <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                    <h4 style="color: #2a5298; margin-bottom: 15px; font-size: 1.1em; font-weight: 600;">${t('camisetaPrincipal')}</h4>
                    <img src="${pais.camiseta.principal}" alt="${t('camisetaPrincipal')}" style="width: 100%; max-width: 250px; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); margin-bottom: 15px;" onerror="this.style.display='none';">
                    ${pais.camiseta.descripcion ? `<p style="margin: 0; color: #666; font-size: 0.9em; line-height: 1.5;">${pais.camiseta.descripcion}</p>` : ''}
                </div>
                ` : ''}
                ${pais.camiseta.alternativa ? `
                <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                    <h4 style="color: #2a5298; margin-bottom: 15px; font-size: 1.1em; font-weight: 600;">${t('camisetaAlternativa')}</h4>
                    <img src="${pais.camiseta.alternativa}" alt="${t('camisetaAlternativa')}" style="width: 100%; max-width: 250px; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); margin-bottom: 15px;" onerror="this.style.display='none';">
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        ${pais.jugadores && pais.jugadores.length > 0 ? (() => {
    // Ordenar jugadores por número de camiseta
    const jugadoresOrdenados = [...pais.jugadores].sort((a, b) => (a.numero || 0) - (b.numero || 0));
    let jugadoresHtml = `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #1e3c72; margin-bottom: 10px; font-size: 1.1em; display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 1.1em;">⚽</span> ${t('jugadores')}
            </h3>
            <div style="background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f5f5f5; border-bottom: 1px solid #e0e0e0;">
                            <th style="padding: 8px 10px; text-align: left; font-size: 0.8em; color: #666; font-weight: 600; width: 35px;">#</th>
                            <th style="padding: 8px 10px; text-align: left; font-size: 0.8em; color: #666; font-weight: 600;">${lang === 'en' ? 'Name' : 'Nombre'}</th>
                            <th style="padding: 8px 10px; text-align: left; font-size: 0.8em; color: #666; font-weight: 600;">${t('posicion')}</th>
                            <th style="padding: 8px 10px; text-align: left; font-size: 0.8em; color: #666; font-weight: 600;">${t('club')}</th>
                            <th style="padding: 8px 10px; text-align: left; font-size: 0.8em; color: #666; font-weight: 600;">${lang === 'en' ? 'Age' : 'Edad'}</th>
                        </tr>
                    </thead>
                    <tbody>
`;
    
    jugadoresOrdenados.forEach((jugador, index) => {
        const rowStyle = index % 2 === 0 ? 'background: #fafafa;' : 'background: white;';
        jugadoresHtml += `
                        <tr style="${rowStyle} border-bottom: 1px solid #f0f0f0;">
                            <td style="padding: 7px 10px; font-weight: 600; color: #2196f3; font-size: 0.85em;">${jugador.numero || '-'}</td>
                            <td style="padding: 7px 10px; color: #1e3c72; font-weight: 500; font-size: 0.85em;">${jugador.nombre || '-'}</td>
                            <td style="padding: 7px 10px; color: #666; font-size: 0.8em;">${jugador.posicion || '-'}</td>
                            <td style="padding: 7px 10px; color: #666; font-size: 0.8em;">${jugador.club || '-'}</td>
                            <td style="padding: 7px 10px; color: #666; font-size: 0.8em;">${jugador.edad ? `${jugador.edad} ${lang === 'en' ? 'yrs' : 'años'}` : '-'}</td>
                        </tr>
        `;
    });
    
    // Agregar director técnico separado al final
    if (directorTecnico) {
        jugadoresHtml += `
                        <tr style="background: #fff3cd; border-bottom: 1px solid #f0f0f0;">
                            <td style="padding: 7px 10px; font-weight: 600; color: #856404; font-size: 0.85em;">👔</td>
                            <td style="padding: 7px 10px; color: #856404; font-weight: 600; font-size: 0.85em;">${directorTecnico}</td>
                            <td style="padding: 7px 10px; color: #856404; font-size: 0.8em;">${t('directorTecnico')}</td>
                            <td style="padding: 7px 10px; color: #856404; font-size: 0.8em;">-</td>
                            <td style="padding: 7px 10px; color: #856404; font-size: 0.8em;">${pais.edadDT ? `${pais.edadDT} ${lang === 'en' ? 'yrs' : 'años'}` : '-'}</td>
                        </tr>
        `;
    }
    
    jugadoresHtml += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    return jugadoresHtml;
})() : ''}
        
        <div style="margin-bottom: 25px;">
            <h3 style="color: #1e3c72; margin-bottom: 12px; font-size: 1.2em; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.2em;">🏆</span> ${t('historialMundial')}
            </h3>
            ${pais.historial.resumen ? `<p style="background: #e3f2fd; padding: 10px 12px; border-radius: 6px; margin-bottom: 12px; color: #475569; font-size: 0.9em; line-height: 1.5; border-left: 3px solid #2196f3;">${pais.historial.resumen}</p>` : ''}
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
                    <h4 style="color: #2a5298; margin-bottom: 10px; font-size: 0.95em; font-weight: 600; border-bottom: 1px solid #e3f2fd; padding-bottom: 6px;">${lang === 'en' ? 'General' : 'General'}</h4>
                    <p style="margin: 6px 0; color: #475569; font-size: 0.85em; display: flex; justify-content: space-between;"><strong>${t('participaciones')}:</strong> <span style="color: #1e3c72; font-weight: 600;">${pais.historial.participaciones}</span></p>
                    <p style="margin: 6px 0; color: #475569; font-size: 0.85em; display: flex; justify-content: space-between;"><strong>${t('mejorResultado')}:</strong> <span style="color: #1e3c72; font-weight: 600; text-align: right; flex: 1; margin-left: 8px; font-size: 0.8em;">${pais.historial.mejorResultado}</span></p>
                    <p style="margin: 6px 0; color: #475569; font-size: 0.85em; display: flex; justify-content: space-between;"><strong>${t('ultimaParticipacion')}:</strong> <span style="color: #1e3c72; font-weight: 600;">${pais.historial.ultimaParticipacion}</span></p>
                    <p style="margin: 6px 0; color: #475569; font-size: 0.85em; display: flex; justify-content: space-between;"><strong>${t('titulos')}:</strong> <span style="color: #1e3c72; font-weight: 600;">${pais.historial.titulos}</span></p>
                </div>
                <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
                    <h4 style="color: #2a5298; margin-bottom: 10px; font-size: 0.95em; font-weight: 600; border-bottom: 1px solid #e3f2fd; padding-bottom: 6px;">${lang === 'en' ? 'Matches' : 'Partidos'}</h4>
                    <p style="margin: 6px 0; color: #475569; font-size: 0.85em; display: flex; justify-content: space-between;"><strong>${t('partidosJugados')}:</strong> <span style="color: #1e3c72; font-weight: 600;">${pais.historial.partidosJugados}</span></p>
                    <p style="margin: 6px 0; color: #475569; font-size: 0.85em; display: flex; justify-content: space-between;"><strong>${t('victorias')}:</strong> <span style="color: #4caf50; font-weight: 600;">${pais.historial.victorias}</span></p>
                    <p style="margin: 6px 0; color: #475569; font-size: 0.85em; display: flex; justify-content: space-between;"><strong>${t('empates')}:</strong> <span style="color: #ff9800; font-weight: 600;">${pais.historial.empates}</span></p>
                    <p style="margin: 6px 0; color: #475569; font-size: 0.85em; display: flex; justify-content: space-between;"><strong>${t('derrotas')}:</strong> <span style="color: #f44336; font-weight: 600;">${pais.historial.derrotas}</span></p>
                </div>
                <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
                    <h4 style="color: #2a5298; margin-bottom: 10px; font-size: 0.95em; font-weight: 600; border-bottom: 1px solid #e3f2fd; padding-bottom: 6px;">${lang === 'en' ? 'Goals' : 'Goles'}</h4>
                    <p style="margin: 6px 0; color: #475569; font-size: 0.85em; display: flex; justify-content: space-between;"><strong>${t('golesAFavor')}:</strong> <span style="color: #4caf50; font-weight: 600;">${pais.historial.golesAFavor}</span></p>
                    <p style="margin: 6px 0; color: #475569; font-size: 0.85em; display: flex; justify-content: space-between;"><strong>${t('golesEnContra')}:</strong> <span style="color: #f44336; font-weight: 600;">${pais.historial.golesEnContra}</span></p>
                    <p style="margin: 6px 0; color: #475569; font-size: 0.85em; display: flex; justify-content: space-between;"><strong>${lang === 'en' ? 'Goal Difference' : 'Diferencia'}:</strong> <span style="color: ${pais.historial.golesAFavor - pais.historial.golesEnContra >= 0 ? '#4caf50' : '#f44336'}; font-weight: 600;">${pais.historial.golesAFavor - pais.historial.golesEnContra > 0 ? '+' : ''}${pais.historial.golesAFavor - pais.historial.golesEnContra}</span></p>
                </div>
            </div>
        </div>
    `;
    
    console.log('HTML generado:', html.substring(0, 500));
    console.log('Body element:', body);
    console.log('Modal element:', modal);
    
    if (!body) {
        console.error('Body no encontrado!');
        return;
    }
    
    body.innerHTML = html;
    modal.style.display = 'flex';
    console.log('Modal mostrado, display:', modal.style.display);
    console.log('Body innerHTML length:', body.innerHTML.length);
    
    // Cerrar modal
    document.getElementById('modal-pais-close').onclick = () => {
        modal.style.display = 'none';
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Configurar botones
function configurarBotones() {
    // El botón reset-btn ya no existe en el HTML (está en el menú de usuario)
    // Este código se mantiene por compatibilidad pero el botón ya no existe
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const mensajeConfirmacion = typeof t === 'function' ? t('confirmarResetear') : '¿Estás seguro de que quieres resetear todas las predicciones?';
            if (confirm(mensajeConfirmacion)) {
                localStorage.removeItem('mundial2026_resultados');
                inicializarResultados();
                renderizarGrupos();
                actualizarEliminatorias();
            }
        });
    }
    
    // Botón de enviar predicciones
    document.getElementById('enviar-predicciones-btn')?.addEventListener('click', () => {
        if (typeof mostrarDialogoEnviarPredicciones === 'function') {
            mostrarDialogoEnviarPredicciones();
        }
    });
    
    // El botón de exportar ahora está en el menú de usuario (auth-ui.js)
    // Este código se mantiene por compatibilidad pero el botón ya no existe en el HTML
    document.getElementById('export-btn')?.addEventListener('click', () => {
        let datosExportar = resultados;
        if (typeof convertirResultadosALegible === 'function') {
            datosExportar = convertirResultadosALegible(resultados);
        }
        const dataStr = JSON.stringify(datosExportar, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mundial2026_predicciones.json';
        link.click();
    });
    
    // El botón import-btn ahora está en el menú de usuario (auth-ui.js)
    // Este código se mantiene por compatibilidad pero el botón ya no existe en el HTML
    document.getElementById('import-btn')?.addEventListener('click', () => {
        document.getElementById('import-file')?.click();
    });
    
    // El input import-file todavía existe (oculto) y se usa desde el menú
    const importFile = document.getElementById('import-file');
    if (importFile) {
        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        resultados = JSON.parse(event.target.result);
                        guardarResultados();
                        renderizarGrupos();
                        actualizarEliminatorias();
                        alert('Predicciones importadas correctamente');
                    } catch (error) {
                        alert('Error al importar el archivo');
                    }
                };
                reader.readAsText(file);
            }
            // Resetear el input para permitir importar el mismo archivo de nuevo
            e.target.value = '';
        });
    }
    
    // Botón de actualizar resultados desde API
    const actualizarBtn = document.getElementById('actualizar-resultados-btn');
    if (actualizarBtn) {
        actualizarBtn.addEventListener('click', async () => {
            if (!tieneApiConfigurada()) {
                if (typeof mostrarModal === 'function') {
                    await mostrarModal({
                        titulo: 'API no configurada',
                        mensaje: 'No hay una API configurada. Por favor, configura una API en api-config.js para usar esta función.',
                        cancelar: false
                    });
                } else {
                    alert('No hay una API configurada. Por favor, configura una API en api-config.js');
                }
                return;
            }
            
            actualizarBtn.disabled = true;
            actualizarBtn.textContent = '🔄 Actualizando...';
            
            try {
                if (typeof actualizarResultadosDesdeAPI === 'function') {
                    const resultado = await actualizarResultadosDesdeAPI();
                    
                    if (resultado && resultado.exito) {
                        if (typeof mostrarModal === 'function') {
                            await mostrarModal({
                                titulo: '¡Actualización Exitosa!',
                                mensaje: resultado.mensaje || `Se actualizaron ${resultado.actualizados || 0} resultados`,
                                cancelar: false
                            });
                        } else {
                            alert(resultado.mensaje || 'Resultados actualizados correctamente');
                        }
                    } else {
                        if (typeof mostrarModal === 'function') {
                            await mostrarModal({
                                titulo: 'Sin actualizaciones',
                                mensaje: resultado?.mensaje || 'No se encontraron resultados nuevos para actualizar',
                                cancelar: false
                            });
                        } else {
                            alert(resultado?.mensaje || 'No se encontraron resultados nuevos');
                        }
                    }
                }
            } catch (error) {
                if (typeof mostrarModal === 'function') {
                    await mostrarModal({
                        titulo: 'Error',
                        mensaje: 'Hubo un error al actualizar los resultados. Por favor, intenta de nuevo.',
                        cancelar: false
                    });
                } else {
                    alert('Error al actualizar los resultados');
                }
            } finally {
                actualizarBtn.disabled = false;
                actualizarBtn.textContent = '🔄 Actualizar Resultados';
            }
        });
    }
    
    // Checkbox de actualización automática
    const autoUpdateCheckbox = document.getElementById('auto-update-checkbox');
    if (autoUpdateCheckbox) {
        // Cargar estado guardado
        const autoUpdateGuardado = localStorage.getItem('mundial2026_auto_update');
        if (autoUpdateGuardado === 'true') {
            autoUpdateCheckbox.checked = true;
            if (typeof iniciarActualizacionAutomatica === 'function') {
                iniciarActualizacionAutomatica();
            }
        }
        
        autoUpdateCheckbox.addEventListener('change', (e) => {
            const activado = e.target.checked;
            localStorage.setItem('mundial2026_auto_update', activado ? 'true' : 'false');
            
            if (activado) {
                if (!tieneApiConfigurada()) {
                    e.target.checked = false;
                    if (typeof mostrarModal === 'function') {
                        mostrarModal({
                            titulo: 'API no configurada',
                            mensaje: 'No hay una API configurada. Por favor, configura una API en api-config.js para usar la actualización automática.',
                            cancelar: false
                        });
                    } else {
                        alert('No hay una API configurada');
                    }
                    return;
                }
                
                API_CONFIG.autoUpdate = true;
                if (typeof iniciarActualizacionAutomatica === 'function') {
                    iniciarActualizacionAutomatica();
                }
            } else {
                API_CONFIG.autoUpdate = false;
                if (typeof detenerActualizacionAutomatica === 'function') {
                    detenerActualizacionAutomatica();
                }
            }
        });
    }
}

// Obtener equipos clasificados
function obtenerClasificados() {
    const clasificados = {
        primeros: [],
        segundos: [],
        terceros: []
    };
    
    GRUPOS_MUNDIAL_2026.forEach((grupo, grupoIndex) => {
        const posiciones = calcularPosiciones(grupo, grupoIndex);
        clasificados.primeros.push({
            grupo: grupo.nombre, // Mantener nombre original para comparaciones
            equipo: obtenerNombreEquipo(grupo, grupoIndex, posiciones[0].indice),
            datos: posiciones[0]
        });
        clasificados.segundos.push({
            grupo: grupo.nombre, // Mantener nombre original para comparaciones
            equipo: obtenerNombreEquipo(grupo, grupoIndex, posiciones[1].indice),
            datos: posiciones[1]
        });
        clasificados.terceros.push({
            grupo: grupo.nombre, // Mantener nombre original para comparaciones
            equipo: obtenerNombreEquipo(grupo, grupoIndex, posiciones[2].indice),
            datos: posiciones[2]
        });
    });
    
    // Ordenar terceros para obtener los 8 mejores
    clasificados.terceros.sort((a, b) => {
        if (b.datos.puntos !== a.datos.puntos) return b.datos.puntos - a.datos.puntos;
        if (b.datos.diferenciaGoles !== a.datos.diferenciaGoles) return b.diferenciaGoles - a.diferenciaGoles;
        return b.datos.golesFavor - a.datos.golesFavor;
    });
    
    return clasificados;
}

// Generar cruces de dieciseisavos
function generarDieciseisavos() {
    const clasificados = obtenerClasificados();
    const partidos = [];
    
    // Los 8 mejores terceros se distribuyen según el formato del Mundial 2026
    const mejoresTerceros = clasificados.terceros.slice(0, 8);
    
    // Generar 16 partidos: 12 primeros y segundos + 8 mejores terceros
    // Primera mitad: primeros vs segundos (8 partidos)
    for (let i = 0; i < 8; i++) {
        const porDefinir = typeof t === 'function' ? t('porDefinir') : 'Por definir';
        const primero = clasificados.primeros[i] || { equipo: porDefinir, grupo: '', datos: {} };
        const segundo = clasificados.segundos[i] || { equipo: porDefinir, grupo: '', datos: {} };
        partidos.push({
            local: { ...primero, posicion: '1º' },
            visitante: { ...segundo, posicion: '2º' }
        });
    }
    
    // Segunda mitad: primeros restantes vs mejores terceros (8 partidos)
    for (let i = 0; i < 8; i++) {
        const primerIndex = (i + 4) % 12;
        const porDefinir = typeof t === 'function' ? t('porDefinir') : 'Por definir';
        const primero = clasificados.primeros[primerIndex] || mejoresTerceros[i] || { equipo: porDefinir, grupo: '', datos: {} };
        const tercero = mejoresTerceros[i] || clasificados.segundos[primerIndex] || { equipo: porDefinir, grupo: '', datos: {} };
        partidos.push({
            local: { ...primero, posicion: primero.grupo ? '1º' : (tercero.grupo ? '3º' : '') },
            visitante: { ...tercero, posicion: tercero.grupo ? '3º' : (primero.grupo ? '1º' : '') }
        });
    }
    
    // Asegurar que siempre haya 16 partidos
    while (partidos.length < 16) {
        partidos.push({
            local: { equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' },
            visitante: { equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' }
        });
    }
    
    return partidos.slice(0, 16);
}

// Actualizar todas las eliminatorias
function actualizarEliminatorias() {
    actualizarDieciseisavos();
    actualizarOctavos();
    actualizarCuartos();
    actualizarSemis();
    actualizarFinal();
    actualizarBracketCompleto();
}


// Actualizar dieciseisavos
function actualizarDieciseisavos() {
    partidosDieciseisavos = generarDieciseisavos();
}

// Almacenar partidos de cada fase para referencia
let partidosDieciseisavos = [];
let partidosOctavos = [];
let partidosCuartos = [];
let partidosSemis = [];
let partidoFinal = null;

// Actualizar octavos
function actualizarOctavos() {
    const ganadores = obtenerGanadores('dieciseisavos', partidosDieciseisavos);
    partidosOctavos = [];
    
    // Generar 8 partidos de octavos
    for (let i = 0; i < 16; i += 2) {
        partidosOctavos.push({
            local: ganadores[i] || { equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' },
            visitante: ganadores[i + 1] || { equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' }
        });
    }
}

// Actualizar cuartos
function actualizarCuartos() {
    const ganadores = obtenerGanadores('octavos', partidosOctavos);
    partidosCuartos = [];
    
    // Generar 4 partidos de cuartos
    for (let i = 0; i < 8; i += 2) {
        partidosCuartos.push({
            local: ganadores[i] || { equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' },
            visitante: ganadores[i + 1] || { equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' }
        });
    }
}

// Actualizar semis
function actualizarSemis() {
    const ganadores = obtenerGanadores('cuartos', partidosCuartos);
    partidosSemis = [];
    
    // Generar 2 partidos de semis
    for (let i = 0; i < 4; i += 2) {
        partidosSemis.push({
            local: ganadores[i] || { equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' },
            visitante: ganadores[i + 1] || { equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' }
        });
    }
}

// Actualizar final
function actualizarFinal() {
    const ganadores = obtenerGanadores('semis', partidosSemis);
    
    partidoFinal = {
        local: ganadores[0] || { equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' },
        visitante: ganadores[1] || { equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' }
    };
}

// Actualizar bracket completo con diseño simétrico (izquierda-derecha-final en el centro)
function actualizarBracketCompleto() {
    const container = document.getElementById('bracket-completo-container');
    container.innerHTML = '';
    
    const bracketDiv = document.createElement('div');
    bracketDiv.className = 'bracket';
    
    // Estructura: 5 columnas en cada lado + 1 columna central para la final
    // Columnas: Dieciseisavos Izq, Octavos Izq, Cuartos Izq, Semis Izq, Final, Semis Der, Cuartos Der, Octavos Der, Dieciseisavos Der
    // Total: 9 columnas (índices 1-9)
    
    // Agregar títulos de columna
    const titulos = [
        { text: typeof t === 'function' ? t('dieciseisavos') : 'Dieciseisavos', col: 1 },
        { text: typeof t === 'function' ? t('octavos') : 'Octavos', col: 2 },
        { text: typeof t === 'function' ? t('cuartos') : 'Cuartos', col: 3 },
        { text: typeof t === 'function' ? t('semifinales') : 'Semifinales', col: 4 },
        { text: typeof t === 'function' ? t('final') : 'Final', col: 5 },
        { text: typeof t === 'function' ? t('semifinales') : 'Semifinales', col: 6 },
        { text: typeof t === 'function' ? t('cuartos') : 'Cuartos', col: 7 },
        { text: typeof t === 'function' ? t('octavos') : 'Octavos', col: 8 },
        { text: typeof t === 'function' ? t('dieciseisavos') : 'Dieciseisavos', col: 9 }
    ];
    
    titulos.forEach((titulo) => {
        const tituloDiv = document.createElement('div');
        tituloDiv.className = 'bracket-column-title';
        tituloDiv.textContent = titulo.text;
        tituloDiv.style.gridArea = `1 / ${titulo.col} / span 1 / span 1`;
        // Agregar data attribute para identificar la ronda en móvil
        tituloDiv.setAttribute('data-ronda', titulo.text.toLowerCase());
        tituloDiv.setAttribute('data-col', titulo.col);
        bracketDiv.appendChild(tituloDiv);
    });
    
    // Dieciseisavos (16 partidos): 8 a la izquierda (col 1), 8 a la derecha (col 9)
    // Asegurar que siempre haya exactamente 16 partidos
    let dieciseisavos = partidosDieciseisavos.length > 0 ? [...partidosDieciseisavos] : 
        Array(16).fill(null).map(() => ({ local: { equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', posicion: '' }, visitante: { equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', posicion: '' } }));
    
    // Si hay menos de 16 partidos, completar con "Por definir"
    while (dieciseisavos.length < 16) {
        dieciseisavos.push({
            local: { equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', posicion: '' },
            visitante: { equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', posicion: '' }
        });
    }
    
    // Asegurar que no haya más de 16
    dieciseisavos = dieciseisavos.slice(0, 16);
    
    dieciseisavos.forEach((partido, index) => {
        const matchWrapper = document.createElement('div');
        matchWrapper.className = 'bracket-match-wrapper';
        matchWrapper.setAttribute('data-fase', 'dieciseisavos');
        matchWrapper.setAttribute('data-index', index.toString());
        // Para móvil: establecer order basado en el índice (1-16)
        matchWrapper.style.setProperty('--mobile-order', (index + 1).toString());
        
        // Primeros 8 a la izquierda (col 1), últimos 8 a la derecha (col 9)
        // Ambos lados deben estar en las mismas filas para alinearse
        if (index < 8) {
            // Lado izquierdo: filas 2, 4, 6, 8, 10, 12, 14, 16
            const startRow = index * 2 + 2;
            matchWrapper.style.gridArea = `${startRow} / 1 / span 2 / span 1`;
            matchWrapper.setAttribute('data-col', '1');
        } else {
            // Lado derecho: mismas filas que el lado izquierdo (index 0-7 corresponden a index 8-15)
            const leftIndex = index - 8;
            const startRow = leftIndex * 2 + 2;
            matchWrapper.style.gridArea = `${startRow} / 9 / span 2 / span 1`;
            matchWrapper.setAttribute('data-col', '9');
        }
        
        const matchDiv = crearMatchCard('dieciseisavos', index, partido);
        matchWrapper.appendChild(matchDiv);
        bracketDiv.appendChild(matchWrapper);
    });
    
    // Octavos (8 partidos): 4 a la izquierda (col 2), 4 a la derecha (col 8)
    const octavos = partidosOctavos.length > 0 ? partidosOctavos : 
        Array(8).fill(null).map(() => ({ local: { equipo: 'Por definir', grupo: '', posicion: '' }, visitante: { equipo: 'Por definir', grupo: '', posicion: '' } }));
    
    octavos.forEach((partido, index) => {
        const matchWrapper = document.createElement('div');
        matchWrapper.className = 'bracket-match-wrapper';
        matchWrapper.setAttribute('data-fase', 'octavos');
        matchWrapper.setAttribute('data-index', index);
        // Centrar entre los dos partidos de dieciseisavos correspondientes
        // Octavos 0: entre dieciseisavos 0 y 1 → fila 3
        // Octavos 1: entre dieciseisavos 2 y 3 → fila 7
        // Octavos 2: entre dieciseisavos 4 y 5 → fila 11
        // Octavos 3: entre dieciseisavos 6 y 7 → fila 15
        // Octavos 4: entre dieciseisavos 8 y 9 → fila 3
        // Octavos 5: entre dieciseisavos 10 y 11 → fila 7
        // Octavos 6: entre dieciseisavos 12 y 13 → fila 11
        // Octavos 7: entre dieciseisavos 14 y 15 → fila 15
        const localIndex = index < 4 ? index : index - 4;
        const startRow = localIndex * 4 + 3;
        const col = index < 4 ? 2 : 8;
        matchWrapper.style.gridArea = `${startRow} / ${col} / span 2 / span 1`;
        matchWrapper.setAttribute('data-col', col.toString());
        
        const matchDiv = crearMatchCard('octavos', index, partido);
        matchWrapper.appendChild(matchDiv);
        bracketDiv.appendChild(matchWrapper);
    });
    
    // Cuartos (4 partidos): 2 a la izquierda (col 3), 2 a la derecha (col 7)
    const cuartos = partidosCuartos.length > 0 ? partidosCuartos : 
        Array(4).fill(null).map(() => ({ local: { equipo: 'Por definir', grupo: '', posicion: '' }, visitante: { equipo: 'Por definir', grupo: '', posicion: '' } }));
    
    cuartos.forEach((partido, index) => {
        const matchWrapper = document.createElement('div');
        matchWrapper.className = 'bracket-match-wrapper';
        matchWrapper.setAttribute('data-fase', 'cuartos');
        matchWrapper.setAttribute('data-index', index);
        // Centrar entre los dos partidos de octavos correspondientes
        // Cuartos 0: entre octavos 0 y 1 → fila 5
        // Cuartos 1: entre octavos 2 y 3 → fila 13
        // Cuartos 2: entre octavos 4 y 5 → fila 5
        // Cuartos 3: entre octavos 6 y 7 → fila 13
        const localIndex = index < 2 ? index : index - 2;
        const startRow = localIndex * 8 + 5;
        const col = index < 2 ? 3 : 7;
        matchWrapper.style.gridArea = `${startRow} / ${col} / span 2 / span 1`;
        matchWrapper.setAttribute('data-col', col.toString());
        
        const matchDiv = crearMatchCard('cuartos', index, partido);
        matchWrapper.appendChild(matchDiv);
        bracketDiv.appendChild(matchWrapper);
    });
    
    // Semis (2 partidos): 1 a la izquierda (col 4), 1 a la derecha (col 6)
    const semis = partidosSemis.length > 0 ? partidosSemis : 
        Array(2).fill(null).map(() => ({ local: { equipo: 'Por definir', grupo: '', posicion: '' }, visitante: { equipo: 'Por definir', grupo: '', posicion: '' } }));
    
    semis.forEach((partido, index) => {
        const matchWrapper = document.createElement('div');
        matchWrapper.className = 'bracket-match-wrapper';
        matchWrapper.setAttribute('data-fase', 'semis');
        matchWrapper.setAttribute('data-index', index);
        // Centrar entre los dos partidos de cuartos correspondientes
        // Semis 0: entre cuartos 0 y 1 → fila 9
        // Semis 1: entre cuartos 2 y 3 → fila 9
        const startRow = 9;
        const col = index === 0 ? 4 : 6;
        matchWrapper.style.gridArea = `${startRow} / ${col} / span 2 / span 1`;
        matchWrapper.setAttribute('data-col', col.toString());
        
        const matchDiv = crearMatchCard('semis', index, partido);
        matchWrapper.appendChild(matchDiv);
        bracketDiv.appendChild(matchWrapper);
    });
    
    // Final (1 partido) - Columna 5 (centro)
    const final = partidoFinal ? [partidoFinal] : 
        [{ local: { equipo: 'Por definir', grupo: '', posicion: '' }, visitante: { equipo: 'Por definir', grupo: '', posicion: '' } }];
    
    const matchWrapper = document.createElement('div');
    matchWrapper.className = 'bracket-match-wrapper';
    matchWrapper.setAttribute('data-fase', 'final');
    matchWrapper.setAttribute('data-index', '0');
    matchWrapper.setAttribute('data-col', '5');
    // Centrar entre los dos partidos de semis
    matchWrapper.style.gridArea = `17 / 5 / span 2 / span 1`;
    
    const matchDiv = crearMatchCard('final', 0, final[0]);
    matchWrapper.appendChild(matchDiv);
    bracketDiv.appendChild(matchWrapper);
    
    container.appendChild(bracketDiv);
}

// Crear una tarjeta de partido
function crearMatchCard(fase, index, partido) {
    const t = typeof window.t === 'function' ? window.t : (key) => key;
    const matchDiv = document.createElement('div');
    matchDiv.className = 'bracket-match';
    
    // Si no hay resultado, usar "0" como valor por defecto
    const resultado = resultados[fase]?.[index] || { golesLocal: '0', golesVisitante: '0' };
    // Si los valores están vacíos, usar "0" como valor por defecto
    const golesLocalStr = (resultado.golesLocal === '' || resultado.golesLocal === null || resultado.golesLocal === undefined) 
        ? '0' 
        : String(resultado.golesLocal);
    const golesVisitanteStr = (resultado.golesVisitante === '' || resultado.golesVisitante === null || resultado.golesVisitante === undefined) 
        ? '0' 
        : String(resultado.golesVisitante);
    // Tratar valores para la visualización
    const golesLocal = parseInt(golesLocalStr) || 0;
    const golesVisitante = parseInt(golesVisitanteStr) || 0;
    
    const ganadorLocal = golesLocal > golesVisitante;
    const ganadorVisitante = golesVisitante > golesLocal;
    const porDefinir = t('porDefinir');
    const equipoLocalNombre = partido.local?.equipo || porDefinir;
    const equipoVisitanteNombre = partido.visitante?.equipo || porDefinir;
    const esPorDefinirLocal = equipoLocalNombre === porDefinir;
    const esPorDefinirVisitante = equipoVisitanteNombre === porDefinir;
    
    // Obtener información de posición y grupo
    const localPosicion = partido.local?.posicion || '';
    const localGrupo = partido.local?.grupo || '';
    const visitantePosicion = partido.visitante?.posicion || '';
    const visitanteGrupo = partido.visitante?.grupo || '';
    
    // Traducir nombres de grupos
    const grupoMap = {
        'Grupo A': t('grupoA'),
        'Grupo B': t('grupoB'),
        'Grupo C': t('grupoC'),
        'Grupo D': t('grupoD'),
        'Grupo E': t('grupoE'),
        'Grupo F': t('grupoF'),
        'Grupo G': t('grupoG'),
        'Grupo H': t('grupoH'),
        'Grupo I': t('grupoI'),
        'Grupo J': t('grupoJ'),
        'Grupo K': t('grupoK'),
        'Grupo L': t('grupoL')
    };
    const localGrupoTraducido = localGrupo ? (grupoMap[localGrupo] || localGrupo) : '';
    const visitanteGrupoTraducido = visitanteGrupo ? (grupoMap[visitanteGrupo] || visitanteGrupo) : '';
    
    // Formatear texto de posición y grupo
    const localInfo = (localPosicion && localGrupoTraducido) ? `${localPosicion} ${localGrupoTraducido}` : '';
    const visitanteInfo = (visitantePosicion && visitanteGrupoTraducido) ? `${visitantePosicion} ${visitanteGrupoTraducido}` : '';
    
    // Verificar si el partido ya se jugó
    const yaJugado = typeof partidoEliminatoriaYaJugado === 'function' ? partidoEliminatoriaYaJugado(fase, index) : false;
    
    // Verificar si tiene predicción existente
    const tienePrediccion = resultado && (resultado.golesLocal !== '' || resultado.golesVisitante !== '');
    
    // Verificar si se puede modificar la predicción según las reglas de fecha
    const puedeModificar = typeof sePuedeModificarPrediccionEliminatoria === 'function' 
        ? sePuedeModificarPrediccionEliminatoria(fase, index, tienePrediccion)
        : true;
    
    // Deshabilitar si ya se jugó O si no se puede modificar según las reglas de fecha
    const disabledAttr = (yaJugado || !puedeModificar) ? 'disabled readonly' : '';
    const readonlyClass = (yaJugado || !puedeModificar) ? 'partido-ya-jugado' : '';
    
    // Obtener banderas para eliminatorias
    // Si el equipo es un playoff, obtener la selección del grupo correspondiente
    let banderaLocal = '';
    let banderaVisitante = '';
    
    // Para el equipo local
    if (!esPorDefinirLocal && partido.local?.grupo && partido.local?.datos && partido.local.datos.indice !== undefined) {
        const grupoIndex = GRUPOS_MUNDIAL_2026.findIndex(g => g.nombre === partido.local.grupo);
        if (grupoIndex !== -1) {
            const grupo = GRUPOS_MUNDIAL_2026[grupoIndex];
            const equipoIndex = partido.local.datos.indice;
            if (equipoIndex !== undefined && grupo.equipos && grupo.equipos[equipoIndex] !== undefined) {
                const equipoOriginal = grupo.equipos[equipoIndex];
                if (typeof PLAYOFFS_OPCIONES !== 'undefined' && PLAYOFFS_OPCIONES[equipoOriginal]) {
                    // Es un playoff
                    const seleccion = resultados[grupoIndex]?.playoffSelecciones?.[equipoIndex] || '';
                    if (seleccion) {
                        banderaLocal = obtenerBanderaPais(seleccion);
                    } else {
                        // Es un playoff sin seleccionar, mostrar rectángulo blanco
                        banderaLocal = null; // Marcador especial
                    }
                } else {
                    // No es un playoff, obtener bandera del equipo original (siempre en español)
                    banderaLocal = obtenerBanderaPais(equipoOriginal);
                }
            } else {
                // Fallback: intentar obtener bandera del nombre (puede estar traducido)
                banderaLocal = obtenerBanderaPais(equipoLocalNombre);
            }
        } else {
            // Fallback: intentar obtener bandera del nombre
            banderaLocal = obtenerBanderaPais(equipoLocalNombre);
        }
    } else if (!esPorDefinirLocal) {
        // Fallback: intentar obtener bandera del nombre
        banderaLocal = obtenerBanderaPais(equipoLocalNombre);
    }
    
    // Para el equipo visitante
    if (!esPorDefinirVisitante && partido.visitante?.grupo && partido.visitante?.datos && partido.visitante.datos.indice !== undefined) {
        const grupoIndex = GRUPOS_MUNDIAL_2026.findIndex(g => g.nombre === partido.visitante.grupo);
        if (grupoIndex !== -1) {
            const grupo = GRUPOS_MUNDIAL_2026[grupoIndex];
            const equipoIndex = partido.visitante.datos.indice;
            if (equipoIndex !== undefined && grupo.equipos && grupo.equipos[equipoIndex] !== undefined) {
                const equipoOriginal = grupo.equipos[equipoIndex];
                if (typeof PLAYOFFS_OPCIONES !== 'undefined' && PLAYOFFS_OPCIONES[equipoOriginal]) {
                    // Es un playoff
                    const seleccion = resultados[grupoIndex]?.playoffSelecciones?.[equipoIndex] || '';
                    if (seleccion) {
                        banderaVisitante = obtenerBanderaPais(seleccion);
                    } else {
                        // Es un playoff sin seleccionar, mostrar rectángulo blanco
                        banderaVisitante = null; // Marcador especial
                    }
                } else {
                    // No es un playoff, obtener bandera del equipo original (siempre en español)
                    banderaVisitante = obtenerBanderaPais(equipoOriginal);
                }
            } else {
                // Fallback: intentar obtener bandera del nombre
                banderaVisitante = obtenerBanderaPais(equipoVisitanteNombre);
            }
        } else {
            // Fallback: intentar obtener bandera del nombre
            banderaVisitante = obtenerBanderaPais(equipoVisitanteNombre);
        }
    } else if (!esPorDefinirVisitante) {
        // Fallback: intentar obtener bandera del nombre
        banderaVisitante = obtenerBanderaPais(equipoVisitanteNombre);
    }
    
    const banderaLocalHtml = banderaLocal === null 
        ? `<div style="width: 20px; height: 15px; border: 1px solid rgba(255,255,255,0.3); border-radius: 2px; display: inline-block; background: white; flex-shrink: 0;"></div>`
        : (banderaLocal ? `<img src="${banderaLocal}" alt="${equipoLocalNombre}" style="width: 20px; height: 15px; vertical-align: middle; border: 1px solid rgba(255,255,255,0.3); border-radius: 2px; flex-shrink: 0;">` : '');
    const banderaVisitanteHtml = banderaVisitante === null 
        ? `<div style="width: 20px; height: 15px; border: 1px solid rgba(255,255,255,0.3); border-radius: 2px; display: inline-block; background: white; flex-shrink: 0;"></div>`
        : (banderaVisitante ? `<img src="${banderaVisitante}" alt="${equipoVisitanteNombre}" style="width: 20px; height: 15px; vertical-align: middle; border: 1px solid rgba(255,255,255,0.3); border-radius: 2px; flex-shrink: 0;">` : '');
    
    matchDiv.innerHTML = `
        <div class="bracket-team ${ganadorLocal ? 'ganador' : ''} ${esPorDefinirLocal ? 'por-definir' : ''} ${readonlyClass}" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <div class="bandera-local" style="flex-shrink: 0;">${banderaLocalHtml}</div>
            <div class="bracket-team-info" style="flex: 1; text-align: left;">
                <span class="bracket-team-nombre">${equipoLocalNombre}</span>
                ${localInfo ? `<span class="bracket-team-posicion">${localInfo}</span>` : ''}
            </div>
            <div class="bracket-resultado" style="flex-shrink: 0;">
                <input type="number" min="0" max="20" 
                       value="${golesLocalStr}" 
                       data-eliminatoria="${fase}" 
                       data-partido="${index}" 
                       data-equipo="0" 
                       data-tipo="local"
                       placeholder="0"
                       ${disabledAttr}>
            </div>
        </div>
        <div class="bracket-team ${ganadorVisitante ? 'ganador' : ''} ${esPorDefinirVisitante ? 'por-definir' : ''} ${readonlyClass}" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <div class="bandera-visitante" style="flex-shrink: 0;">${banderaVisitanteHtml}</div>
            <div class="bracket-team-info" style="flex: 1; text-align: left;">
                <span class="bracket-team-nombre">${equipoVisitanteNombre}</span>
                ${visitanteInfo ? `<span class="bracket-team-posicion">${visitanteInfo}</span>` : ''}
            </div>
            <div class="bracket-resultado" style="flex-shrink: 0;">
                <input type="number" min="0" max="20" 
                       value="${golesVisitanteStr}" 
                       data-eliminatoria="${fase}" 
                       data-partido="${index}" 
                       data-equipo="1" 
                       data-tipo="visitante"
                       placeholder="0"
                       ${disabledAttr}>
            </div>
        </div>
    `;
    
    return matchDiv;
}

// Obtener ganadores de una fase
function obtenerGanadores(fase, partidosFase) {
    const ganadores = [];
    const resultadosFase = resultados[fase] || {};
    
    partidosFase.forEach((partido, index) => {
        if (!partido) {
            ganadores.push({ equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' });
            return;
        }
        
        const resultado = resultadosFase[index];
        if (resultado) {
            // Obtener valores como strings y tratar vacío como 0
            const golesLocalStr = (resultado.golesLocal !== undefined && resultado.golesLocal !== null && resultado.golesLocal !== '') 
                ? String(resultado.golesLocal).trim() : '';
            const golesVisitanteStr = (resultado.golesVisitante !== undefined && resultado.golesVisitante !== null && resultado.golesVisitante !== '') 
                ? String(resultado.golesVisitante).trim() : '';
            
            // Convertir a números, tratando vacío como 0
            const golesLocal = golesLocalStr !== '' ? (parseInt(golesLocalStr) || 0) : 0;
            const golesVisitante = golesVisitanteStr !== '' ? (parseInt(golesVisitanteStr) || 0) : 0;
            
            // Si al menos uno de los valores fue ingresado explícitamente, determinar ganador
            // Esto permite que si uno tiene 1 y el otro está vacío (0 por defecto), se determine el ganador
            if (golesLocalStr !== '' || golesVisitanteStr !== '') {
                if (!isNaN(golesLocal) && !isNaN(golesVisitante)) {
                    if (golesLocal > golesVisitante && partido.local) {
                        // Copiar todo el objeto del ganador para preservar toda la información
                        ganadores.push({ 
                            equipo: partido.local.equipo || 'Por definir',
                            grupo: partido.local.grupo || '',
                            datos: partido.local.datos || {},
                            posicion: partido.local.posicion || ''
                        });
                    } else if (golesVisitante > golesLocal && partido.visitante) {
                        // Copiar todo el objeto del ganador para preservar toda la información
                        ganadores.push({ 
                            equipo: partido.visitante.equipo || 'Por definir',
                            grupo: partido.visitante.grupo || '',
                            datos: partido.visitante.datos || {},
                            posicion: partido.visitante.posicion || ''
                        });
                    } else {
                        // Empate - mantener "Por definir"
                        ganadores.push({ equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' });
                    }
                } else {
                    // Valores inválidos
                    ganadores.push({ equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' });
                }
            } else {
                // Ambos campos vacíos - no hay resultado aún
                ganadores.push({ equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' });
            }
        } else {
            // Sin resultado aún
            ganadores.push({ equipo: (typeof t === 'function' ? t('porDefinir') : 'Por definir'), grupo: '', datos: {}, posicion: '' });
        }
    });
    
    return ganadores;
}

// Función para llenar todos los resultados con datos dummy
function llenarResultadosDummy() {
    // Función auxiliar para generar un resultado aleatorio realista
    function generarResultado() {
        // Resultados más comunes en fútbol: 0-0, 1-0, 1-1, 2-0, 2-1, 3-0, 3-1, etc.
        const resultadosComunes = [
            { local: 0, visitante: 0 },
            { local: 1, visitante: 0 },
            { local: 0, visitante: 1 },
            { local: 1, visitante: 1 },
            { local: 2, visitante: 0 },
            { local: 0, visitante: 2 },
            { local: 2, visitante: 1 },
            { local: 1, visitante: 2 },
            { local: 2, visitante: 2 },
            { local: 3, visitante: 0 },
            { local: 0, visitante: 3 },
            { local: 3, visitante: 1 },
            { local: 1, visitante: 3 },
            { local: 3, visitante: 2 },
            { local: 2, visitante: 3 },
            { local: 4, visitante: 0 },
            { local: 0, visitante: 4 },
            { local: 4, visitante: 1 },
            { local: 1, visitante: 4 },
            { local: 2, visitante: 4 },
            { local: 4, visitante: 2 }
        ];
        
        const resultado = resultadosComunes[Math.floor(Math.random() * resultadosComunes.length)];
        return {
            golesLocal: resultado.local.toString(),
            golesVisitante: resultado.visitante.toString()
        };
    }
    
    // Llenar resultados de grupos
    GRUPOS_MUNDIAL_2026.forEach((grupo, grupoIndex) => {
        if (!resultados[grupoIndex]) {
            resultados[grupoIndex] = {
                partidos: [],
                posiciones: [],
                playoffSelecciones: {}
            };
        }
        
        grupo.partidos.forEach((partido, partidoIndex) => {
            if (!resultados[grupoIndex].partidos[partidoIndex]) {
                resultados[grupoIndex].partidos[partidoIndex] = { golesLocal: '', golesVisitante: '' };
            }
            
            const resultado = generarResultado();
            resultados[grupoIndex].partidos[partidoIndex].golesLocal = resultado.golesLocal;
            resultados[grupoIndex].partidos[partidoIndex].golesVisitante = resultado.golesVisitante;
        });
    });
    
    // Llenar resultados de eliminatorias
    const fases = ['dieciseisavos', 'octavos', 'cuartos', 'semis', 'final'];
    
    // Dieciseisavos: 16 partidos
    for (let i = 0; i < 16; i++) {
        if (!resultados['dieciseisavos']) {
            resultados['dieciseisavos'] = {};
        }
        if (!resultados['dieciseisavos'][i]) {
            resultados['dieciseisavos'][i] = { golesLocal: '', golesVisitante: '' };
        }
        const resultado = generarResultado();
        resultados['dieciseisavos'][i].golesLocal = resultado.golesLocal;
        resultados['dieciseisavos'][i].golesVisitante = resultado.golesVisitante;
    }
    
    // Octavos: 8 partidos
    for (let i = 0; i < 8; i++) {
        if (!resultados['octavos']) {
            resultados['octavos'] = {};
        }
        if (!resultados['octavos'][i]) {
            resultados['octavos'][i] = { golesLocal: '', golesVisitante: '' };
        }
        const resultado = generarResultado();
        resultados['octavos'][i].golesLocal = resultado.golesLocal;
        resultados['octavos'][i].golesVisitante = resultado.golesVisitante;
    }
    
    // Cuartos: 4 partidos
    for (let i = 0; i < 4; i++) {
        if (!resultados['cuartos']) {
            resultados['cuartos'] = {};
        }
        if (!resultados['cuartos'][i]) {
            resultados['cuartos'][i] = { golesLocal: '', golesVisitante: '' };
        }
        const resultado = generarResultado();
        resultados['cuartos'][i].golesLocal = resultado.golesLocal;
        resultados['cuartos'][i].golesVisitante = resultado.golesVisitante;
    }
    
    // Semis: 2 partidos
    for (let i = 0; i < 2; i++) {
        if (!resultados['semis']) {
            resultados['semis'] = {};
        }
        if (!resultados['semis'][i]) {
            resultados['semis'][i] = { golesLocal: '', golesVisitante: '' };
        }
        const resultado = generarResultado();
        resultados['semis'][i].golesLocal = resultado.golesLocal;
        resultados['semis'][i].golesVisitante = resultado.golesVisitante;
    }
    
    // Final: 1 partido
    if (!resultados['final']) {
        resultados['final'] = {};
    }
    if (!resultados['final'][0]) {
        resultados['final'][0] = { golesLocal: '', golesVisitante: '' };
    }
    const resultadoFinal = generarResultado();
    resultados['final'][0].golesLocal = resultadoFinal.golesLocal;
    resultados['final'][0].golesVisitante = resultadoFinal.golesVisitante;
    
    // Guardar resultados
    guardarResultados();
    
    // Actualizar la interfaz
    renderizarGrupos();
    actualizarEliminatorias();
    
    alert('✅ Todos los resultados han sido llenados con datos dummy');
}

// Hacer la función disponible globalmente para ejecutarla desde la consola
window.llenarResultadosDummy = llenarResultadosDummy;

// Función para cargar resultados reales desde Supabase
async function cargarResultadosDesdeSupabase() {
    if (!usarSupabase()) {
        return;
    }

    try {
        // Obtener todos los torneos de Supabase
        const { data: torneosSupabase, error: errorTorneos } = await supabaseClient
            .from('torneos')
            .select('codigo, resultados_reales');

        if (errorTorneos) {
            throw errorTorneos;
        }

        if (!torneosSupabase || torneosSupabase.length === 0) {
            return;
        }

        // Combinar resultados reales de todos los torneos
        // Si hay múltiples torneos, usar el primero o combinar todos
        let resultadosCombinados = {};
        
        torneosSupabase.forEach(torneo => {
            const resultadosReales = torneo.resultados_reales || {};
            
            // Combinar resultados de este torneo con los existentes
            Object.keys(resultadosReales).forEach(grupoIndex => {
                const grupoIdx = parseInt(grupoIndex);
                if (!resultadosCombinados[grupoIdx]) {
                    resultadosCombinados[grupoIdx] = {
                        partidos: [],
                        posiciones: [],
                        playoffSelecciones: {}
                    };
                }
                
                const resultadosGrupo = resultadosReales[grupoIndex];
                Object.keys(resultadosGrupo).forEach(partidoIndex => {
                    const partidoIdx = parseInt(partidoIndex);
                    const resultado = resultadosGrupo[partidoIndex];
                    
                    if (!resultadosCombinados[grupoIdx].partidos[partidoIdx]) {
                        resultadosCombinados[grupoIdx].partidos[partidoIdx] = {
                            golesLocal: '',
                            golesVisitante: ''
                        };
                    }
                    
                    // Solo actualizar si hay resultado real
                    if (resultado && (resultado.golesLocal !== undefined || resultado.golesVisitante !== undefined)) {
                        resultadosCombinados[grupoIdx].partidos[partidoIdx].golesLocal = 
                            resultado.golesLocal !== undefined ? resultado.golesLocal.toString() : '';
                        resultadosCombinados[grupoIdx].partidos[partidoIdx].golesVisitante = 
                            resultado.golesVisitante !== undefined ? resultado.golesVisitante.toString() : '';
                        
                        // Marcar el partido como jugado
                        if (typeof marcarPartidoJugado === 'function') {
                            marcarPartidoJugado(grupoIdx, partidoIdx);
                        }
                    }
                });
            });
        });

        // Actualizar la variable resultados con los datos de Supabase
        Object.keys(resultadosCombinados).forEach(grupoIndex => {
            const grupoIdx = parseInt(grupoIndex);
            if (!resultados[grupoIdx]) {
                resultados[grupoIdx] = {
                    partidos: [],
                    posiciones: [],
                    playoffSelecciones: {}
                };
            }
            
            // Combinar partidos
            resultadosCombinados[grupoIdx].partidos.forEach((partido, partidoIndex) => {
                if (partido && (partido.golesLocal !== '' || partido.golesVisitante !== '')) {
                    if (!resultados[grupoIdx].partidos[partidoIndex]) {
                        resultados[grupoIdx].partidos[partidoIndex] = { golesLocal: '', golesVisitante: '' };
                    }
                    resultados[grupoIdx].partidos[partidoIndex].golesLocal = partido.golesLocal;
                    resultados[grupoIdx].partidos[partidoIndex].golesVisitante = partido.golesVisitante;
                }
            });
        });

        // Guardar resultados en localStorage
        guardarResultados();
        
        // Actualizar la interfaz
        renderizarGrupos();
        actualizarEliminatorias();
        
        
    } catch (error) {
    }
}

// Hacer la función disponible globalmente
window.cargarResultadosDesdeSupabase = cargarResultadosDesdeSupabase;

// Cargar resultados desde Supabase al inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        if (usarSupabase()) {
            await cargarResultadosDesdeSupabase();
        }
    }, 1500); // Esperar 1.5 segundos para que todo esté inicializado
});

