// Sistema de Torneo de Predicciones - Versión 2.0
// Sistema con múltiples torneos y códigos de acceso

let torneos = {}; // { codigo: { nombre: string, participantes: [], creadoPor: string, fechaCreacion: timestamp, resultadosReales: {} } }
let miNombre = localStorage.getItem('mundial2026_mi_nombre') || '';

// Obtener ID único del usuario (para prevenir múltiples predicciones por torneo)
function obtenerIdUsuarioUnico() {
    // Si está logueado, usar el ID del usuario
    if (typeof obtenerUsuarioActual === 'function') {
        const usuario = obtenerUsuarioActual();
        if (usuario && usuario.id) {
            return `user_${usuario.id}`;
        }
        if (usuario && usuario.nombreUsuario) {
            // Si no hay ID pero hay nombre de usuario, usar el nombre como identificador
            return `user_${usuario.nombreUsuario}`;
        }
    }
    
    // Si no está logueado, generar/obtener un ID único del navegador
    let browserId = localStorage.getItem('mundial2026_browser_id');
    if (!browserId) {
        // Generar un ID único para este navegador
        browserId = 'browser_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('mundial2026_browser_id', browserId);
    }
    return browserId;
}

// Verificar si el usuario ya tiene una predicción en un torneo
async function usuarioYaTienePrediccion(codigo) {
    const usuarioId = obtenerIdUsuarioUnico();
    
    // Verificar en Supabase primero si está disponible
    if (usarSupabase() && typeof obtenerParticipantesSupabase === 'function') {
        try {
            const participantes = await obtenerParticipantesSupabase(codigo);
            if (participantes) {
                const yaTiene = participantes.some(p => {
                    if (p.usuarioId && p.usuarioId === usuarioId) {
                        return true;
                    }
                    // Si está logueado, también verificar por nombre de usuario
                    if (typeof obtenerUsuarioActual === 'function') {
                        const usuario = obtenerUsuarioActual();
                        if (usuario && usuario.nombreUsuario && p.nombre === usuario.nombreUsuario) {
                            return true;
                        }
                    }
                    return false;
                });
                if (yaTiene) return true;
            }
        } catch (error) {
            console.error('Error al verificar en Supabase:', error);
        }
    }
    
    // Verificar en localStorage
    if (!torneos[codigo] || !torneos[codigo].participantes) {
        return false;
    }
    
    const torneo = torneos[codigo];
    
    // Verificar si algún participante tiene el mismo usuarioId
    return torneo.participantes.some(p => {
        if (!p) return false;
        // Si el participante tiene usuarioId, comparar
        if (p.usuarioId) {
            return p.usuarioId === usuarioId;
        }
        // Si no tiene usuarioId pero está logueado, verificar por nombre de usuario
        if (typeof obtenerUsuarioActual === 'function') {
            const usuario = obtenerUsuarioActual();
            if (usuario && usuario.nombreUsuario) {
                // Si el participante tiene el mismo nombre de usuario, es el mismo usuario
                return p.nombre === usuario.nombreUsuario;
            }
        }
        return false;
    });
}

// Inicializar datos del torneo
async function inicializarTorneo() {
    // Inicializar Supabase primero
    if (typeof inicializarSupabase === 'function') {
        inicializarSupabase();
    }
    
    // Inicializar como objeto vacío primero
    torneos = {};
    
    // Intentar cargar desde Supabase primero
    if (usarSupabase() && typeof cargarDatosDesdeSupabase === 'function') {
        try {
            const datosSupabase = await cargarDatosDesdeSupabase();
            if (datosSupabase) {
                torneos = datosSupabase;
                console.log('Datos cargados desde Supabase');
            } else {
                // Si no hay datos en Supabase, sincronizar desde localStorage
                await sincronizarLocalStorageASupabase();
                // Intentar cargar de nuevo
                const datosSupabase2 = await cargarDatosDesdeSupabase();
                if (datosSupabase2) {
                    torneos = datosSupabase2;
                }
            }
        } catch (error) {
            console.error('Error al cargar desde Supabase, usando localStorage:', error);
        }
    }
    
    // Fallback a localStorage si Supabase no está disponible o falló
    if (Object.keys(torneos).length === 0) {
        const guardado = localStorage.getItem('mundial2026_torneos');
        if (guardado) {
            try {
                const datosCargados = JSON.parse(guardado);
                // Asegurar que sea un objeto válido
                if (datosCargados && typeof datosCargados === 'object' && !Array.isArray(datosCargados)) {
                    torneos = datosCargados;
                }
            } catch (e) {
                console.error('Error al cargar datos del torneo:', e);
                torneos = {};
            }
        }
    }
    
    // Calcular puntos de todos los torneos
    if (torneos && typeof torneos === 'object') {
        for (const codigo of Object.keys(torneos)) {
            await calcularPuntosTorneo(codigo);
            // Asegurar que todos los participantes tengan estadísticas
            const torneo = torneos[codigo];
            if (torneo && torneo.participantes) {
                torneo.participantes.forEach(participante => {
                    if (!participante.estadisticas) {
                        participante.estadisticas = {
                            resultadosExactos: 0,
                            resultadosAcertados: 0,
                            partidosJugados: 0,
                            puntosTotales: participante.puntos || 0
                        };
                    }
                });
            }
        }
        await guardarTorneos();
    }
}

// Guardar datos del torneo
async function guardarTorneos() {
    // Asegurar que torneos sea un objeto válido
    if (!torneos || typeof torneos !== 'object') {
        torneos = {};
    }
    
    // Guardar en localStorage siempre (como backup)
    try {
        localStorage.setItem('mundial2026_torneos', JSON.stringify(torneos));
        console.log('Torneos guardados en localStorage:', Object.keys(torneos).length, 'torneos');
    } catch (e) {
        console.error('Error al guardar torneos en localStorage:', e);
    }
    
    // Si Supabase está disponible, también guardar ahí
    // Nota: Los datos se guardan automáticamente cuando se crean/actualizan torneos y participantes
    // Esta función mantiene localStorage como backup
}

// Generar código de 6 dígitos
function generarCodigoTorneo() {
    let codigo;
    do {
        codigo = Math.floor(100000 + Math.random() * 900000).toString();
    } while (torneos[codigo]); // Asegurar que sea único
    return codigo;
}

// Crear nuevo torneo
async function crearTorneo(nombre, nombreCreador) {
    // Asegurar que torneos existe y es un objeto
    if (!torneos || typeof torneos !== 'object') {
        torneos = {};
    }
    
    const codigo = generarCodigoTorneo();
    
    // Crear en Supabase si está disponible
    if (usarSupabase() && typeof crearTorneoSupabase === 'function') {
        const exito = await crearTorneoSupabase(codigo, nombre, nombreCreador);
        if (!exito) {
            console.warn('No se pudo crear torneo en Supabase, usando localStorage');
        }
    }
    
    // Crear en memoria local
    torneos[codigo] = {
        nombre: nombre || `Torneo ${codigo}`,
        participantes: [],
        creadoPor: nombreCreador,
        fechaCreacion: Date.now(),
        resultadosReales: {}
    };
    
    await guardarTorneos();
    return codigo;
}

// Unirse a un torneo
async function unirseATorneo(codigo, nombre) {
    // Si Supabase está disponible, verificar el torneo ahí primero
    if (usarSupabase() && typeof obtenerTorneoPorCodigoSupabase === 'function') {
        const torneoSupabase = await obtenerTorneoPorCodigoSupabase(codigo);
        if (!torneoSupabase) {
            return { exito: false, mensaje: 'Código de torneo inválido' };
        }
        
        // Verificar participantes en Supabase
        const participantesSupabase = await obtenerParticipantesSupabase(codigo);
        if (participantesSupabase && participantesSupabase.some(p => p.nombre === nombre)) {
            return { exito: false, mensaje: 'Ya estás en este torneo' };
        }
        
        // Si el torneo existe en Supabase pero no en memoria local, cargarlo
        if (!torneos[codigo]) {
            torneos[codigo] = {
                nombre: torneoSupabase.nombre,
                participantes: participantesSupabase || [],
                creadoPor: torneoSupabase.creadoPor,
                fechaCreacion: torneoSupabase.fechaCreacion,
                resultadosReales: torneoSupabase.resultadosReales
            };
        }
    } else {
        // Fallback a localStorage
        if (!torneos[codigo]) {
            return { exito: false, mensaje: 'Código de torneo inválido' };
        }
    }
    
    // Verificar que no esté ya en el torneo (en memoria local)
    if (torneos[codigo].participantes.some(p => p.nombre === nombre)) {
        return { exito: false, mensaje: 'Ya estás en este torneo' };
    }
    
    const nuevoParticipante = {
        nombre: nombre,
        predicciones: {},
        puntos: 0
    };
    
    torneos[codigo].participantes.push(nuevoParticipante);
    await guardarTorneos();
    return { exito: true };
}

// Enviar predicciones a un torneo
async function enviarPredicciones(codigo, nombre, predicciones) {
    if (!torneos[codigo]) {
        return { exito: false, mensaje: 'Torneo no encontrado' };
    }
    
    // Verificar si el usuario ya tiene una predicción en este torneo
    const yaTiene = await usuarioYaTienePrediccion(codigo);
    if (yaTiene) {
        return { exito: false, mensaje: 'Ya has enviado una predicción para este torneo. Solo puedes enviar una predicción por torneo, incluso si usas un nick diferente.' };
    }
    
    const usuarioId = obtenerIdUsuarioUnico();
    
    // Guardar en Supabase si está disponible
    if (usarSupabase() && typeof guardarParticipanteSupabase === 'function') {
        const exito = await guardarParticipanteSupabase(codigo, nombre, predicciones, usuarioId);
        if (!exito) {
            console.warn('No se pudo guardar participante en Supabase, usando localStorage');
        }
    }
    
    let participante = torneos[codigo].participantes.find(p => p.nombre === nombre);
    
    if (!participante) {
        // Si no existe, agregarlo
        participante = {
            nombre: nombre,
            predicciones: {},
            puntos: 0,
            usuarioId: usuarioId // Guardar el ID único del usuario
        };
        torneos[codigo].participantes.push(participante);
    } else {
        // Si ya existe, actualizar el usuarioId si no lo tiene
        if (!participante.usuarioId) {
            participante.usuarioId = usuarioId;
        }
    }
    
    // Guardar predicciones
    participante.predicciones = predicciones;
    await guardarTorneos();
    await calcularPuntosTorneo(codigo);
    
    // Actualizar estadísticas en Supabase
    if (usarSupabase() && typeof actualizarEstadisticasParticipanteSupabase === 'function') {
        const participanteActualizado = torneos[codigo].participantes.find(p => p.nombre === nombre);
        if (participanteActualizado && participanteActualizado.estadisticas) {
            await actualizarEstadisticasParticipanteSupabase(codigo, nombre, participanteActualizado.estadisticas);
        }
    }
    
    return { exito: true };
}

// Guardar resultado real (para el creador del torneo)
async function guardarResultadoReal(codigo, grupoIndex, partidoIndex, golesLocal, golesVisitante) {
    if (!torneos[codigo]) return;
    
    const torneo = torneos[codigo];
    if (torneo.creadoPor !== miNombre) {
        alert('Solo el creador del torneo puede ingresar resultados reales');
        return;
    }
    
    if (!torneo.resultadosReales[grupoIndex]) {
        torneo.resultadosReales[grupoIndex] = {};
    }
    
    torneo.resultadosReales[grupoIndex][partidoIndex] = {
        golesLocal: parseInt(golesLocal) || 0,
        golesVisitante: parseInt(golesVisitante) || 0
    };
    
    // Guardar en Supabase si está disponible
    if (usarSupabase() && typeof actualizarResultadosRealesSupabase === 'function') {
        const exito = await actualizarResultadosRealesSupabase(codigo, grupoIndex, partidoIndex, golesLocal, golesVisitante);
        if (!exito) {
            console.warn('No se pudo actualizar resultados en Supabase, usando localStorage');
        }
    }
    
    await guardarTorneos();
    await calcularPuntosTorneo(codigo);
    
    // Actualizar estadísticas de todos los participantes en Supabase
    if (usarSupabase() && typeof actualizarEstadisticasParticipanteSupabase === 'function') {
        for (const participante of torneo.participantes) {
            if (participante.estadisticas) {
                await actualizarEstadisticasParticipanteSupabase(codigo, participante.nombre, participante.estadisticas);
            }
        }
    }
    
    if (typeof renderizarTorneo === 'function') {
        renderizarTorneo();
    }
}

// Calcular puntos de un partido
function calcularPuntosPartido(prediccion, resultadoReal) {
    if (!prediccion || !resultadoReal) return 0;
    
    const predLocal = parseInt(prediccion.golesLocal) || 0;
    const predVisitante = parseInt(prediccion.golesVisitante) || 0;
    const realLocal = parseInt(resultadoReal.golesLocal) || 0;
    const realVisitante = parseInt(resultadoReal.golesVisitante) || 0;
    
    // 5 puntos: resultado exacto
    if (predLocal === realLocal && predVisitante === realVisitante) {
        return 5;
    }
    
    // 3 puntos: resultado correcto (ganador o empate)
    const predGanoLocal = predLocal > predVisitante;
    const predGanoVisitante = predVisitante > predLocal;
    const predEmpate = predLocal === predVisitante;
    
    const realGanoLocal = realLocal > realVisitante;
    const realGanoVisitante = realVisitante > realLocal;
    const realEmpate = realLocal === realVisitante;
    
    if ((predGanoLocal && realGanoLocal) || 
        (predGanoVisitante && realGanoVisitante) || 
        (predEmpate && realEmpate)) {
        return 3;
    }
    
    // 0 puntos: error completo
    return 0;
}

// Calcular puntos de un torneo
async function calcularPuntosTorneo(codigo) {
    const torneo = torneos[codigo];
    if (!torneo) return;
    
    for (const participante of torneo.participantes) {
        let puntosTotales = 0;
        let resultadosExactos = 0; // 5 puntos
        let resultadosAcertados = 0; // 3 puntos
        let partidosJugados = 0;
        
        // Recorrer todos los grupos con resultados reales
        Object.keys(torneo.resultadosReales).forEach(grupoIndex => {
            const grupoIdx = parseInt(grupoIndex);
            const resultadosGrupo = torneo.resultadosReales[grupoIdx];
            const prediccionesGrupo = participante.predicciones[grupoIdx] || {};
            
            // Recorrer todos los partidos con resultados reales
            Object.keys(resultadosGrupo).forEach(partidoIndex => {
                const partidoIdx = parseInt(partidoIndex);
                const resultadoReal = resultadosGrupo[partidoIdx];
                const prediccion = prediccionesGrupo[partidoIdx];
                
                if (prediccion) {
                    partidosJugados++;
                    const puntos = calcularPuntosPartido(prediccion, resultadoReal);
                    puntosTotales += puntos;
                    
                    if (puntos === 5) {
                        resultadosExactos++;
                    } else if (puntos === 3) {
                        resultadosAcertados++;
                    }
                }
            });
        });
        
        participante.puntos = puntosTotales;
        participante.estadisticas = {
            resultadosExactos: resultadosExactos,
            resultadosAcertados: resultadosAcertados,
            partidosJugados: partidosJugados,
            puntosTotales: puntosTotales
        };
        
        // Actualizar en Supabase si está disponible
        if (usarSupabase() && typeof actualizarEstadisticasParticipanteSupabase === 'function') {
            await actualizarEstadisticasParticipanteSupabase(codigo, participante.nombre, participante.estadisticas);
        }
    }
    
    // Ordenar por puntos
    torneo.participantes.sort((a, b) => b.puntos - a.puntos);
    await guardarTorneos();
}

// Obtener todos los torneos del usuario
function obtenerMisTorneos() {
    const misTorneos = [];
    
    // Asegurar que torneos es un objeto válido
    if (!torneos || typeof torneos !== 'object') {
        console.log('Torneos no es un objeto válido');
        return [];
    }
    
    const codigos = Object.keys(torneos);
    console.log('Total de torneos encontrados:', codigos.length);
    console.log('Mi nombre:', miNombre);
    
    codigos.forEach(codigo => {
        const torneo = torneos[codigo];
        if (torneo && torneo.participantes) {
            // Verificar si el usuario está en este torneo
            const estaEnTorneo = torneo.participantes.some(p => p && p.nombre === miNombre);
            console.log(`Torneo ${codigo}: ${torneo.nombre}, participantes: ${torneo.participantes.length}, estoy en él: ${estaEnTorneo}`);
            
            if (estaEnTorneo) {
                misTorneos.push({ codigo, ...torneo });
            }
        }
    });
    
    console.log('Torneos donde estoy:', misTorneos.length);
    
    // Ordenar por fecha de creación (más reciente primero)
    misTorneos.sort((a, b) => (b.fechaCreacion || 0) - (a.fechaCreacion || 0));
    
    return misTorneos;
}

// Obtener tabla global (todos los participantes de todos los torneos)
function obtenerTablaGlobal() {
    const participantesGlobal = {};
    
    Object.keys(torneos).forEach(codigo => {
        const torneo = torneos[codigo];
        torneo.participantes.forEach(participante => {
            if (!participantesGlobal[participante.nombre]) {
                participantesGlobal[participante.nombre] = {
                    nombre: participante.nombre,
                    puntos: 0,
                    torneos: []
                };
            }
            participantesGlobal[participante.nombre].puntos += participante.puntos;
            participantesGlobal[participante.nombre].torneos.push({
                codigo,
                nombre: torneo.nombre,
                puntos: participante.puntos
            });
        });
    });
    
    // Convertir a array y ordenar
    return Object.values(participantesGlobal).sort((a, b) => b.puntos - a.puntos);
}

// Renderizar interfaz del torneo
function renderizarTorneo() {
    const container = document.getElementById('torneo-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const torneoDiv = document.createElement('div');
    torneoDiv.className = 'torneo-layout';
    torneoDiv.innerHTML = `
        <div class="torneo-columna izquierda">
            <h3>🏆 Mis Torneos</h3>
            <div id="mis-torneos-lista" class="mis-torneos-lista"></div>
        </div>
        <div class="torneo-columna derecha">
            <h3>🌍 Tabla Global</h3>
            <div id="tabla-global" class="tabla-global"></div>
        </div>
    `;
    container.appendChild(torneoDiv);
    
    // Renderizar mis torneos
    const misTorneos = obtenerMisTorneos();
    const misTorneosLista = document.getElementById('mis-torneos-lista');
    
    // Limpiar la lista antes de renderizar
    misTorneosLista.innerHTML = '';
    
    if (misTorneos.length === 0) {
        misTorneosLista.innerHTML = '<p class="sin-torneos">No estás en ningún torneo aún. Envía tus predicciones desde la pestaña "Grupos".</p>';
    } else {
        // Renderizar cada torneo
        misTorneos.forEach((torneoData, index) => {
            const { codigo, nombre, participantes, creadoPor } = torneoData;
            const torneoItem = document.createElement('div');
            torneoItem.className = 'torneo-item';
            torneoItem.dataset.codigo = codigo;
            const esCreador = creadoPor === miNombre;
            const miParticipante = participantes.find(p => p && p.nombre === miNombre);
            const miPosicion = participantes.findIndex(p => p && p.nombre === miNombre) + 1;
            
            torneoItem.innerHTML = `
                <div class="torneo-item-header">
                    <h4 class="torneo-nombre-clickeable">
                        <span class="torneo-nombre-texto">${nombre || `Torneo ${codigo}`}</span>
                        <span class="torneo-toggle-icon">▼</span>
                    </h4>
                    ${esCreador ? '<span class="badge-creador">Creador</span>' : ''}
                </div>
                <div class="torneo-item-content">
                    <div class="torneo-item-info">
                        <p><strong>Código:</strong> <span class="codigo-torneo">${codigo}</span></p>
                        <p><strong>Participantes:</strong> ${participantes ? participantes.length : 0}</p>
                        ${miParticipante ? `<p><strong>Tu posición:</strong> ${miPosicion}º con ${miParticipante.puntos || 0} puntos</p>` : ''}
                    </div>
                    <div class="torneo-item-acciones">
                        <button class="btn-ver-predicciones" data-codigo="${codigo}">
                            👁️ Ver Mis Predicciones
                        </button>
                    </div>
                    <div class="torneo-item-participantes">
                        <h5>Clasificación:</h5>
                        <table class="tabla-clasificacion-torneo">
                            <thead>
                                <tr>
                                    <th>Pos</th>
                                    <th>Nombre</th>
                                    <th>Pts</th>
                                    <th>Exactos</th>
                                    <th>Acertados</th>
                                    <th>Partidos</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${participantes && participantes.length > 0 ? participantes.map((p, index) => {
                                    const stats = p.estadisticas || { resultadosExactos: 0, resultadosAcertados: 0, partidosJugados: 0, puntosTotales: 0 };
                                    return `
                                        <tr class="${p && p.nombre === miNombre ? 'mi-fila-torneo' : ''}">
                                            <td>${index + 1}º</td>
                                            <td class="${p && p.nombre === miNombre ? 'mi-nombre' : ''}">${p ? p.nombre : 'Desconocido'}</td>
                                            <td><strong>${stats.puntosTotales || 0}</strong></td>
                                            <td>${stats.resultadosExactos || 0}</td>
                                            <td>${stats.resultadosAcertados || 0}</td>
                                            <td>${stats.partidosJugados || 0}</td>
                                        </tr>
                                    `;
                                }).join('') : '<tr><td colspan="6">Sin participantes aún</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            misTorneosLista.appendChild(torneoItem);
            
            // Agregar event listener para expandir/contraer
            const nombreClickeable = torneoItem.querySelector('.torneo-nombre-clickeable');
            const contenido = torneoItem.querySelector('.torneo-item-content');
            const icono = torneoItem.querySelector('.torneo-toggle-icon');
            
            // Por defecto, expandido
            torneoItem.classList.add('expandido');
            
            nombreClickeable.addEventListener('click', () => {
                const estaExpandido = torneoItem.classList.contains('expandido');
                if (estaExpandido) {
                    torneoItem.classList.remove('expandido');
                    contenido.style.display = 'none';
                    icono.textContent = '▶';
                } else {
                    torneoItem.classList.add('expandido');
                    contenido.style.display = 'block';
                    icono.textContent = '▼';
                }
            });
            
            // Agregar event listener para el botón de ver predicciones
            const btnVerPredicciones = torneoItem.querySelector('.btn-ver-predicciones');
            if (btnVerPredicciones) {
                btnVerPredicciones.addEventListener('click', () => {
                    mostrarPrediccionesTorneo(codigo);
                });
            }
        });
    }
    
    // Renderizar tabla global
    const tablaGlobal = obtenerTablaGlobal();
    const tablaGlobalDiv = document.getElementById('tabla-global');
    
    if (tablaGlobal.length === 0) {
        tablaGlobalDiv.innerHTML = '<p class="sin-datos">No hay participantes aún.</p>';
    } else {
        tablaGlobalDiv.innerHTML = `
            <table class="tabla-global-table">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Nombre</th>
                        <th>Puntos Totales</th>
                        <th>Torneos</th>
                    </tr>
                </thead>
                <tbody>
                    ${tablaGlobal.map((p, index) => `
                        <tr class="${index < 3 ? `pos-${index + 1}` : ''} ${p.nombre === miNombre ? 'mi-fila' : ''}">
                            <td>${index + 1}º</td>
                            <td>${p.nombre}</td>
                            <td><strong>${p.puntos}</strong></td>
                            <td>${p.torneos.length}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
}

// Función para mostrar las predicciones del usuario para un torneo específico
function mostrarPrediccionesTorneo(codigo) {
    if (!torneos[codigo]) {
        if (typeof mostrarModal === 'function') {
            mostrarModal({
                titulo: 'Error',
                mensaje: 'Torneo no encontrado',
                cancelar: false
            });
        }
        return;
    }
    
    const torneo = torneos[codigo];
    const participante = torneo.participantes.find(p => p && p.nombre === miNombre);
    
    if (!participante || !participante.predicciones) {
        if (typeof mostrarModal === 'function') {
            mostrarModal({
                titulo: 'Sin Predicciones',
                mensaje: 'No has enviado predicciones para este torneo aún.',
                cancelar: false
            });
        }
        return;
    }
    
    const predicciones = participante.predicciones;
    
    // Crear modal con las predicciones
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-predicciones';
    modalContent.innerHTML = `
        <div class="modal-predicciones-header">
            <h2>Mis Predicciones - ${torneo.nombre || `Torneo ${codigo}`}</h2>
            <button class="modal-predicciones-cerrar" onclick="this.closest('.modal-predicciones-overlay').remove()">&times;</button>
        </div>
        <div class="modal-predicciones-body">
            <p class="modal-predicciones-info">Estas son tus predicciones para este torneo. Los resultados están bloqueados y no se pueden modificar.</p>
            <div id="predicciones-container" class="predicciones-container-solo-lectura"></div>
        </div>
    `;
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-predicciones-overlay';
    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);
    
    // Renderizar predicciones en modo solo lectura
    const container = document.getElementById('predicciones-container');
    const resultadosReales = torneo.resultadosReales || {};
    renderizarPrediccionesSoloLectura(container, predicciones, resultadosReales);
    
    // Cerrar al hacer click fuera
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Función para renderizar predicciones en modo solo lectura
function renderizarPrediccionesSoloLectura(container, predicciones, resultadosReales) {
    if (!container || typeof GRUPOS_MUNDIAL_2026 === 'undefined') return;
    
    container.innerHTML = '';
    
    GRUPOS_MUNDIAL_2026.forEach((grupo, grupoIndex) => {
        const prediccionesGrupo = predicciones[grupoIndex] || {};
        const resultadosGrupo = resultadosReales[grupoIndex] || {};
        
        const grupoDiv = document.createElement('div');
        grupoDiv.className = 'grupo-solo-lectura';
        
        grupoDiv.innerHTML = `
            <h3>${grupo.nombre}</h3>
            ${renderizarTablaPosicionesSoloLectura(grupo, grupoIndex, prediccionesGrupo)}
            <div class="partidos-solo-lectura">
                <h4>Partidos</h4>
                ${renderizarPartidosSoloLectura(grupo, grupoIndex, prediccionesGrupo, resultadosGrupo)}
            </div>
        `;
        
        container.appendChild(grupoDiv);
    });
}

// Función para renderizar tabla de posiciones en solo lectura
function renderizarTablaPosicionesSoloLectura(grupo, grupoIndex, prediccionesGrupo) {
    // Calcular posiciones basadas en las predicciones
    const equipos = grupo.equipos.map((equipo, index) => {
        let puntos = 0, golesFavor = 0, golesContra = 0, partidosJugados = 0, ganados = 0, empatados = 0, perdidos = 0;
        
        grupo.partidos.forEach((partido, partidoIndex) => {
            const prediccion = prediccionesGrupo[partidoIndex];
            if (!prediccion || prediccion.golesLocal === '' || prediccion.golesVisitante === '') {
                return;
            }
            
            const golesLocal = parseInt(prediccion.golesLocal) || 0;
            const golesVisitante = parseInt(prediccion.golesVisitante) || 0;
            
            if (partido.local === index) {
                golesFavor += golesLocal;
                golesContra += golesVisitante;
                partidosJugados++;
                if (golesLocal > golesVisitante) { ganados++; puntos += 3; }
                else if (golesLocal === golesVisitante) { empatados++; puntos += 1; }
                else { perdidos++; }
            } else if (partido.visitante === index) {
                golesFavor += golesVisitante;
                golesContra += golesLocal;
                partidosJugados++;
                if (golesVisitante > golesLocal) { ganados++; puntos += 3; }
                else if (golesVisitante === golesLocal) { empatados++; puntos += 1; }
                else { perdidos++; }
            }
        });
        
        return {
            nombre: typeof obtenerNombreEquipo === 'function' ? obtenerNombreEquipo(grupo, grupoIndex, index) : grupo.equipos[index],
            puntos,
            golesFavor,
            golesContra,
            diferencia: golesFavor - golesContra,
            partidosJugados,
            ganados,
            empatados,
            perdidos
        };
    });
    
    equipos.sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        if (b.diferencia !== a.diferencia) return b.diferencia - a.diferencia;
        return b.golesFavor - a.golesFavor;
    });
    
    return `
        <table class="tabla-posiciones tabla-solo-lectura">
            <thead>
                <tr>
                    <th>Pos</th>
                    <th>Equipo</th>
                    <th>PJ</th>
                    <th>PG</th>
                    <th>PE</th>
                    <th>PP</th>
                    <th>GF</th>
                    <th>GC</th>
                    <th>DG</th>
                    <th>Pts</th>
                </tr>
            </thead>
            <tbody>
                ${equipos.map((equipo, index) => `
                    <tr class="${index < 2 ? 'pos-' + (index + 1) : index === 2 ? 'pos-3' : ''}">
                        <td>${index + 1}º</td>
                        <td>${equipo.nombre}</td>
                        <td>${equipo.partidosJugados}</td>
                        <td>${equipo.ganados}</td>
                        <td>${equipo.empatados}</td>
                        <td>${equipo.perdidos}</td>
                        <td>${equipo.golesFavor}</td>
                        <td>${equipo.golesContra}</td>
                        <td>${equipo.diferencia >= 0 ? '+' : ''}${equipo.diferencia}</td>
                        <td><strong>${equipo.puntos}</strong></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Función para renderizar partidos en solo lectura con predicciones y resultados reales
function renderizarPartidosSoloLectura(grupo, grupoIndex, prediccionesGrupo, resultadosGrupo) {
    return grupo.partidos.map((partido, partidoIndex) => {
        const prediccion = prediccionesGrupo[partidoIndex];
        const resultadoReal = resultadosGrupo[partidoIndex];
        
        // Predicción del usuario
        const predGolesLocal = prediccion ? (prediccion.golesLocal || '') : '';
        const predGolesVisitante = prediccion ? (prediccion.golesVisitante || '') : '';
        
        // Resultado real (si existe)
        const realGolesLocal = resultadoReal ? (resultadoReal.golesLocal || '') : '';
        const realGolesVisitante = resultadoReal ? (resultadoReal.golesVisitante || '') : '';
        
        const tieneResultadoReal = resultadoReal && (realGolesLocal !== '' || realGolesVisitante !== '');
        
        // Calcular puntos si hay resultado real
        let puntos = 0;
        let clasePuntos = '';
        if (tieneResultadoReal && prediccion) {
            const predLocal = parseInt(predGolesLocal) || 0;
            const predVisitante = parseInt(predGolesVisitante) || 0;
            const realLocal = parseInt(realGolesLocal) || 0;
            const realVisitante = parseInt(realGolesVisitante) || 0;
            
            // Resultado exacto (5 puntos)
            if (predLocal === realLocal && predVisitante === realVisitante) {
                puntos = 5;
                clasePuntos = 'puntos-exacto';
            }
            // Resultado acertado (3 puntos)
            else if ((predLocal > predVisitante && realLocal > realVisitante) ||
                     (predLocal < predVisitante && realLocal < realVisitante) ||
                     (predLocal === predVisitante && realLocal === realVisitante)) {
                puntos = 3;
                clasePuntos = 'puntos-acertado';
            }
            // Sin puntos
            else {
                puntos = 0;
                clasePuntos = 'puntos-error';
            }
        }
        
        const equipoLocal = typeof obtenerNombreEquipo === 'function' 
            ? obtenerNombreEquipo(grupo, grupoIndex, partido.local)
            : grupo.equipos[partido.local];
        const equipoVisitante = typeof obtenerNombreEquipo === 'function'
            ? obtenerNombreEquipo(grupo, grupoIndex, partido.visitante)
            : grupo.equipos[partido.visitante];
        
        return `
            <div class="partido-solo-lectura ${clasePuntos}">
                <div class="partido-comparacion-header">
                    <span class="equipos-nombres">${equipoLocal} vs ${equipoVisitante}</span>
                    ${tieneResultadoReal ? `<span class="puntos-badge ${clasePuntos}">${puntos} pts</span>` : ''}
                </div>
                <div class="resultado-comparacion">
                    <div class="resultado-prediccion">
                        <span class="resultado-label">Tu predicción</span>
                        <div class="resultado-input-solo-lectura">
                            <input type="text" value="${predGolesLocal || '-'}" readonly class="input-solo-lectura input-prediccion">
                            <span class="separador">-</span>
                            <input type="text" value="${predGolesVisitante || '-'}" readonly class="input-solo-lectura input-prediccion">
                        </div>
                    </div>
                    ${tieneResultadoReal ? `
                    <div class="resultado-real">
                        <span class="resultado-label">Resultado real</span>
                        <div class="resultado-input-solo-lectura">
                            <input type="text" value="${realGolesLocal || '-'}" readonly class="input-solo-lectura input-real">
                            <span class="separador">-</span>
                            <input type="text" value="${realGolesVisitante || '-'}" readonly class="input-solo-lectura input-real">
                        </div>
                    </div>
                    ` : `
                    <div class="resultado-real">
                        <span class="resultado-label resultado-pendiente">Pendiente</span>
                    </div>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// Sistema de modales personalizados
let modalResolveActual = null;

function mostrarModal(opciones) {
    return new Promise((resolve) => {
        // Si hay un modal abierto, cerrarlo primero
        if (modalResolveActual) {
            modalResolveActual(false);
        }
        modalResolveActual = resolve;
        
        const overlay = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const message = document.getElementById('modal-message');
        const inputWrapper = document.getElementById('modal-input-wrapper');
        const input = document.getElementById('modal-input');
        const togglePasswordBtn = document.getElementById('modal-toggle-password');
        const okBtn = document.getElementById('modal-ok');
        const cancelBtn = document.getElementById('modal-cancel');
        const closeBtn = document.getElementById('modal-close');
        
        // Limpiar event listeners anteriores creando nuevos elementos
        const nuevoOk = okBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(nuevoOk, okBtn);
        const nuevoCancel = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(nuevoCancel, cancelBtn);
        const nuevoClose = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(nuevoClose, closeBtn);
        
        // Obtener referencias frescas
        const okBtnFinal = document.getElementById('modal-ok');
        const cancelBtnFinal = document.getElementById('modal-cancel');
        const closeBtnFinal = document.getElementById('modal-close');
        const inputFinal = document.getElementById('modal-input');
        const togglePasswordFinal = document.getElementById('modal-toggle-password');
        
        // Configurar contenido
        title.textContent = opciones.titulo || 'Atención';
        message.textContent = opciones.mensaje || '';
        message.style.display = opciones.mensaje ? 'block' : 'none';
        
        // Configurar input si es necesario
        if (opciones.input) {
            inputWrapper.style.display = 'flex';
            inputFinal.type = opciones.inputType || 'text';
            inputFinal.placeholder = opciones.placeholder || '';
            inputFinal.value = opciones.valorInicial || '';
            inputFinal.disabled = false;
            inputFinal.readOnly = false;
            inputFinal.style.pointerEvents = 'auto';
            inputFinal.style.opacity = '1';
            
            if (opciones.maxLength) {
                inputFinal.setAttribute('maxlength', opciones.maxLength);
            } else {
                inputFinal.removeAttribute('maxlength');
            }
            
            // Mostrar botón de ojo si es password
            if (opciones.inputType === 'password') {
                togglePasswordFinal.style.display = 'block';
                let mostrarPassword = false;
                
                togglePasswordFinal.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    mostrarPassword = !mostrarPassword;
                    inputFinal.type = mostrarPassword ? 'text' : 'password';
                    togglePasswordFinal.querySelector('.eye-icon').textContent = mostrarPassword ? '🙈' : '👁️';
                };
            } else {
                togglePasswordFinal.style.display = 'none';
            }
            
            // Si es password y maxLength es 5, solo permitir números
            if (opciones.inputType === 'password' && opciones.maxLength === 5) {
                inputFinal.pattern = '[0-9]*';
                inputFinal.oninput = (e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                };
            } else {
                inputFinal.oninput = null;
            }
        } else {
            inputWrapper.style.display = 'none';
        }
        
        // Configurar botones
        okBtnFinal.textContent = opciones.okTexto || 'OK';
        if (opciones.cancelar) {
            cancelBtnFinal.style.display = 'inline-block';
            cancelBtnFinal.textContent = opciones.cancelarTexto || 'Cancelar';
        } else {
            cancelBtnFinal.style.display = 'none';
        }
        
        // Event listeners
        const handleOk = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const valor = opciones.input ? inputFinal.value : true;
            overlay.style.display = 'none';
            modalResolveActual = null;
            resolve(valor);
        };
        
        const handleCancel = (e) => {
            e.preventDefault();
            e.stopPropagation();
            overlay.style.display = 'none';
            modalResolveActual = null;
            resolve(false);
        };
        
        const handleClose = (e) => {
            e.preventDefault();
            e.stopPropagation();
            overlay.style.display = 'none';
            modalResolveActual = null;
            resolve(false);
        };
        
        const handleOverlayClick = (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
                modalResolveActual = null;
                resolve(false);
            }
        };
        
        okBtnFinal.addEventListener('click', handleOk);
        cancelBtnFinal.addEventListener('click', handleCancel);
        closeBtnFinal.addEventListener('click', handleClose);
        overlay.addEventListener('click', handleOverlayClick);
        
        // Enter para confirmar
        if (opciones.input) {
            const handleKeyPress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    okBtnFinal.click();
                }
            };
            inputFinal.addEventListener('keypress', handleKeyPress);
            
            // Focus después de un pequeño delay
            setTimeout(() => {
                inputFinal.focus();
                if (inputFinal.value) {
                    inputFinal.select();
                }
            }, 150);
        }
        
        // Mostrar modal
        overlay.style.display = 'flex';
    });
}

// Función para mostrar diálogo de envío de predicciones
async function mostrarDialogoEnviarPredicciones() {
    // Obtener todas las predicciones actuales
    const predicciones = {};
    GRUPOS_MUNDIAL_2026.forEach((grupo, grupoIndex) => {
        const partidos = resultados[grupoIndex]?.partidos || [];
        predicciones[grupoIndex] = {};
        grupo.partidos.forEach((partido, partidoIndex) => {
            const resultado = partidos[partidoIndex] || { golesLocal: '', golesVisitante: '' };
            predicciones[grupoIndex][partidoIndex] = {
                golesLocal: resultado.golesLocal || '',
                golesVisitante: resultado.golesVisitante || ''
            };
        });
    });
    
    // PRIMERO: Preguntar si crear o unirse a un torneo
    const crearNuevo = await mostrarModal({
        titulo: 'Enviar Predicciones',
        mensaje: '¿Quieres crear un nuevo torneo o unirte a uno existente?',
        cancelar: true,
        okTexto: 'Crear Nuevo',
        cancelarTexto: 'Unirse a Existente'
    });
    
    if (crearNuevo === false && crearNuevo !== null) {
        // Unirse a torneo existente
        const codigo = await mostrarModal({
            titulo: 'Unirse a Torneo',
            mensaje: 'Ingresa el código del torneo (6 dígitos):',
            input: true,
            placeholder: '000000',
            maxLength: 6,
            cancelar: true
        });
        
        if (!codigo || codigo === false) return;
        
        const codigoLimpio = codigo.trim().replace(/\D/g, '');
        if (codigoLimpio.length !== 6) {
            await mostrarModal({
                titulo: 'Error',
                mensaje: 'El código debe tener 6 dígitos',
                cancelar: false
            });
            return;
        }
        
        // Verificar si el torneo existe
        const torneo = await obtenerTorneoPorCodigoSupabase(codigoLimpio);
        if (!torneo && !torneos[codigoLimpio]) {
            await mostrarModal({
                titulo: 'Error',
                mensaje: 'No se encontró un torneo con ese código',
                cancelar: false
            });
            return;
        }
        
        // Verificar si ya tiene una predicción en este torneo ANTES de pedir el nick
        const yaTienePrediccion = await usuarioYaTienePrediccion(codigoLimpio);
        if (yaTienePrediccion) {
            await mostrarModal({
                titulo: 'Ya Participaste',
                mensaje: 'Ya has enviado una predicción para este torneo. Solo puedes enviar una predicción por torneo, incluso si usas un nick diferente.',
                cancelar: false
            });
            return;
        }
        
        // SEGUNDO: Pedir nombre/nick para este torneo
        let nombreParaTorneo = '';
        const usuarioLogueado = typeof obtenerUsuarioActual === 'function' ? obtenerUsuarioActual() : null;
        
        if (usuarioLogueado) {
            // Usuario logueado: pedir nick opcional
            const nickOpcional = await mostrarModal({
                titulo: 'Nick para el Torneo',
                mensaje: `Estás logueado como: ${usuarioLogueado.nombreUsuario}\n\nIngresa un nick opcional para este torneo (o deja vacío para usar tu nombre de usuario):`,
                input: true,
                placeholder: 'Nick opcional',
                maxLength: 30,
                cancelar: true
            });
            
            if (nickOpcional === false) return;
            
            nombreParaTorneo = nickOpcional && nickOpcional.trim() !== '' 
                ? nickOpcional.trim() 
                : usuarioLogueado.nombreUsuario;
        } else {
            // Modo invitado: pedir nombre
            const nombre = await mostrarModal({
                titulo: 'Nick para el Torneo',
                mensaje: 'Ingresa tu nombre para participar en este torneo:',
                input: true,
                placeholder: 'Tu nombre',
                maxLength: 30,
                cancelar: true
            });
            
            if (!nombre || nombre === false || nombre.trim() === '') {
                return;
            }
            
            nombreParaTorneo = nombre.trim();
        }
        
        if (!nombreParaTorneo || nombreParaTorneo.trim() === '') {
            return;
        }
        
        miNombre = nombreParaTorneo.trim();
        localStorage.setItem('mundial2026_mi_nombre', miNombre);
        
        // Unirse al torneo
        await unirseATorneo(codigoLimpio, miNombre);
        const resultado = await enviarPredicciones(codigoLimpio, miNombre, predicciones);
        
        if (resultado && !resultado.exito) {
            await mostrarModal({
                titulo: 'Error',
                mensaje: resultado.mensaje || 'No se pudieron enviar las predicciones',
                cancelar: false
            });
            return;
        }
        
        await mostrarModal({
            titulo: '¡Predicciones Enviadas!',
            mensaje: `Te has unido al torneo ${codigoLimpio} como "${miNombre}"`,
            cancelar: false
        });
        
        if (typeof renderizarTorneo === 'function') {
            await renderizarTorneo();
        }
        return;
    }
    
    // Crear nuevo torneo
    if (crearNuevo === null || crearNuevo === true) {
        // SEGUNDO: Pedir nombre/nick para este torneo
        let nombreParaTorneo = '';
        const usuarioLogueado = typeof obtenerUsuarioActual === 'function' ? obtenerUsuarioActual() : null;
        
        if (usuarioLogueado) {
            // Usuario logueado: pedir nick opcional
            const nickOpcional = await mostrarModal({
                titulo: 'Nick para el Torneo',
                mensaje: `Estás logueado como: ${usuarioLogueado.nombreUsuario}\n\nIngresa un nick opcional para este torneo (o deja vacío para usar tu nombre de usuario):`,
                input: true,
                placeholder: 'Nick opcional',
                maxLength: 30,
                cancelar: true
            });
            
            if (nickOpcional === false) return;
            
            nombreParaTorneo = nickOpcional && nickOpcional.trim() !== '' 
                ? nickOpcional.trim() 
                : usuarioLogueado.nombreUsuario;
        } else {
            // Modo invitado: pedir nombre
            const nombre = await mostrarModal({
                titulo: 'Nick para el Torneo',
                mensaje: 'Ingresa tu nombre para participar en este torneo:',
                input: true,
                placeholder: 'Tu nombre',
                maxLength: 30,
                cancelar: true
            });
            
            if (!nombre || nombre === false || nombre.trim() === '') {
                return;
            }
            
            nombreParaTorneo = nombre.trim();
        }
        
        if (!nombreParaTorneo || nombreParaTorneo.trim() === '') {
            return;
        }
        
        miNombre = nombreParaTorneo.trim();
        localStorage.setItem('mundial2026_mi_nombre', miNombre);
        console.log('Nombre guardado:', miNombre);
        
        // Crear nuevo torneo
        const nombreTorneo = await mostrarModal({
            titulo: 'Crear Torneo',
            mensaje: 'Ingresa un nombre para el torneo (opcional):',
            input: true,
            placeholder: 'Nombre del torneo',
            maxLength: 30,
            cancelar: true
        });
        
        if (nombreTorneo === false) return;
        
        // Asegurar que torneos existe antes de crear
        if (!torneos || typeof torneos !== 'object') {
            torneos = {};
        }
        
        const codigo = await crearTorneo(nombreTorneo || '', miNombre);
        const resultado = await enviarPredicciones(codigo, miNombre, predicciones);
        
        if (resultado && !resultado.exito) {
            await mostrarModal({
                titulo: 'Error',
                mensaje: resultado.mensaje || 'No se pudieron enviar las predicciones',
                cancelar: false
            });
            return;
        }
        
        await mostrarModal({
            titulo: '¡Torneo Creado!',
            mensaje: `¡Torneo creado exitosamente!\n\nCódigo del torneo: ${codigo}\n\nComparte este código con tus amigos para que se unan.`,
            cancelar: false
        });
    }
    
    // Forzar recarga de datos antes de renderizar
    inicializarTorneo();
    
    // Actualizar interfaz
    if (typeof renderizarTorneo === 'function') {
        renderizarTorneo();
    }
    if (typeof renderizarGrupos === 'function') {
        renderizarGrupos();
    }
}

// Inicializar cuando se carga la página
inicializarTorneo();
