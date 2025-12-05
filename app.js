// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    inicializarResultados();
    renderizarGrupos();
    configurarTabs();
    configurarBotones();
    actualizarEliminatorias();
});

// Renderizar grupos
function renderizarGrupos() {
    const container = document.getElementById('grupos-container');
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
        html += `<td>${grupo.equipos[pos.indice]}</td>`;
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
        const resultado = partidos[partidoIndex] || { golesLocal: '', golesVisitante: '' };
        const equipoLocal = grupo.equipos[partido.local];
        const equipoVisitante = grupo.equipos[partido.visitante];
        
        return `
            <div class="partido">
                <div class="equipo">${equipoLocal}</div>
                <div class="resultado-input">
                    <input type="number" min="0" max="20" 
                           value="${resultado.golesLocal}" 
                           data-grupo="${grupoIndex}" 
                           data-partido="${partidoIndex}" 
                           data-tipo="local"
                           placeholder="0">
                    <span class="separador">-</span>
                    <input type="number" min="0" max="20" 
                           value="${resultado.golesVisitante}" 
                           data-grupo="${grupoIndex}" 
                           data-partido="${partidoIndex}" 
                           data-tipo="visitante"
                           placeholder="0">
                </div>
                <div class="equipo">${equipoVisitante}</div>
            </div>
        `;
    }).join('');
}

// Event listeners para inputs de resultados
document.addEventListener('input', (e) => {
    // Para grupos
    if (e.target.hasAttribute('data-grupo')) {
        const grupoIndex = parseInt(e.target.getAttribute('data-grupo'));
        const partidoIndex = parseInt(e.target.getAttribute('data-partido'));
        const tipo = e.target.getAttribute('data-tipo');
        
        if (!resultados[grupoIndex]) {
            resultados[grupoIndex] = { partidos: [], posiciones: [] };
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
        });
    });
}

// Configurar botones
function configurarBotones() {
    document.getElementById('reset-btn').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres resetear todas las predicciones?')) {
            localStorage.removeItem('mundial2026_resultados');
            inicializarResultados();
            renderizarGrupos();
            actualizarEliminatorias();
        }
    });
    
    document.getElementById('export-btn').addEventListener('click', () => {
        const dataStr = JSON.stringify(resultados, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mundial2026_predicciones.json';
        link.click();
    });
    
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    
    document.getElementById('import-file').addEventListener('change', (e) => {
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
    });
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
            equipo: grupo.equipos[posiciones[0].indice],
            datos: posiciones[0]
        });
        clasificados.segundos.push({
            grupo: grupo.nombre,
            equipo: grupo.equipos[posiciones[1].indice],
            datos: posiciones[1]
        });
        clasificados.terceros.push({
            grupo: grupo.nombre,
            equipo: grupo.equipos[posiciones[2].indice],
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
        bracketDiv.appendChild(tituloDiv);
    });
    
    // Dieciseisavos (16 partidos): 8 a la izquierda (col 1), 8 a la derecha (col 9)
    const dieciseisavos = partidosDieciseisavos.length > 0 ? partidosDieciseisavos : 
        Array(16).fill(null).map(() => ({ local: { equipo: 'Por definir', grupo: '', posicion: '' }, visitante: { equipo: 'Por definir', grupo: '', posicion: '' } }));
    
    dieciseisavos.forEach((partido, index) => {
        const matchWrapper = document.createElement('div');
        matchWrapper.className = 'bracket-match-wrapper';
        
        // Primeros 8 a la izquierda (col 1), últimos 8 a la derecha (col 9)
        // Ambos lados deben estar en las mismas filas para alinearse
        if (index < 8) {
            // Lado izquierdo: filas 2, 4, 6, 8, 10, 12, 14, 16
            const startRow = index * 2 + 2;
            matchWrapper.style.gridArea = `${startRow} / 1 / span 2 / span 1`;
        } else {
            // Lado derecho: mismas filas que el lado izquierdo (index 0-7 corresponden a index 8-15)
            const leftIndex = index - 8;
            const startRow = leftIndex * 2 + 2;
            matchWrapper.style.gridArea = `${startRow} / 9 / span 2 / span 1`;
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
        // Centrar entre los dos partidos de octavos correspondientes
        // Cuartos 0: entre octavos 0 y 1 → fila 5
        // Cuartos 1: entre octavos 2 y 3 → fila 13
        // Cuartos 2: entre octavos 4 y 5 → fila 5
        // Cuartos 3: entre octavos 6 y 7 → fila 13
        const localIndex = index < 2 ? index : index - 2;
        const startRow = localIndex * 8 + 5;
        const col = index < 2 ? 3 : 7;
        matchWrapper.style.gridArea = `${startRow} / ${col} / span 2 / span 1`;
        
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
        // Centrar entre los dos partidos de cuartos correspondientes
        // Semis 0: entre cuartos 0 y 1 → fila 9
        // Semis 1: entre cuartos 2 y 3 → fila 9
        const startRow = 9;
        const col = index === 0 ? 4 : 6;
        matchWrapper.style.gridArea = `${startRow} / ${col} / span 2 / span 1`;
        
        const matchDiv = crearMatchCard('semis', index, partido);
        matchWrapper.appendChild(matchDiv);
        bracketDiv.appendChild(matchWrapper);
    });
    
    // Final (1 partido) - Columna 5 (centro)
    const final = partidoFinal ? [partidoFinal] : 
        [{ local: { equipo: 'Por definir', grupo: '', posicion: '' }, visitante: { equipo: 'Por definir', grupo: '', posicion: '' } }];
    
    const matchWrapper = document.createElement('div');
    matchWrapper.className = 'bracket-match-wrapper';
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
    
    const resultado = resultados[fase]?.[index] || { golesLocal: '', golesVisitante: '' };
    // Tratar valores vacíos como 0 para la visualización
    const golesLocal = (resultado.golesLocal !== '' && resultado.golesLocal !== undefined && resultado.golesLocal !== null) 
        ? (parseInt(resultado.golesLocal) || 0) : 0;
    const golesVisitante = (resultado.golesVisitante !== '' && resultado.golesVisitante !== undefined && resultado.golesVisitante !== null) 
        ? (parseInt(resultado.golesVisitante) || 0) : 0;
    
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
    
    matchDiv.innerHTML = `
        <div class="bracket-team ${ganadorLocal ? 'ganador' : ''} ${esPorDefinirLocal ? 'por-definir' : ''}">
            <div class="bracket-team-info">
                <span class="bracket-team-nombre">${equipoLocalNombre}</span>
                ${localInfo ? `<span class="bracket-team-posicion">${localInfo}</span>` : ''}
            </div>
            <div class="bracket-resultado">
                <input type="number" min="0" max="20" 
                       value="${resultado.golesLocal}" 
                       data-eliminatoria="${fase}" 
                       data-partido="${index}" 
                       data-equipo="0" 
                       data-tipo="local"
                       placeholder="0">
            </div>
        </div>
        <div class="bracket-team ${ganadorVisitante ? 'ganador' : ''} ${esPorDefinirVisitante ? 'por-definir' : ''}">
            <div class="bracket-team-info">
                <span class="bracket-team-nombre">${equipoVisitanteNombre}</span>
                ${visitanteInfo ? `<span class="bracket-team-posicion">${visitanteInfo}</span>` : ''}
            </div>
            <div class="bracket-resultado">
                <input type="number" min="0" max="20" 
                       value="${resultado.golesVisitante}" 
                       data-eliminatoria="${fase}" 
                       data-partido="${index}" 
                       data-equipo="1" 
                       data-tipo="visitante"
                       placeholder="0">
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

