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
    } catch (e) {
    }
    
    // Si Supabase está disponible, también guardar ahí
    // Nota: Los datos se guardan automáticamente cuando se crean/actualizan torneos y participantes
    // Esta función mantiene localStorage como backup
}

// Generar código de 6 dígitos para torneos abiertos
function generarCodigoTorneo() {
    let codigo;
    do {
        codigo = Math.floor(100000 + Math.random() * 900000).toString();
    } while (torneos[codigo]); // Asegurar que sea único
    return codigo;
}

// Generar código único basado en contraseña para torneos privados
function generarCodigoTorneoPrivado(clave, nombre, creador) {
    // Crear un hash simple basado en la contraseña, nombre y creador
    const str = `${clave}_${nombre}_${creador}_${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir a entero de 32 bits
    }
    // Convertir a código de 6 dígitos positivo
    const codigo = Math.abs(hash % 900000 + 100000).toString();
    return codigo;
}

// Crear nuevo torneo
async function crearTorneo(nombre, nombreCreador, esPrivado = false, clave = null) {
    // Asegurar que torneos existe y es un objeto
    if (!torneos || typeof torneos !== 'object') {
        torneos = {};
    }
    
    // Para torneos privados, generar código basado en la contraseña
    // Para torneos abiertos, generar código aleatorio
    let codigo;
    if (esPrivado && clave) {
        codigo = generarCodigoTorneoPrivado(clave, nombre, nombreCreador);
        // Asegurar que sea único (si existe, agregar timestamp)
        let intentos = 0;
        while (torneos[codigo] && intentos < 10) {
            codigo = generarCodigoTorneoPrivado(clave, nombre, nombreCreador);
            intentos++;
        }
    } else {
        codigo = generarCodigoTorneo();
    }
    
    // Crear en Supabase si está disponible
    if (usarSupabase() && typeof crearTorneoSupabase === 'function') {
        const exito = await crearTorneoSupabase(codigo, nombre, nombreCreador, esPrivado, clave);
        if (!exito) {
        }
    }
    
    // Crear en memoria local
    torneos[codigo] = {
        nombre: nombre || `Torneo ${codigo}`,
        participantes: [],
        creadoPor: nombreCreador,
        fechaCreacion: Date.now(),
        resultadosReales: {},
        esPrivado: esPrivado,
        clave: clave
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
    
    const usuarioId = obtenerIdUsuarioUnico();
    
    // Verificar si el usuario ya tiene una predicción en este torneo
    const yaTiene = await usuarioYaTienePrediccion(codigo);
    
    // Si ya tiene predicción, verificar si se puede actualizar
    if (yaTiene) {
        const fechaActual = new Date();
        const FECHA_LIMITE_MODIFICACION = new Date('2026-06-08T00:00:00'); // 8 de junio a las 00:00 = después del 7
        
        // Si estamos después del 7 de junio, no permitir actualizar
        if (fechaActual >= FECHA_LIMITE_MODIFICACION) {
            return { exito: false, mensaje: 'Ya has enviado una predicción para este torneo. Las predicciones no se pueden modificar después del 7 de junio.' };
        }
        // Si estamos antes del 8 de junio (hasta el 7 inclusive), permitir actualizar
    }
    
    // Guardar en Supabase si está disponible
    let errorSupabase = null;
    if (usarSupabase() && typeof guardarParticipanteSupabase === 'function') {
        try {
            const exito = await guardarParticipanteSupabase(codigo, nombre, predicciones, usuarioId, yaTiene);
            if (!exito) {
                errorSupabase = 'No se pudo guardar en Supabase. Se guardará solo localmente.';
                console.error('Error al guardar participante en Supabase. Continuando con localStorage...');
            }
        } catch (error) {
            errorSupabase = `Error al guardar en Supabase: ${error.message || error}`;
            console.error('Error al guardar participante en Supabase:', error);
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
    
    // Guardar predicciones (actualizar si ya existía, crear si es nuevo)
    participante.predicciones = predicciones;
    await guardarTorneos();
    await calcularPuntosTorneo(codigo);
    
    // Actualizar estadísticas en Supabase
    if (usarSupabase() && typeof actualizarEstadisticasParticipanteSupabase === 'function') {
        try {
            const participanteActualizado = torneos[codigo].participantes.find(p => p.nombre === nombre);
            if (participanteActualizado && participanteActualizado.estadisticas) {
                await actualizarEstadisticasParticipanteSupabase(codigo, nombre, participanteActualizado.estadisticas);
            }
        } catch (error) {
            console.error('Error al actualizar estadísticas en Supabase:', error);
        }
    }
    
    // Si hubo error en Supabase pero se guardó localmente, informar al usuario
    const mensaje = yaTiene ? 'Predicción actualizada correctamente' : 'Predicción enviada correctamente';
    const mensajeCompleto = errorSupabase ? `${mensaje}. Nota: ${errorSupabase}` : mensaje;
    
    return { exito: true, mensaje: mensajeCompleto, errorSupabase: errorSupabase };
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

// Obtener todos los torneos del usuario desde Supabase
async function obtenerMisTorneos() {
    const misTorneos = [];
    
    // VERIFICAR PRIMERO: Solo mostrar torneos si el usuario está logueado
    let usuarioLogueado = false;
    let nombreUsuario = '';
    
    if (typeof obtenerUsuarioActual === 'function') {
        const usuario = obtenerUsuarioActual();
        if (usuario && usuario.nombreUsuario) {
            usuarioLogueado = true;
            nombreUsuario = usuario.nombreUsuario;
        }
    }
    
    // Si no está logueado, retornar vacío inmediatamente
    if (!usuarioLogueado) {
        return [];
    }
    
    // Si Supabase no está disponible, retornar vacío
    if (!usarSupabase() || typeof obtenerTorneosSupabase !== 'function') {
        return [];
    }
    
    // Obtener usuarioId para búsqueda
    const usuarioId = obtenerIdUsuarioUnico();
    
    try {
        // Cargar todos los torneos desde Supabase
        const todosLosTorneos = await cargarDatosDesdeSupabase();
        if (!todosLosTorneos) {
            return [];
        }
        
        // Filtrar torneos donde el usuario es creador o participante
        for (const [codigo, torneo] of Object.entries(todosLosTorneos)) {
            let estaEnTorneo = false;
            
            // Verificar si es el creador
            if (torneo.creadoPor === nombreUsuario) {
                estaEnTorneo = true;
            }
            
            // Verificar si está en participantes
            if (!estaEnTorneo && torneo.participantes && Array.isArray(torneo.participantes)) {
                estaEnTorneo = torneo.participantes.some(p => {
                    if (!p) return false;
                    // Verificar por nombre
                    if (p.nombre === nombreUsuario) {
                        return true;
                    }
                    // Verificar por usuarioId
                    if (p.usuarioId && p.usuarioId === usuarioId) {
                        return true;
                    }
                    return false;
                });
            }
            
            if (estaEnTorneo) {
                misTorneos.push({ codigo, ...torneo });
            }
        }
        
        // Ordenar por fecha de creación (más reciente primero)
        misTorneos.sort((a, b) => (b.fechaCreacion || 0) - (a.fechaCreacion || 0));
        
        return misTorneos;
    } catch (error) {
        return [];
    }
}

// Obtener tabla global (todos los participantes de todos los torneos) desde Supabase
async function obtenerTablaGlobal() {
    const participantesGlobal = {};
    
    // Cargar datos desde Supabase si está disponible
    let torneosParaTabla = torneos;
    if (usarSupabase() && typeof cargarDatosDesdeSupabase === 'function') {
        try {
            const datosSupabase = await cargarDatosDesdeSupabase();
            if (datosSupabase) {
                torneosParaTabla = datosSupabase;
            }
        } catch (error) {
        }
    }
    
    Object.keys(torneosParaTabla).forEach(codigo => {
        const torneo = torneosParaTabla[codigo];
        if (torneo && torneo.participantes && Array.isArray(torneo.participantes)) {
            torneo.participantes.forEach(participante => {
                if (!participante || !participante.nombre) return;
                
                if (!participantesGlobal[participante.nombre]) {
                    participantesGlobal[participante.nombre] = {
                        nombre: participante.nombre,
                        puntos: 0,
                        torneos: []
                    };
                }
                const puntosParticipante = participante.puntos || (participante.estadisticas && participante.estadisticas.puntosTotales) || 0;
                participantesGlobal[participante.nombre].puntos += puntosParticipante;
                participantesGlobal[participante.nombre].torneos.push({
                    codigo,
                    nombre: torneo.nombre,
                    puntos: puntosParticipante
                });
            });
        }
    });
    
    // Convertir a array y ordenar
    return Object.values(participantesGlobal).sort((a, b) => b.puntos - a.puntos);
}

// Renderizar interfaz del torneo
async function renderizarTorneo() {
    const container = document.getElementById('torneo-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const torneoDiv = document.createElement('div');
    torneoDiv.className = 'torneo-layout';
    torneoDiv.innerHTML = `
        <div class="torneo-columna izquierda">
            <h3>${typeof t === 'function' ? t('misTorneos') : '🏆 Mis Torneos'}</h3>
            <div id="mis-torneos-lista" class="mis-torneos-lista">
                <p style="text-align: center; color: #666; padding: 20px;">Cargando...</p>
            </div>
        </div>
        <div class="torneo-columna derecha">
            <h3>${typeof t === 'function' ? t('tablaGlobal') : '🌍 Tabla Global'}</h3>
            <div id="tabla-global" class="tabla-global">
                <p style="text-align: center; color: #666; padding: 20px;">Cargando...</p>
            </div>
        </div>
    `;
    container.appendChild(torneoDiv);
    
    // Recargar datos desde Supabase antes de renderizar
    if (usarSupabase() && typeof cargarDatosDesdeSupabase === 'function') {
        try {
            const datosSupabase = await cargarDatosDesdeSupabase();
            if (datosSupabase) {
                torneos = datosSupabase;
            }
        } catch (error) {
        }
    }
    
    // Actualizar miNombre desde usuario logueado o localStorage
    if (typeof obtenerUsuarioActual === 'function') {
        const usuario = obtenerUsuarioActual();
        if (usuario && usuario.nombreUsuario) {
            miNombre = usuario.nombreUsuario;
        }
    }
    if (!miNombre) {
        const nombreGuardado = localStorage.getItem('mundial2026_mi_nombre');
        if (nombreGuardado) {
            miNombre = nombreGuardado;
        }
    }
    
    // Renderizar mis torneos (ahora es asíncrono y consulta Supabase directamente)
    const misTorneos = await obtenerMisTorneos();
    const misTorneosLista = document.getElementById('mis-torneos-lista');
    
    // Limpiar la lista antes de renderizar
    misTorneosLista.innerHTML = '';
    
    if (misTorneos.length === 0) {
        misTorneosLista.innerHTML = `<p class="sin-torneos">${typeof t === 'function' ? t('noEstasEnNingunTorneo') : 'No estás en ningún torneo aún. Envía tus predicciones desde la pestaña "Grupos".'}</p>`;
    } else {
        // Renderizar cada torneo
        misTorneos.forEach((torneoData, index) => {
            const { codigo, nombre, participantes, creadoPor, esPrivado } = torneoData;
            const torneoItem = document.createElement('div');
            torneoItem.className = 'torneo-item';
            torneoItem.dataset.codigo = codigo;
            const esCreador = creadoPor === miNombre;
            const miParticipante = participantes.find(p => p && p.nombre === miNombre);
            const miPosicion = participantes.findIndex(p => p && p.nombre === miNombre) + 1;
            
            // Determinar si es privado (similar a la lógica en mostrarListaTorneos)
            const tieneClave = torneoData.clave && torneoData.clave.trim() !== '';
            const esAbiertoExplicito = esPrivado === false;
            const esPrivadoExplicito = esPrivado === true;
            const esPrivadoFinal = esAbiertoExplicito ? false : (esPrivadoExplicito || tieneClave || esPrivado === undefined);
            
            torneoItem.innerHTML = `
                <div class="torneo-item-header">
                    <h4 class="torneo-nombre-clickeable">
                        <span class="torneo-nombre-texto">${nombre || `Torneo ${codigo}`}</span>
                        <span class="torneo-toggle-icon">▼</span>
                    </h4>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        ${esPrivadoFinal ? `<span class="badge-torneo badge-privado">${typeof t === 'function' ? t('privado') : '🔒 Privado'}</span>` : `<span class="badge-torneo badge-abierto">${typeof t === 'function' ? t('abierto') : '🌍 Abierto'}</span>`}
                        ${esCreador ? `<span class="badge-creador">${typeof t === 'function' ? t('creador') : 'Creador'}</span>` : ''}
                    </div>
                </div>
                <div class="torneo-item-content">
                    <div class="torneo-item-info">
                        ${esPrivadoFinal && torneoData.clave ? `<p><strong>${typeof t === 'function' ? t('contraseña') : 'Contraseña'}:</strong> <span class="codigo-torneo">${torneoData.clave}</span></p>` : ''}
                        <p><strong>${typeof t === 'function' ? t('participantes') : 'Participantes'}:</strong> ${participantes ? participantes.length : 0}</p>
                        ${miParticipante ? `<p><strong>${typeof t === 'function' ? t('tuPosicion') : 'Tu posición'}:</strong> ${miPosicion}º ${typeof t === 'function' ? t('con') : 'con'} ${miParticipante.puntos || 0} ${typeof t === 'function' ? t('puntos') : 'puntos'}</p>` : ''}
                    </div>
                    <div class="torneo-item-acciones">
                        <button class="btn-ver-predicciones" data-codigo="${codigo}">
                            ${typeof t === 'function' ? t('verMisPredicciones') : '👁️ Ver Mis Predicciones'}
                        </button>
                    </div>
                    <div class="torneo-item-participantes">
                        <h5>${typeof t === 'function' ? t('clasificacion') : 'Clasificación'}:</h5>
                        <table class="tabla-clasificacion-torneo">
                            <thead>
                                <tr>
                                    <th>${typeof t === 'function' ? t('pos') : 'Pos'}</th>
                                    <th>${typeof t === 'function' ? t('nombre') : 'Nombre'}</th>
                                    <th>${typeof t === 'function' ? t('pts') : 'Pts'}</th>
                                    <th>${typeof t === 'function' ? t('exactos') : 'Exactos'}</th>
                                    <th>${typeof t === 'function' ? t('acertados') : 'Acertados'}</th>
                                    <th>${typeof t === 'function' ? t('partidos') : 'Partidos'}</th>
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
    
    // Renderizar tabla global (ahora es asíncrono)
    const tablaGlobal = await obtenerTablaGlobal();
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
                titulo: typeof t === 'function' ? t('error') : 'Error',
                mensaje: typeof t === 'function' ? t('torneoNoEncontrado') : 'Torneo no encontrado',
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
                titulo: typeof t === 'function' ? t('sinPredicciones') : 'Sin Predicciones',
                mensaje: typeof t === 'function' ? t('noHasEnviadoPredicciones') : 'No has enviado predicciones para este torneo aún.',
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
            <h2>${typeof t === 'function' ? t('misPredicciones') : 'Mis Predicciones'} - ${torneo.nombre || `Torneo ${codigo}`}</h2>
            <button class="modal-predicciones-cerrar" onclick="this.closest('.modal-predicciones-overlay').remove()">&times;</button>
        </div>
        <div class="modal-predicciones-body">
            <div style="margin-bottom: 20px; display: flex; gap: 10px; justify-content: center;">
                <button id="btn-cargar-prediccion" class="btn-cargar-prediccion" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 1em; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    ${typeof t === 'function' ? t('cargarPrediccion') : '📥 Cargar Predicción'}
                </button>
            </div>
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
    
    // Configurar botón de cargar predicción
    const btnCargar = document.getElementById('btn-cargar-prediccion');
    if (btnCargar) {
        btnCargar.addEventListener('click', () => {
            cargarPrediccionEnPaginaPrincipal(predicciones);
            overlay.remove();
        });
    }
    
    // Cerrar al hacer click fuera
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Función para cargar predicciones en la página principal
function cargarPrediccionEnPaginaPrincipal(predicciones) {
    if (!predicciones || typeof resultados === 'undefined') {
        return;
    }
    
    // Cargar predicciones de grupos
    Object.keys(predicciones).forEach(key => {
        const grupoIndex = parseInt(key);
        if (!isNaN(grupoIndex) && grupoIndex >= 0 && grupoIndex < 12) {
            // Es un grupo
            const prediccionesGrupo = predicciones[grupoIndex];
            if (!prediccionesGrupo) return;
            
            // Inicializar el grupo si no existe
            if (!resultados[grupoIndex]) {
                resultados[grupoIndex] = {
                    partidos: [],
                    posiciones: [],
                    playoffSelecciones: {}
                };
            }
            
            // Cargar partidos (las predicciones se acceden directamente como prediccionesGrupo[partidoIndex])
            Object.keys(prediccionesGrupo).forEach(partidoIndexStr => {
                const partidoIndex = parseInt(partidoIndexStr);
                if (!isNaN(partidoIndex) && partidoIndex >= 0) {
                    const prediccion = prediccionesGrupo[partidoIndex];
                    if (prediccion && (prediccion.golesLocal !== '' || prediccion.golesVisitante !== '' || prediccion.golesLocal === 0 || prediccion.golesVisitante === 0)) {
                        if (!resultados[grupoIndex].partidos[partidoIndex]) {
                            resultados[grupoIndex].partidos[partidoIndex] = {
                                golesLocal: '',
                                golesVisitante: ''
                            };
                        }
                        resultados[grupoIndex].partidos[partidoIndex].golesLocal = prediccion.golesLocal !== undefined && prediccion.golesLocal !== null ? String(prediccion.golesLocal) : '';
                        resultados[grupoIndex].partidos[partidoIndex].golesVisitante = prediccion.golesVisitante !== undefined && prediccion.golesVisitante !== null ? String(prediccion.golesVisitante) : '';
                    }
                }
            });
            
            // Cargar posiciones si existen
            if (prediccionesGrupo.posiciones && Array.isArray(prediccionesGrupo.posiciones)) {
                resultados[grupoIndex].posiciones = prediccionesGrupo.posiciones;
            }
            
            // Cargar selecciones de playoff si existen
            if (prediccionesGrupo.playoffSelecciones) {
                resultados[grupoIndex].playoffSelecciones = prediccionesGrupo.playoffSelecciones;
            }
        } else {
            // Es una fase de eliminatorias
            const prediccionesEliminatoria = predicciones[key];
            if (prediccionesEliminatoria) {
                if (!resultados[key]) {
                    resultados[key] = {};
                }
                
                // Cargar partidos de eliminatorias
                Object.keys(prediccionesEliminatoria).forEach(partidoIndexStr => {
                    const partidoIndex = parseInt(partidoIndexStr);
                    if (!isNaN(partidoIndex)) {
                        const partido = prediccionesEliminatoria[partidoIndex];
                        if (partido && (partido.golesLocal !== '' || partido.golesVisitante !== '')) {
                            if (!resultados[key][partidoIndex]) {
                                resultados[key][partidoIndex] = {
                                    golesLocal: '',
                                    golesVisitante: ''
                                };
                            }
                            resultados[key][partidoIndex].golesLocal = partido.golesLocal || '';
                            resultados[key][partidoIndex].golesVisitante = partido.golesVisitante || '';
                        }
                    }
                });
            }
        }
    });
    
    // Guardar resultados en localStorage
    if (typeof guardarResultados === 'function') {
        guardarResultados();
    }
    
    // Cambiar a la pestaña de Grupos
    const tabGrupos = document.querySelector('.tab-btn[data-tab="grupos"]');
    if (tabGrupos) {
        tabGrupos.click();
    }
    
    // Renderizar grupos con las predicciones cargadas
    if (typeof renderizarGrupos === 'function') {
        renderizarGrupos();
    }
    
    // Actualizar eliminatorias
    if (typeof actualizarEliminatorias === 'function') {
        actualizarEliminatorias();
    }
    
    // Mostrar mensaje de confirmación
    if (typeof mostrarModal === 'function') {
        mostrarModal({
            titulo: typeof t === 'function' ? t('prediccionCargada') : 'Predicción Cargada',
            mensaje: typeof t === 'function' ? t('prediccionesCargadasCorrectamente') : 'Las predicciones se han cargado correctamente en la página principal.',
            cancelar: false
        });
    }
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
        // Si no hay predicción o el valor es vacío/null/undefined, usar "0" como valor por defecto
        // IMPORTANTE: "0" es el valor por defecto cuando no hay predicción
        const predGolesLocal = prediccion && (prediccion.golesLocal === 0 || prediccion.golesLocal === '0' || (prediccion.golesLocal !== '' && prediccion.golesLocal !== null && prediccion.golesLocal !== undefined))
            ? String(prediccion.golesLocal)
            : '0';
        const predGolesVisitante = prediccion && (prediccion.golesVisitante === 0 || prediccion.golesVisitante === '0' || (prediccion.golesVisitante !== '' && prediccion.golesVisitante !== null && prediccion.golesVisitante !== undefined))
            ? String(prediccion.golesVisitante)
            : '0';
        
        // Resultado real (si existe)
        // Para resultados reales, si no existe, mostrar "-" (no "0")
        const realGolesLocal = resultadoReal && (resultadoReal.golesLocal === 0 || resultadoReal.golesLocal === '0' || (resultadoReal.golesLocal !== '' && resultadoReal.golesLocal !== null && resultadoReal.golesLocal !== undefined))
            ? String(resultadoReal.golesLocal)
            : '';
        const realGolesVisitante = resultadoReal && (resultadoReal.golesVisitante === 0 || resultadoReal.golesVisitante === '0' || (resultadoReal.golesVisitante !== '' && resultadoReal.golesVisitante !== null && resultadoReal.golesVisitante !== undefined))
            ? String(resultadoReal.golesVisitante)
            : '';
        
        const tieneResultadoReal = resultadoReal && (realGolesLocal !== '' || realGolesVisitante !== '');
        
        // Calcular puntos si hay resultado real
        let puntos = 0;
        let clasePuntos = '';
        // Solo calcular puntos si hay predicción válida (no vacía)
        // Una predicción es válida si ambos valores están presentes (incluso si son "0")
        const tienePrediccionValida = prediccion && predGolesLocal !== '' && predGolesVisitante !== '';
        if (tieneResultadoReal && tienePrediccionValida) {
            const predLocal = predGolesLocal !== '' ? parseInt(predGolesLocal) : null;
            const predVisitante = predGolesVisitante !== '' ? parseInt(predGolesVisitante) : null;
            const realLocal = realGolesLocal !== '' ? parseInt(realGolesLocal) : 0;
            const realVisitante = realGolesVisitante !== '' ? parseInt(realGolesVisitante) : 0;
            
            // Si no hay predicción completa, no calcular puntos
            // Nota: predLocal y predVisitante pueden ser 0 (cero válido) o null (sin valor)
            if (predLocal !== null && predVisitante !== null) {
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
                            <input type="text" value="${predGolesLocal}" readonly class="input-solo-lectura input-prediccion">
                            <span class="separador">-</span>
                            <input type="text" value="${predGolesVisitante}" readonly class="input-solo-lectura input-prediccion">
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

// Función para mostrar lista de torneos disponibles
async function mostrarListaTorneos() {
    return new Promise(async (resolve) => {
        // Cargar torneos desde Supabase
        let todosLosTorneos = {};
        
        if (usarSupabase() && typeof obtenerTorneosSupabase === 'function') {
            const torneosSupabase = await obtenerTorneosSupabase();
            if (torneosSupabase) {
                todosLosTorneos = torneosSupabase;
            }
        }
        
        // También incluir torneos locales si existen
        if (torneos && typeof torneos === 'object') {
            Object.assign(todosLosTorneos, torneos);
        }
        
        // Convertir a array y separar en privados y abiertos
        const todosLosTorneosArray = Object.entries(todosLosTorneos).map(([codigo, datos]) => {
            // Determinar si es privado:
            // - Si esPrivado está explícitamente en false, es abierto (sin importar si tiene clave)
            // - Si esPrivado está explícitamente en true, es privado
            // - Si tiene clave definida, es privado
            // - Si esPrivado no está definido (undefined o null), considerar privado por defecto (torneos antiguos)
            const tieneClave = datos.clave && datos.clave.trim() !== '';
            const esAbiertoExplicito = datos.esPrivado === false;
            const esPrivadoExplicito = datos.esPrivado === true;
            
            // Un torneo es abierto SOLO si esPrivado está explícitamente en false
            // Si esPrivado es false, no importa si tiene clave, es abierto
            const esPrivado = esAbiertoExplicito ? false : (esPrivadoExplicito || tieneClave || datos.esPrivado === undefined);
            
            return {
                codigo,
                nombre: datos.nombre || `Torneo ${codigo}`,
                creadoPor: datos.creadoPor || 'Desconocido',
                fechaCreacion: datos.fechaCreacion || 0,
                participantes: datos.participantes ? datos.participantes.length : 0,
                esPrivado: esPrivado,
                clave: datos.clave || null
            };
        });
        
        // Separar en privados y abiertos
        // Un torneo es abierto si esPrivado está explícitamente en false Y no tiene clave
        const torneosAbiertos = todosLosTorneosArray.filter(t => !t.esPrivado)
            .sort((a, b) => b.participantes - a.participantes); // Ordenar por participantes descendente
        const torneosPrivados = todosLosTorneosArray.filter(t => t.esPrivado)
            .sort((a, b) => a.nombre.localeCompare(b.nombre)); // Ordenar alfabéticamente
        
        if (torneosAbiertos.length === 0 && torneosPrivados.length === 0) {
            await mostrarModal({
                titulo: 'Sin Torneos',
                mensaje: 'No hay torneos disponibles en este momento.',
                cancelar: false
            });
            resolve(false);
            return;
        }
        
        // Crear overlay y modal
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;';
        
        const modal = document.createElement('div');
        modal.className = 'modal-torneos-lista';
        modal.style.cssText = 'background: white; border-radius: 8px; padding: 0; max-width: 1000px; width: 95%; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
        
        const renderizarTorneos = (listaTorneos, esPrivado = false) => {
            if (listaTorneos.length === 0) {
                return `<p style="color: #999; text-align: center; padding: 20px;">${typeof t === 'function' ? t('noHayTorneos') : 'No hay torneos en esta categoría'}</p>`;
            }
            return listaTorneos.map(torneo => `
                <div class="torneo-item-lista" data-codigo="${torneo.codigo}" style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s; background: #f9fafb; margin-bottom: 8px;">
                    <h3 style="margin: 0 0 6px 0; color: #1e3a8a; font-size: 1em; font-weight: 600;">${torneo.nombre}</h3>
                    <p style="margin: 3px 0; color: #666; font-size: 0.85em;">${typeof t === 'function' ? t('creadoPor') : 'Creado por'}: <strong>${torneo.creadoPor || (typeof t === 'function' ? t('desconocido') : 'Desconocido')}</strong></p>
                    <p style="margin: 3px 0; color: #666; font-size: 0.85em;">👥 ${typeof t === 'function' ? t('participantes') : 'Participantes'}: <strong>${torneo.participantes}</strong></p>
                </div>
            `).join('');
        };
        
        modal.innerHTML = `
            <div style="background: #1e3a8a; color: white; padding: 20px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 1.5em;">${typeof t === 'function' ? t('seleccionarTorneo') : 'Seleccionar Torneo'}</h2>
                <button id="cerrar-lista-torneos" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">&times;</button>
            </div>
            <div style="padding: 20px; display: flex; flex-direction: column; flex: 1; overflow: hidden;">
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <input type="text" id="buscador-torneos" placeholder="${typeof t === 'function' ? t('buscarTorneo') : '🔍 Buscar torneo por nombre o código...'}" style="flex: 1; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1em; box-sizing: border-box;">
                    <button id="btn-crear-torneo-modal" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 1em; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s;">
                        ${typeof t === 'function' ? t('crearTorneo') : '➕ Crear Torneo'}
                    </button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; overflow-y: auto; flex: 1;">
                    <div>
                        <h3 style="margin: 0 0 15px 0; color: #1e3a8a; font-size: 1.2em; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px;">
                            ${typeof t === 'function' ? t('torneosAbiertos') : '🌍 Torneos Abiertos'}
                            <span style="font-size: 0.8em; color: #666; font-weight: normal;">(${torneosAbiertos.length})</span>
                        </h3>
                        <div id="lista-abiertos" style="max-height: calc(85vh - 250px); overflow-y: auto;">
                            ${renderizarTorneos(torneosAbiertos, false)}
                        </div>
                    </div>
                    <div>
                        <h3 style="margin: 0 0 15px 0; color: #1e3a8a; font-size: 1.2em; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px;">
                            ${typeof t === 'function' ? t('torneosPrivados') : '🔒 Torneos de Amigos'}
                            <span style="font-size: 0.8em; color: #666; font-weight: normal;">(${torneosPrivados.length})</span>
                        </h3>
                        <div id="lista-privados" style="max-height: calc(85vh - 250px); overflow-y: auto;">
                            ${renderizarTorneos(torneosPrivados, true)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Guardar todas las listas para el buscador
        const todasLasListas = [...torneosAbiertos, ...torneosPrivados];
        
        // Función de búsqueda
        const buscador = document.getElementById('buscador-torneos');
        const listaAbiertos = document.getElementById('lista-abiertos');
        const listaPrivados = document.getElementById('lista-privados');
        
        const filtrarTorneos = (termino) => {
            const terminoLower = termino.toLowerCase().trim();
            
            if (!terminoLower) {
                // Sin filtro, mostrar todos
                listaAbiertos.innerHTML = renderizarTorneos(torneosAbiertos, false);
                listaPrivados.innerHTML = renderizarTorneos(torneosPrivados, true);
            } else {
                // Filtrar
                const abiertosFiltrados = torneosAbiertos.filter(t => 
                    t.nombre.toLowerCase().includes(terminoLower) || 
                    t.codigo.includes(terminoLower) ||
                    t.creadoPor.toLowerCase().includes(terminoLower)
                );
                const privadosFiltrados = torneosPrivados.filter(t => 
                    t.nombre.toLowerCase().includes(terminoLower) || 
                    t.codigo.includes(terminoLower) ||
                    t.creadoPor.toLowerCase().includes(terminoLower)
                );
                
                listaAbiertos.innerHTML = renderizarTorneos(abiertosFiltrados, false);
                listaPrivados.innerHTML = renderizarTorneos(privadosFiltrados, true);
            }
            
            // Reconfigurar event listeners para los nuevos elementos
            configurarEventListenersTorneos();
        };
        
        buscador.addEventListener('input', (e) => {
            filtrarTorneos(e.target.value);
        });
        
        // Event listeners para cerrar
        const cerrarBtn = document.getElementById('cerrar-lista-torneos');
        const cerrar = () => {
            document.body.removeChild(overlay);
            resolve(false);
        };
        
        cerrarBtn.addEventListener('click', cerrar);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cerrar();
            }
        });
        
        // Event listener para crear torneo
        const btnCrearTorneo = document.getElementById('btn-crear-torneo-modal');
        btnCrearTorneo.addEventListener('click', () => {
            // Cerrar este modal primero
            document.body.removeChild(overlay);
            // Resolver con un objeto especial que indique que se quiere crear uno nuevo
            // Usaremos un objeto con una propiedad especial para diferenciarlo
            resolve({ crearNuevo: true });
        });
        
        // Función para configurar event listeners de los torneos
        const configurarEventListenersTorneos = () => {
            const itemsTorneos = modal.querySelectorAll('.torneo-item-lista');
            
            itemsTorneos.forEach(item => {
                // Remover listeners anteriores si existen
                const nuevoItem = item.cloneNode(true);
                item.parentNode.replaceChild(nuevoItem, item);
                
                nuevoItem.addEventListener('click', () => {
                    const codigo = nuevoItem.dataset.codigo;
                    const torneo = todasLasListas.find(t => t.codigo === codigo);
                    document.body.removeChild(overlay);
                    resolve(torneo);
                });
                
                // Efecto hover
                nuevoItem.addEventListener('mouseenter', () => {
                    nuevoItem.style.borderColor = '#1e3a8a';
                    nuevoItem.style.background = '#eff6ff';
                    nuevoItem.style.transform = 'translateY(-2px)';
                    nuevoItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                });
                
                nuevoItem.addEventListener('mouseleave', () => {
                    nuevoItem.style.borderColor = '#e5e7eb';
                    nuevoItem.style.background = '#f9fafb';
                    nuevoItem.style.transform = 'translateY(0)';
                    nuevoItem.style.boxShadow = 'none';
                });
            });
        };
        
        // Configurar listeners iniciales
        configurarEventListenersTorneos();
        
        // Focus en el buscador
        setTimeout(() => buscador.focus(), 100);
    });
}

// Función para mostrar diálogo de envío de predicciones
async function mostrarDialogoEnviarPredicciones() {
    // PRIMERO: Verificar si el usuario está logueado
    let usuarioLogueado = false;
    if (typeof obtenerUsuarioActual === 'function') {
        const usuario = obtenerUsuarioActual();
        usuarioLogueado = usuario !== null && usuario !== undefined;
    }
    
    // Si no está logueado, mostrar modal de autenticación
    if (!usuarioLogueado) {
        const opcionAuth = await mostrarModal({
            titulo: 'Autenticación Requerida',
            mensaje: 'Para enviar predicciones necesitas estar logueado.\n\n¿Qué deseas hacer?',
            cancelar: true,
            okTexto: 'Iniciar Sesión',
            cancelarTexto: 'Registrarse'
        });
        
        if (opcionAuth === false) {
            // Usuario eligió "Registrarse"
            if (typeof mostrarDialogoRegistro === 'function') {
                const registroExitoso = await mostrarDialogoRegistro();
                if (!registroExitoso) {
                    // Si el registro fue cancelado o falló, no continuar
                    return;
                }
                // Actualizar estado de autenticación
                if (typeof renderizarEstadoAuth === 'function') {
                    renderizarEstadoAuth();
                }
            } else {
                await mostrarModal({
                    titulo: 'Error',
                    mensaje: 'No se pudo mostrar el diálogo de registro',
                    cancelar: false
                });
                return;
            }
        } else if (opcionAuth === null) {
            // Usuario canceló
            return;
        } else {
            // Usuario eligió "Iniciar Sesión"
            if (typeof mostrarDialogoLogin === 'function') {
                const loginExitoso = await mostrarDialogoLogin();
                if (!loginExitoso) {
                    // Si el login fue cancelado o falló, no continuar
                    return;
                }
                // Actualizar estado de autenticación
                if (typeof renderizarEstadoAuth === 'function') {
                    renderizarEstadoAuth();
                }
            } else {
                await mostrarModal({
                    titulo: 'Error',
                    mensaje: 'No se pudo mostrar el diálogo de login',
                    cancelar: false
                });
                return;
            }
        }
        
        // Verificar nuevamente que ahora esté logueado
        if (typeof obtenerUsuarioActual === 'function') {
            const usuario = obtenerUsuarioActual();
            usuarioLogueado = usuario !== null && usuario !== undefined;
        }
        
        if (!usuarioLogueado) {
            // Si aún no está logueado, no continuar
            return;
        }
    }
    
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
    
    // Ir directamente a la lista de torneos (que tiene el botón de crear torneo)
    const torneoSeleccionado = await mostrarListaTorneos();
    
    if (!torneoSeleccionado || torneoSeleccionado === false) {
        return; // Usuario canceló
    }
    
    // Si el resultado tiene la propiedad crearNuevo, significa que se quiere crear un nuevo torneo
    let crearNuevo = null;
    if (torneoSeleccionado && torneoSeleccionado.crearNuevo === true) {
        // Cambiar a modo crear y continuar con el flujo de creación
        crearNuevo = true;
    } else {
        crearNuevo = false;
        // Continuar con el flujo de unirse a torneo existente
            let codigoLimpio = '';
            
            if (torneoSeleccionado.esPrivado) {
            // Torneo Privado - Solo pedir contraseña (sin código)
            const claveIngresada = await mostrarModal({
                titulo: typeof t === 'function' ? t('torneoPrivado') : 'Torneo Privado',
                mensaje: `${typeof t === 'function' ? t('ingresarContraseñaTorneo') : 'Este es un torneo privado.\n\nIngresa la contraseña del torneo'} "${torneoSeleccionado.nombre}":`,
                input: true,
                inputType: 'password',
                placeholder: typeof t === 'function' ? t('contraseña') : 'Contraseña',
                maxLength: 50,
                cancelar: true
            });
            
            if (!claveIngresada || claveIngresada === false) return;
            
            // Verificar contraseña
            if (claveIngresada.trim() !== torneoSeleccionado.clave) {
                await mostrarModal({
                    titulo: typeof t === 'function' ? t('contraseñaIncorrecta') : 'Contraseña Incorrecta',
                    mensaje: typeof t === 'function' ? t('contraseñaNoCorrecta') : 'La contraseña ingresada no es correcta.',
                    cancelar: false
                });
                return;
            }
            
            codigoLimpio = torneoSeleccionado.codigo;
        } else {
            // Torneo Abierto - Unirse directamente sin pedir código ni contraseña
            codigoLimpio = torneoSeleccionado.codigo;
        }
        
        // Verificar si el torneo existe
        const torneo = await obtenerTorneoPorCodigoSupabase(codigoLimpio);
        if (!torneo && !torneos[codigoLimpio]) {
            await mostrarModal({
                titulo: typeof t === 'function' ? t('error') : 'Error',
                mensaje: typeof t === 'function' ? t('noSeEncontroTorneoCodigo') : 'No se encontró un torneo con ese código',
                cancelar: false
            });
            return;
        }
        
        // Verificar si ya tiene una predicción en este torneo ANTES de pedir el nick
        const yaTienePrediccion = await usuarioYaTienePrediccion(codigoLimpio);
        let nombreParaTorneo = '';
        
        if (yaTienePrediccion) {
            const fechaActual = new Date();
            const FECHA_LIMITE_MODIFICACION = new Date('2026-06-08T00:00:00'); // 8 de junio a las 00:00 = después del 7
            
            // Si estamos después del 7 de junio, no permitir actualizar
            if (fechaActual >= FECHA_LIMITE_MODIFICACION) {
                await mostrarModal({
                    titulo: typeof t === 'function' ? t('yaParticipaste') : 'Ya Participaste',
                    mensaje: typeof t === 'function' ? t('yaHasEnviadoPrediccion') : 'Ya has enviado una predicción para este torneo. Las predicciones no se pueden modificar después del 7 de junio.',
                    cancelar: false
                });
                return;
            }
            
            // Si estamos antes del 8 de junio, obtener el nombre existente del participante
            const usuarioId = obtenerIdUsuarioUnico();
            let participanteExistente = null;
            
            // Buscar en torneos locales
            if (torneos[codigoLimpio]) {
                participanteExistente = torneos[codigoLimpio].participantes.find(p => {
                    if (p.usuarioId && p.usuarioId === usuarioId) return true;
                    if (typeof obtenerUsuarioActual === 'function') {
                        const usuario = obtenerUsuarioActual();
                        if (usuario && usuario.nombreUsuario && p.nombre === usuario.nombreUsuario) return true;
                    }
                    return false;
                });
            }
            
            // Si no se encuentra localmente, buscar en Supabase
            if (!participanteExistente && usarSupabase() && typeof obtenerParticipantesSupabase === 'function') {
                const participantes = await obtenerParticipantesSupabase(codigoLimpio);
                if (participantes) {
                    participanteExistente = participantes.find(p => {
                        if (p.usuarioId && p.usuarioId === usuarioId) return true;
                        if (typeof obtenerUsuarioActual === 'function') {
                            const usuario = obtenerUsuarioActual();
                            if (usuario && usuario.nombreUsuario && p.nombre === usuario.nombreUsuario) return true;
                        }
                        return false;
                    });
                }
            }
            
            // Usar el nombre existente del participante
            if (participanteExistente && participanteExistente.nombre) {
                nombreParaTorneo = participanteExistente.nombre;
            } else {
                // Si no se encuentra, usar el nombre del usuario logueado o el guardado
                const usuarioLogueado = typeof obtenerUsuarioActual === 'function' ? obtenerUsuarioActual() : null;
                nombreParaTorneo = usuarioLogueado ? usuarioLogueado.nombreUsuario : miNombre;
            }
        } else {
            // Si no tiene predicción, pedir nombre/nick para este torneo
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
        
        const esActualizacion = resultado && resultado.mensaje && resultado.mensaje.includes('actualizada');
        const titulo = esActualizacion ? '¡Predicción Actualizada!' : '¡Predicciones Enviadas!';
        let mensaje = esActualizacion 
            ? `Tu predicción ha sido actualizada correctamente en el torneo ${codigoLimpio}`
            : `Te has unido al torneo ${codigoLimpio} como "${miNombre}"`;
        
        // Si hubo error en Supabase, agregarlo al mensaje
        if (resultado && resultado.errorSupabase) {
            mensaje += `\n\n⚠️ ${resultado.errorSupabase}`;
        }
        
        await mostrarModal({
            titulo: titulo,
            mensaje: mensaje,
            cancelar: false
        });
        
            if (typeof renderizarTorneo === 'function') {
                await renderizarTorneo();
            }
            return;
        }
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
        
        // Crear nuevo torneo
        let nombreTorneo = '';
        let nombreValido = false;
        
        while (!nombreValido) {
            nombreTorneo = await mostrarModal({
                titulo: typeof t === 'function' ? t('crearTorneo') : 'Crear Torneo',
                mensaje: typeof t === 'function' ? t('ingresarNombreTorneo') : 'Ingresa un nombre para el torneo:',
                input: true,
                placeholder: typeof t === 'function' ? t('nombreTorneo') + ' (obligatorio)' : 'Nombre del torneo (obligatorio)',
                maxLength: 30,
                cancelar: true
            });
            
            if (nombreTorneo === false) return;
            
            // Validar que el nombre no esté vacío
            if (!nombreTorneo || nombreTorneo.trim() === '') {
                await mostrarModal({
                    titulo: typeof t === 'function' ? t('nombreRequerido') : 'Nombre Requerido',
                    mensaje: typeof t === 'function' ? t('nombreTorneoObligatorio') : 'El nombre del torneo es obligatorio. Por favor ingresa un nombre.',
                    cancelar: false
                });
                nombreValido = false;
            } else {
                nombreValido = true;
            }
        }
        
        nombreTorneo = nombreTorneo.trim();
        
        // Preguntar si es privado o abierto
        const tipoTorneo = await mostrarModal({
            titulo: typeof t === 'function' ? t('tipoTorneo') : 'Tipo de Torneo',
            mensaje: typeof t === 'function' ? t('queTipoTorneo') : '¿Qué tipo de torneo quieres crear?',
            cancelar: true,
            okTexto: typeof t === 'function' ? t('torneoAbierto') : 'Torneo Abierto',
            cancelarTexto: typeof t === 'function' ? t('torneoPrivado') : 'Torneo Privado'
        });
        
        if (tipoTorneo === null) return; // Usuario canceló
        
        const esPrivado = tipoTorneo === false; // Si eligió "Torneo Privado" (cancelar)
        let clave = null;
        
        // Si es privado, pedir contraseña
        if (esPrivado) {
            let claveValida = false;
            while (!claveValida) {
                const clave1 = await mostrarModal({
                    titulo: typeof t === 'function' ? t('contraseñaTorneo') : 'Contraseña del Torneo',
                    mensaje: typeof t === 'function' ? t('ingresarContraseñaTorneo') : 'Ingresa una contraseña para el torneo privado:',
                    input: true,
                    inputType: 'password',
                    placeholder: 'Contraseña',
                    maxLength: 50,
                    cancelar: true
                });
                
                if (clave1 === false || clave1 === null) return;
                
                if (!clave1 || clave1.trim() === '') {
                    await mostrarModal({
                        titulo: typeof t === 'function' ? t('contraseñaRequerida') : 'Contraseña Requerida',
                        mensaje: typeof t === 'function' ? t('debesIngresarContraseña') : 'Debes ingresar una contraseña para el torneo privado.',
                        cancelar: false
                    });
                    continue;
                }
                
                const clave2 = await mostrarModal({
                    titulo: typeof t === 'function' ? t('confirmarContraseña') : 'Confirmar Contraseña',
                    mensaje: typeof t === 'function' ? t('confirmarContraseña') : 'Confirma la contraseña:',
                    input: true,
                    inputType: 'password',
                    placeholder: typeof t === 'function' ? t('repetirContraseña') : 'Repetir contraseña',
                    maxLength: 50,
                    cancelar: true
                });
                
                if (clave2 === false || clave2 === null) return;
                
                if (clave1.trim() !== clave2.trim()) {
                    await mostrarModal({
                        titulo: typeof t === 'function' ? t('contraseñasNoCoincidenTitulo') : 'Contraseñas No Coinciden',
                        mensaje: typeof t === 'function' ? t('contraseñasNoCoincidenIntenta') : 'Las contraseñas no coinciden. Intenta nuevamente.',
                        cancelar: false
                    });
                    continue;
                }
                
                clave = clave1.trim();
                claveValida = true;
            }
        }
        
        // Asegurar que torneos existe antes de crear
        if (!torneos || typeof torneos !== 'object') {
            torneos = {};
        }
        
        const codigo = await crearTorneo(nombreTorneo, miNombre, esPrivado, clave);
        const resultado = await enviarPredicciones(codigo, miNombre, predicciones);
        
        if (resultado && !resultado.exito) {
            await mostrarModal({
                titulo: 'Error',
                mensaje: resultado.mensaje || 'No se pudieron enviar las predicciones',
                cancelar: false
            });
            return;
        }
        
        let mensajeTorneo = '';
        if (esPrivado) {
            mensajeTorneo = `${typeof t === 'function' ? t('torneoPrivadoCreado') : '¡Torneo privado creado exitosamente!'}\n\n${typeof t === 'function' ? t('contraseñaTorneo') : 'Contraseña del torneo'}: ${clave}\n\n${typeof t === 'function' ? t('compartirContraseña') : 'Comparte esta contraseña con tus amigos para que se unan.'}`;
        } else {
            mensajeTorneo = `${typeof t === 'function' ? t('torneoCreadoExitosamente') : '¡Torneo creado exitosamente!'}\n\n${typeof t === 'function' ? t('codigoTorneo') : 'Código del torneo'}: ${codigo}\n\n${typeof t === 'function' ? t('compartirCodigo') : 'Comparte este código con tus amigos para que se unan.'}`;
        }
        
        // Si hubo error en Supabase, agregarlo al mensaje
        if (resultado && resultado.errorSupabase) {
            mensajeTorneo += `\n\n⚠️ ${resultado.errorSupabase}`;
        }
        
        await mostrarModal({
            titulo: typeof t === 'function' ? t('torneoCreado') : '¡Torneo Creado!',
            mensaje: mensajeTorneo,
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
