// Inicialización
document.addEventListener('DOMContentLoaded', () => {
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

    GRUPOS_MUNDIAL_2026.forEach((grupo, grupoIndex) => {
        const grupoDiv = document.createElement('div');
        grupoDiv.className = 'grupo';
        
        grupoDiv.innerHTML = `
            <h3>${grupo.nombre}</h3>
            ${renderizarTablaPosiciones(grupo, grupoIndex)}
            <div class="partidos">
                <h4 style="margin-bottom: 10px; color: #666;">Partidos</h4>
                ${renderizarPartidos(grupo, grupoIndex)}
            </div>
        `;
        
        container.appendChild(grupoDiv);
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
            
            guardarResultados();
            renderizarGrupos();
            actualizarEliminatorias();
        });
    });
}

// Obtener nombre real del equipo (considerando selección de playoff)
function obtenerNombreEquipo(grupo, grupoIndex, equipoIndex) {
    const equipo = grupo.equipos[equipoIndex];
    if (PLAYOFFS_OPCIONES[equipo]) {
        const seleccion = resultados[grupoIndex]?.playoffSelecciones?.[equipoIndex] || '';
        return seleccion || equipo;
    }
    return equipo;
}

// Renderizar tabla de posiciones
function renderizarTablaPosiciones(grupo, grupoIndex) {
    const posiciones = calcularPosiciones(grupo, grupoIndex);
    
    let html = '<table class="tabla-posiciones"><thead><tr>';
    html += '<th>Pos</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th>';
    html += '</tr></thead><tbody>';
    
    posiciones.forEach((pos, index) => {
        const clasePos = index < 2 ? `pos-${index + 1}` : (index === 2 ? 'pos-3' : '');
        html += `<tr class="${clasePos}">`;
        html += `<td>${index + 1}</td>`;
        html += `<td>`;
        
        // Si es un playoff, mostrar select
        const equipoOriginal = grupo.equipos[pos.indice];
        if (PLAYOFFS_OPCIONES[equipoOriginal]) {
            const seleccion = resultados[grupoIndex]?.playoffSelecciones?.[pos.indice] || '';
            html += `<select class="playoff-select" data-grupo="${grupoIndex}" data-equipo="${pos.indice}">`;
            html += `<option value="">${equipoOriginal}</option>`;
            PLAYOFFS_OPCIONES[equipoOriginal].forEach(opcion => {
                html += `<option value="${opcion}" ${seleccion === opcion ? 'selected' : ''}>${opcion}</option>`;
            });
            html += `</select>`;
        } else {
            html += obtenerNombreEquipo(grupo, grupoIndex, pos.indice);
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
        // Si no hay resultado, usar "0" como valor por defecto
        const resultado = partidos[partidoIndex] || { golesLocal: '0', golesVisitante: '0' };
        // Si los valores están vacíos, usar "0" como valor por defecto
        if (resultado.golesLocal === '' || resultado.golesLocal === null || resultado.golesLocal === undefined) {
            resultado.golesLocal = '0';
        }
        if (resultado.golesVisitante === '' || resultado.golesVisitante === null || resultado.golesVisitante === undefined) {
            resultado.golesVisitante = '0';
        }
        const yaJugado = typeof partidoYaJugado === 'function' ? partidoYaJugado(grupoIndex, partidoIndex) : false;
        
        // Verificar si tiene predicción existente
        const tienePrediccion = resultado && (resultado.golesLocal !== '' || resultado.golesVisitante !== '');
        
        // Verificar si se puede modificar la predicción según las reglas de fecha
        const puedeModificar = typeof sePuedeModificarPrediccion === 'function' 
            ? sePuedeModificarPrediccion(grupoIndex, partidoIndex, tienePrediccion)
            : true;
        
        // En los partidos, solo mostrar el nombre del equipo (usando la selección si existe)
        const equipoLocal = obtenerNombreEquipo(grupo, grupoIndex, partido.local);
        const equipoVisitante = obtenerNombreEquipo(grupo, grupoIndex, partido.visitante);
        
        // Deshabilitar si ya se jugó O si no se puede modificar según las reglas de fecha
        const disabledAttr = (yaJugado || !puedeModificar) ? 'disabled readonly' : '';
        const readonlyClass = (yaJugado || !puedeModificar) ? 'partido-ya-jugado' : '';
        
        // Obtener fecha y horario del partido
        const fechaHorario = typeof obtenerFechaHorarioPartido === 'function' 
            ? obtenerFechaHorarioPartido(grupoIndex, partidoIndex)
            : { fecha: '', horario: '' };
        
        // Formatear fecha para mostrar
        let fechaFormateada = '';
        let diaSemana = '';
        if (fechaHorario.fecha) {
            const fechaObj = new Date(fechaHorario.fecha + 'T00:00:00');
            const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
            diaSemana = dias[fechaObj.getDay()];
            fechaFormateada = `${fechaObj.getDate()} ${meses[fechaObj.getMonth()]}`;
        }
        
        return `
            <div class="partido ${readonlyClass}">
                <div class="partido-fecha-horario">
                    ${fechaHorario.fecha ? `<span class="fecha-partido">${diaSemana} ${fechaFormateada}</span>` : ''}
                    ${fechaHorario.horario ? `<span class="horario-partido">${fechaHorario.horario}</span>` : ''}
                </div>
                <div class="partido-equipos-resultado">
                    <span class="equipo equipo-local">${equipoLocal}</span>
                    <div class="resultado-input">
                        <input type="number" min="0" max="20" 
                               value="${resultado.golesLocal}" 
                               data-grupo="${grupoIndex}" 
                               data-partido="${partidoIndex}" 
                               data-tipo="local"
                               placeholder="0"
                               ${disabledAttr}>
                        <span class="separador">-</span>
                        <input type="number" min="0" max="20" 
                               value="${resultado.golesVisitante}" 
                               data-grupo="${grupoIndex}" 
                               data-partido="${partidoIndex}" 
                               data-tipo="visitante"
                               placeholder="0"
                               ${disabledAttr}>
                    </div>
                    <span class="equipo equipo-visitante">${equipoVisitante}</span>
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
        resultados[grupoIndex].partidos[partidoIndex][tipo === 'local' ? 'golesLocal' : 'golesVisitante'] = e.target.value || '';
        
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

function mostrarInfoCiudad(ciudadKey) {
    const ciudad = obtenerInfoCiudad(ciudadKey);
    if (!ciudad) return;
    
    const modal = document.getElementById('modal-ciudad-overlay');
    const title = document.getElementById('modal-ciudad-title');
    const body = document.getElementById('modal-ciudad-body');
    
    title.textContent = `${ciudad.bandera} ${ciudad.nombre}, ${ciudad.pais}`;
    
    let html = `
        <div style="margin-bottom: 25px;">
            <h3 style="color: #1e3c72; margin-bottom: 15px; font-size: 1.3em;">🏙️ Información de la Ciudad</h3>
            <p style="line-height: 1.8; color: #475569; margin-bottom: 10px;">${ciudad.ciudadInfo.descripcion}</p>
            <p style="line-height: 1.8; color: #475569; margin-bottom: 5px;"><strong>Población:</strong> ${ciudad.ciudadInfo.poblacion}</p>
            <p style="line-height: 1.8; color: #475569;"><strong>Clima:</strong> ${ciudad.ciudadInfo.clima}</p>
        </div>
        
        <div style="margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h3 style="color: #1e3c72; margin-bottom: 15px; font-size: 1.3em;">🏟️ Estadio</h3>
            <h4 style="color: #2a5298; margin-bottom: 10px; font-size: 1.1em;">${ciudad.estadio.nombre}</h4>
            <p style="line-height: 1.8; color: #475569; margin-bottom: 8px;"><strong>Capacidad:</strong> ${ciudad.estadio.capacidad}</p>
            <p style="line-height: 1.8; color: #475569; margin-bottom: 8px;"><strong>Inauguración:</strong> ${ciudad.estadio.inauguracion}</p>
            <p style="line-height: 1.8; color: #475569; margin-bottom: 8px;"><strong>Características:</strong> ${ciudad.estadio.caracteristicas}</p>
            <p style="line-height: 1.8; color: #475569;"><strong>Dirección:</strong> ${ciudad.estadio.direccion}</p>
        </div>
        
        <div>
            <h3 style="color: #1e3c72; margin-bottom: 15px; font-size: 1.3em;">⚽ Partidos Programados</h3>
            <div style="display: grid; gap: 12px;">
    `;
    
    ciudad.partidos.forEach(partido => {
        const fechaFormateada = formatearFecha(partido.fecha);
        html += `
            <div style="padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 5px;">
                <p style="margin: 0; color: #1565c0; font-weight: 600; margin-bottom: 5px;">${fechaFormateada}</p>
                <p style="margin: 0; color: #475569;"><strong>${partido.fase}:</strong> ${partido.descripcion}</p>
            </div>
        `;
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

// Configurar botones
function configurarBotones() {
    // El botón reset-btn ya no existe en el HTML (está en el menú de usuario)
    // Este código se mantiene por compatibilidad pero el botón ya no existe
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres resetear todas las predicciones?')) {
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
            grupo: grupo.nombre,
            equipo: obtenerNombreEquipo(grupo, grupoIndex, posiciones[0].indice),
            datos: posiciones[0]
        });
        clasificados.segundos.push({
            grupo: grupo.nombre,
            equipo: obtenerNombreEquipo(grupo, grupoIndex, posiciones[1].indice),
            datos: posiciones[1]
        });
        clasificados.terceros.push({
            grupo: grupo.nombre,
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
        const primero = clasificados.primeros[i] || { equipo: 'Por definir', grupo: '', datos: {} };
        const segundo = clasificados.segundos[i] || { equipo: 'Por definir', grupo: '', datos: {} };
        partidos.push({
            local: { ...primero, posicion: '1º' },
            visitante: { ...segundo, posicion: '2º' }
        });
    }
    
    // Segunda mitad: primeros restantes vs mejores terceros (8 partidos)
    for (let i = 0; i < 8; i++) {
        const primerIndex = (i + 4) % 12;
        const primero = clasificados.primeros[primerIndex] || mejoresTerceros[i] || { equipo: 'Por definir', grupo: '', datos: {} };
        const tercero = mejoresTerceros[i] || clasificados.segundos[primerIndex] || { equipo: 'Por definir', grupo: '', datos: {} };
        partidos.push({
            local: { ...primero, posicion: primero.grupo ? '1º' : (tercero.grupo ? '3º' : '') },
            visitante: { ...tercero, posicion: tercero.grupo ? '3º' : (primero.grupo ? '1º' : '') }
        });
    }
    
    // Asegurar que siempre haya 16 partidos
    while (partidos.length < 16) {
        partidos.push({
            local: { equipo: 'Por definir', grupo: '', datos: {}, posicion: '' },
            visitante: { equipo: 'Por definir', grupo: '', datos: {}, posicion: '' }
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
            local: ganadores[i] || { equipo: 'Por definir', grupo: '', datos: {}, posicion: '' },
            visitante: ganadores[i + 1] || { equipo: 'Por definir', grupo: '', datos: {}, posicion: '' }
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
            local: ganadores[i] || { equipo: 'Por definir', grupo: '', datos: {}, posicion: '' },
            visitante: ganadores[i + 1] || { equipo: 'Por definir', grupo: '', datos: {}, posicion: '' }
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
            local: ganadores[i] || { equipo: 'Por definir', grupo: '', datos: {}, posicion: '' },
            visitante: ganadores[i + 1] || { equipo: 'Por definir', grupo: '', datos: {}, posicion: '' }
        });
    }
}

// Actualizar final
function actualizarFinal() {
    const ganadores = obtenerGanadores('semis', partidosSemis);
    
    partidoFinal = {
        local: ganadores[0] || { equipo: 'Por definir', grupo: '', datos: {}, posicion: '' },
        visitante: ganadores[1] || { equipo: 'Por definir', grupo: '', datos: {}, posicion: '' }
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
        { text: 'Dieciseisavos', col: 1 },
        { text: 'Octavos', col: 2 },
        { text: 'Cuartos', col: 3 },
        { text: 'Semifinales', col: 4 },
        { text: 'Final', col: 5 },
        { text: 'Semifinales', col: 6 },
        { text: 'Cuartos', col: 7 },
        { text: 'Octavos', col: 8 },
        { text: 'Dieciseisavos', col: 9 }
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
        Array(16).fill(null).map(() => ({ local: { equipo: 'Por definir', grupo: '', posicion: '' }, visitante: { equipo: 'Por definir', grupo: '', posicion: '' } }));
    
    // Si hay menos de 16 partidos, completar con "Por definir"
    while (dieciseisavos.length < 16) {
        dieciseisavos.push({
            local: { equipo: 'Por definir', grupo: '', posicion: '' },
            visitante: { equipo: 'Por definir', grupo: '', posicion: '' }
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
    const equipoLocalNombre = partido.local?.equipo || 'Por definir';
    const equipoVisitanteNombre = partido.visitante?.equipo || 'Por definir';
    const esPorDefinirLocal = equipoLocalNombre === 'Por definir';
    const esPorDefinirVisitante = equipoVisitanteNombre === 'Por definir';
    
    // Obtener información de posición y grupo
    const localPosicion = partido.local?.posicion || '';
    const localGrupo = partido.local?.grupo || '';
    const visitantePosicion = partido.visitante?.posicion || '';
    const visitanteGrupo = partido.visitante?.grupo || '';
    
    // Formatear texto de posición y grupo
    const localInfo = (localPosicion && localGrupo) ? `${localPosicion} ${localGrupo}` : '';
    const visitanteInfo = (visitantePosicion && visitanteGrupo) ? `${visitantePosicion} ${visitanteGrupo}` : '';
    
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
    
    matchDiv.innerHTML = `
        <div class="bracket-team ${ganadorLocal ? 'ganador' : ''} ${esPorDefinirLocal ? 'por-definir' : ''} ${readonlyClass}">
            <div class="bracket-team-info">
                <span class="bracket-team-nombre">${equipoLocalNombre}</span>
                ${localInfo ? `<span class="bracket-team-posicion">${localInfo}</span>` : ''}
            </div>
            <div class="bracket-resultado">
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
        <div class="bracket-team ${ganadorVisitante ? 'ganador' : ''} ${esPorDefinirVisitante ? 'por-definir' : ''} ${readonlyClass}">
            <div class="bracket-team-info">
                <span class="bracket-team-nombre">${equipoVisitanteNombre}</span>
                ${visitanteInfo ? `<span class="bracket-team-posicion">${visitanteInfo}</span>` : ''}
            </div>
            <div class="bracket-resultado">
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
            ganadores.push({ equipo: 'Por definir', grupo: '', datos: {}, posicion: '' });
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
                        ganadores.push({ equipo: 'Por definir', grupo: '', datos: {}, posicion: '' });
                    }
                } else {
                    // Valores inválidos
                    ganadores.push({ equipo: 'Por definir', grupo: '', datos: {}, posicion: '' });
                }
            } else {
                // Ambos campos vacíos - no hay resultado aún
                ganadores.push({ equipo: 'Por definir', grupo: '', datos: {}, posicion: '' });
            }
        } else {
            // Sin resultado aún
            ganadores.push({ equipo: 'Por definir', grupo: '', datos: {}, posicion: '' });
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

