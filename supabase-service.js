// Servicio para interactuar con Supabase
// Maneja todas las operaciones de base de datos

// ============================================
// FUNCIONES DE TORNEOS
// ============================================

// Obtener todos los torneos
async function obtenerTorneosSupabase() {
    if (!usarSupabase()) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('torneos')
            .select('*')
            .order('fecha_creacion', { ascending: false });
        
        if (error) throw error;
        
        // Convertir a formato esperado
        const torneos = {};
        data.forEach(torneo => {
            torneos[torneo.codigo] = {
                nombre: torneo.nombre,
                participantes: [],
                creadoPor: torneo.creado_por,
                fechaCreacion: new Date(torneo.fecha_creacion).getTime(),
                resultadosReales: torneo.resultados_reales || {}
            };
        });
        
        return torneos;
    } catch (error) {
        console.error('Error al obtener torneos:', error);
        return null;
    }
}

// Obtener un torneo por código
async function obtenerTorneoPorCodigoSupabase(codigo) {
    if (!usarSupabase()) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('torneos')
            .select('*')
            .eq('codigo', codigo)
            .single();
        
        if (error) throw error;
        
        return {
            id: data.id,
            codigo: data.codigo,
            nombre: data.nombre,
            creadoPor: data.creado_por,
            fechaCreacion: new Date(data.fecha_creacion).getTime(),
            resultadosReales: data.resultados_reales || {}
        };
    } catch (error) {
        console.error('Error al obtener torneo:', error);
        return null;
    }
}

// Crear nuevo torneo
async function crearTorneoSupabase(codigo, nombre, nombreCreador) {
    if (!usarSupabase()) return false;
    
    try {
        const { data, error } = await supabaseClient
            .from('torneos')
            .insert({
                codigo: codigo,
                nombre: nombre || `Torneo ${codigo}`,
                creado_por: nombreCreador,
                resultados_reales: {}
            })
            .select()
            .single();
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error al crear torneo:', error);
        return false;
    }
}

// Actualizar resultados reales de un torneo
async function actualizarResultadosRealesSupabase(codigo, grupoIndex, partidoIndex, golesLocal, golesVisitante) {
    if (!usarSupabase()) return false;
    
    try {
        // Obtener el torneo
        const torneo = await obtenerTorneoPorCodigoSupabase(codigo);
        if (!torneo) return false;
        
        // Actualizar resultados reales
        const resultadosReales = torneo.resultadosReales || {};
        if (!resultadosReales[grupoIndex]) {
            resultadosReales[grupoIndex] = {};
        }
        resultadosReales[grupoIndex][partidoIndex] = {
            golesLocal: parseInt(golesLocal) || 0,
            golesVisitante: parseInt(golesVisitante) || 0
        };
        
        const { error } = await supabaseClient
            .from('torneos')
            .update({ resultados_reales: resultadosReales })
            .eq('codigo', codigo);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error al actualizar resultados reales:', error);
        return false;
    }
}

// ============================================
// FUNCIONES DE PARTICIPANTES
// ============================================

// Obtener participantes de un torneo
async function obtenerParticipantesSupabase(codigo) {
    if (!usarSupabase()) return null;
    
    try {
        // Primero obtener el ID del torneo
        const torneo = await obtenerTorneoPorCodigoSupabase(codigo);
        if (!torneo) return null;
        
        const { data, error } = await supabaseClient
            .from('participantes')
            .select('*')
            .eq('torneo_id', torneo.id)
            .order('puntos', { ascending: false });
        
        if (error) throw error;
        
        // Convertir a formato esperado
        return data.map(p => ({
            nombre: p.nombre,
            usuarioId: p.usuario_id || null,
            predicciones: p.predicciones || {},
            puntos: p.puntos || 0,
            estadisticas: p.estadisticas || {
                resultadosExactos: 0,
                resultadosAcertados: 0,
                partidosJugados: 0,
                puntosTotales: 0
            }
        }));
    } catch (error) {
        console.error('Error al obtener participantes:', error);
        return null;
    }
}

// Agregar o actualizar participante
async function guardarParticipanteSupabase(codigo, nombre, predicciones, usuarioId = null) {
    if (!usarSupabase()) return false;
    
    try {
        // Obtener el ID del torneo
        const torneo = await obtenerTorneoPorCodigoSupabase(codigo);
        if (!torneo) return false;
        
        // Si se proporciona usuarioId, verificar si ya existe una predicción de ese usuario
        if (usuarioId) {
            const { data: participanteExistentePorUsuario } = await supabaseClient
                .from('participantes')
                .select('id, nombre')
                .eq('torneo_id', torneo.id)
                .eq('usuario_id', usuarioId)
                .maybeSingle();
            
            if (participanteExistentePorUsuario) {
                // Ya existe una predicción de este usuario en este torneo
                return false;
            }
        }
        
        // Verificar si el participante ya existe por nombre
        const { data: participanteExistente } = await supabaseClient
            .from('participantes')
            .select('id')
            .eq('torneo_id', torneo.id)
            .eq('nombre', nombre)
            .maybeSingle();
        
        if (participanteExistente) {
            // Actualizar
            const { error } = await supabaseClient
                .from('participantes')
                .update({
                    predicciones: predicciones,
                    usuario_id: usuarioId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', participanteExistente.id);
            
            if (error) throw error;
        } else {
            // Crear nuevo
            const { error } = await supabaseClient
                .from('participantes')
                .insert({
                    torneo_id: torneo.id,
                    nombre: nombre,
                    predicciones: predicciones,
                    usuario_id: usuarioId,
                    puntos: 0,
                    estadisticas: {
                        resultadosExactos: 0,
                        resultadosAcertados: 0,
                        partidosJugados: 0,
                        puntosTotales: 0
                    }
                });
            
            if (error) throw error;
        }
        
        return true;
    } catch (error) {
        console.error('Error al guardar participante:', error);
        return false;
    }
}

// Actualizar estadísticas de un participante
async function actualizarEstadisticasParticipanteSupabase(codigo, nombre, estadisticas) {
    if (!usarSupabase()) return false;
    
    try {
        const torneo = await obtenerTorneoPorCodigoSupabase(codigo);
        if (!torneo) return false;
        
        const { error } = await supabaseClient
            .from('participantes')
            .update({
                puntos: estadisticas.puntosTotales,
                estadisticas: estadisticas
            })
            .eq('torneo_id', torneo.id)
            .eq('nombre', nombre);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error al actualizar estadísticas:', error);
        return false;
    }
}

// ============================================
// FUNCIONES DE SINCRONIZACIÓN
// ============================================

// Sincronizar datos de localStorage a Supabase (migración inicial)
async function sincronizarLocalStorageASupabase() {
    if (!usarSupabase()) return;
    
    try {
        const datosLocal = localStorage.getItem('mundial2026_torneos');
        if (!datosLocal) return;
        
        const torneosLocal = JSON.parse(datosLocal);
        
        for (const [codigo, torneo] of Object.entries(torneosLocal)) {
            // Verificar si el torneo ya existe en Supabase
            const torneoExistente = await obtenerTorneoPorCodigoSupabase(codigo);
            
            if (!torneoExistente) {
                // Crear torneo en Supabase
                await crearTorneoSupabase(codigo, torneo.nombre, torneo.creadoPor);
                
                // Sincronizar participantes
                if (torneo.participantes) {
                    for (const participante of torneo.participantes) {
                        await guardarParticipanteSupabase(codigo, participante.nombre, participante.predicciones);
                        if (participante.estadisticas) {
                            await actualizarEstadisticasParticipanteSupabase(codigo, participante.nombre, participante.estadisticas);
                        }
                    }
                }
                
                // Sincronizar resultados reales
                if (torneo.resultadosReales) {
                    for (const [grupoIndex, resultadosGrupo] of Object.entries(torneo.resultadosReales)) {
                        for (const [partidoIndex, resultado] of Object.entries(resultadosGrupo)) {
                            await actualizarResultadosRealesSupabase(
                                codigo,
                                grupoIndex,
                                partidoIndex,
                                resultado.golesLocal,
                                resultado.golesVisitante
                            );
                        }
                    }
                }
            }
        }
        
        console.log('Sincronización completada');
    } catch (error) {
        console.error('Error en sincronización:', error);
    }
}

// Cargar todos los datos desde Supabase
async function cargarDatosDesdeSupabase() {
    if (!usarSupabase()) return null;
    
    try {
        const torneosData = await obtenerTorneosSupabase();
        if (!torneosData) return null;
        
        // Para cada torneo, cargar sus participantes
        for (const [codigo, torneo] of Object.entries(torneosData)) {
            const participantes = await obtenerParticipantesSupabase(codigo);
            if (participantes) {
                torneo.participantes = participantes;
            }
        }
        
        return torneosData;
    } catch (error) {
        console.error('Error al cargar datos desde Supabase:', error);
        return null;
    }
}

