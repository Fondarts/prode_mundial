// Sistema de Torneo de Predicciones - Versión 2.0
// Sistema con múltiples torneos y códigos de acceso

let torneos = {}; // { codigo: { nombre: string, participantes: [], creadoPor: string, fechaCreacion: timestamp, resultadosReales: {} } }
let miNombre = localStorage.getItem('mundial2026_mi_nombre') || '';

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
        return false;
    }
    
    // Guardar en Supabase si está disponible
    if (usarSupabase() && typeof guardarParticipanteSupabase === 'function') {
        const exito = await guardarParticipanteSupabase(codigo, nombre, predicciones);
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
            puntos: 0
        };
        torneos[codigo].participantes.push(participante);
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
    
    return true;
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

// Sistema de modales personalizados
function mostrarModal(opciones) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const message = document.getElementById('modal-message');
        const input = document.getElementById('modal-input');
        const okBtn = document.getElementById('modal-ok');
        const cancelBtn = document.getElementById('modal-cancel');
        const closeBtn = document.getElementById('modal-close');
        
        title.textContent = opciones.titulo || 'Atención';
        message.textContent = opciones.mensaje || '';
        message.style.display = opciones.mensaje ? 'block' : 'none';
        
        // Configurar input si es necesario
        if (opciones.input) {
            input.style.display = 'block';
            input.type = opciones.inputType || 'text';
            input.placeholder = opciones.placeholder || '';
            input.value = opciones.valorInicial || '';
            input.maxLength = opciones.maxLength || null;
            if (opciones.maxLength) {
                input.setAttribute('maxlength', opciones.maxLength);
            }
        } else {
            input.style.display = 'none';
        }
        
        // Configurar botones
        okBtn.textContent = opciones.okTexto || 'OK';
        if (opciones.cancelar) {
            cancelBtn.style.display = 'inline-block';
            cancelBtn.textContent = opciones.cancelarTexto || 'Cancelar';
        } else {
            cancelBtn.style.display = 'none';
        }
        
        // Mostrar modal
        overlay.style.display = 'flex';
        if (opciones.input) {
            setTimeout(() => input.focus(), 100);
        }
        
        // Limpiar event listeners anteriores
        const nuevoOk = okBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(nuevoOk, okBtn);
        const nuevoCancel = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(nuevoCancel, cancelBtn);
        const nuevoClose = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(nuevoClose, closeBtn);
        
        // Nuevos event listeners
        document.getElementById('modal-ok').addEventListener('click', () => {
            const valor = opciones.input ? document.getElementById('modal-input').value : true;
            overlay.style.display = 'none';
            resolve(valor);
        });
        
        document.getElementById('modal-cancel').addEventListener('click', () => {
            overlay.style.display = 'none';
            resolve(false);
        });
        
        document.getElementById('modal-close').addEventListener('click', () => {
            overlay.style.display = 'none';
            resolve(false);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
                resolve(false);
            }
        });
        
        // Enter para confirmar
        if (opciones.input) {
            document.getElementById('modal-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('modal-ok').click();
                }
            });
        }
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
    
    // Pedir nombre
    const nombre = await mostrarModal({
        titulo: 'Enviar Predicciones',
        mensaje: 'Ingresa tu nombre para participar en el torneo:',
        input: true,
        placeholder: 'Tu nombre',
        maxLength: 30,
        cancelar: false
    });
    
    if (!nombre || nombre.trim() === '') {
        return;
    }
    
    miNombre = nombre.trim();
    localStorage.setItem('mundial2026_mi_nombre', miNombre);
    console.log('Nombre guardado:', miNombre);
    
    // Preguntar si crear o unirse
    const crearNuevo = await mostrarModal({
        titulo: 'Torneo',
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
        
        if (!codigo || codigo.length !== 6) {
            await mostrarModal({
                titulo: 'Error',
                mensaje: 'Código inválido. Debe tener 6 dígitos.',
                cancelar: false
            });
            return;
        }
        
        const resultado = await unirseATorneo(codigo, miNombre);
        if (resultado.exito) {
            await enviarPredicciones(codigo, miNombre, predicciones);
            await mostrarModal({
                titulo: '¡Éxito!',
                mensaje: '¡Te has unido al torneo exitosamente!',
                cancelar: false
            });
        } else {
            await mostrarModal({
                titulo: 'Error',
                mensaje: resultado.mensaje,
                cancelar: false
            });
            return;
        }
    } else if (crearNuevo) {
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
        await enviarPredicciones(codigo, miNombre, predicciones);
        
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
