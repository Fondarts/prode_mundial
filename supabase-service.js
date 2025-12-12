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
                resultadosReales: torneo.resultados_reales || {},
                esPrivado: torneo.es_privado || false,
                clave: torneo.clave || null
            };
        });
        
        return torneos;
    } catch (error) {
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
            resultadosReales: data.resultados_reales || {},
            esPrivado: data.es_privado || false,
            clave: data.clave || null
        };
    } catch (error) {
        return null;
    }
}

// Buscar torneo privado por contraseña
async function buscarTorneoPorClaveSupabase(clave) {
    if (!usarSupabase()) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('torneos')
            .select('*')
            .eq('clave', clave)
            .eq('es_privado', true)
            .maybeSingle();
        
        if (error) throw error;
        
        if (!data) return null;
        
        return {
            id: data.id,
            codigo: data.codigo,
            nombre: data.nombre,
            creadoPor: data.creado_por,
            fechaCreacion: new Date(data.fecha_creacion).getTime(),
            resultadosReales: data.resultados_reales || {},
            esPrivado: true,
            clave: data.clave
        };
    } catch (error) {
        return null;
    }
}

// Crear nuevo torneo
async function crearTorneoSupabase(codigo, nombre, nombreCreador, esPrivado = false, clave = null) {
    if (!usarSupabase()) return false;
    
    try {
        const datosInsertar = {
            codigo: codigo,
            nombre: nombre || `Torneo ${codigo}`,
            creado_por: nombreCreador,
            resultados_reales: {}
        };
        
        // Solo agregar es_privado si la columna existe (intentar, si falla continuar sin ella)
        // Intentar agregar es_privado
        try {
            datosInsertar.es_privado = esPrivado;
        } catch (e) {
            // Si falla, la columna probablemente no existe, continuar sin ella
        }
        
        // Solo agregar clave si es privado y tiene valor
        if (esPrivado && clave && clave.trim() !== '') {
            datosInsertar.clave = clave;
        }
        
        const { data, error } = await supabaseClient
            .from('torneos')
            .insert(datosInsertar)
            .select()
            .single();
        
        if (error) {
            // Si el error es que la columna no existe, intentar sin es_privado
            if (error.code === 'PGRST204' || (error.message && error.message.includes('es_privado'))) {
                // Intentar sin es_privado
                const datosSinEsPrivado = {
                    codigo: codigo,
                    nombre: nombre || `Torneo ${codigo}`,
                    creado_por: nombreCreador,
                    resultados_reales: {}
                };
                
                // Solo agregar clave si es privado
                if (esPrivado && clave && clave.trim() !== '') {
                    datosSinEsPrivado.clave = clave;
                }
                
                const { data: dataRetry, error: errorRetry } = await supabaseClient
                    .from('torneos')
                    .insert(datosSinEsPrivado)
                    .select()
                    .single();
                
                if (errorRetry) {
                    console.error('Error al crear torneo en Supabase:', errorRetry);
                    throw errorRetry;
                }
                return true;
            }
            console.error('Error al crear torneo en Supabase:', error);
            throw error;
        }
        return true;
    } catch (error) {
        console.error('Error en crearTorneoSupabase:', error);
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
        return null;
    }
}

// Agregar o actualizar participante
async function guardarParticipanteSupabase(codigo, nombre, predicciones, usuarioId = null, permitirActualizacion = false) {
    if (!usarSupabase()) return false;
    
    try {
        // Obtener el ID del torneo
        const torneo = await obtenerTorneoPorCodigoSupabase(codigo);
        if (!torneo) return false;
        
        // Si se proporciona usuarioId válido, verificar si ya existe una predicción de ese usuario
        // Solo si la columna usuario_id existe en la tabla
        if (usuarioId && usuarioId.trim() !== '') {
            try {
                const { data: participanteExistentePorUsuario, error: errorConsulta } = await supabaseClient
                    .from('participantes')
                    .select('id, nombre')
                    .eq('torneo_id', torneo.id)
                    .eq('usuario_id', usuarioId)
                    .maybeSingle();
                
                if (errorConsulta) {
                    // Si el error es que la columna no existe, ignorar y continuar
                    if (errorConsulta.code === 'PGRST204' && errorConsulta.message && errorConsulta.message.includes('usuario_id')) {
                        // La columna no existe, continuar sin usar usuario_id
                    } else {
                        // Otro tipo de error, continuar con el flujo normal
                    }
                } else if (participanteExistentePorUsuario) {
                    // Si ya existe y no se permite actualización, retornar false
                    if (!permitirActualizacion) {
                        return false;
                    }
                    // Si se permite actualización, actualizar la predicción existente
                    const { error } = await supabaseClient
                        .from('participantes')
                        .update({
                            predicciones: predicciones,
                            nombre: nombre, // Actualizar nombre por si cambió
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', participanteExistentePorUsuario.id);
                    
                    if (error) throw error;
                    return true;
                }
            } catch (error) {
                // Si el error es que la columna no existe, ignorar y continuar
                if (error.code === 'PGRST204' && error.message && error.message.includes('usuario_id')) {
                    // La columna no existe, continuar sin usar usuario_id
                } else {
                    // Otro tipo de error, continuar con el flujo normal
                }
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
            const datosActualizar = {
                predicciones: predicciones,
                updated_at: new Date().toISOString()
            };
            
            // Solo actualizar usuario_id si es válido (y la columna existe)
            // No intentamos actualizar usuario_id si la columna no existe en la tabla
            
            const { error } = await supabaseClient
                .from('participantes')
                .update(datosActualizar)
                .eq('id', participanteExistente.id);
            
            if (error) throw error;
        } else {
            // Crear nuevo
            const datosInsertar = {
                torneo_id: torneo.id,
                nombre: nombre,
                predicciones: predicciones,
                puntos: 0,
                estadisticas: {
                    resultadosExactos: 0,
                    resultadosAcertados: 0,
                    partidosJugados: 0,
                    puntosTotales: 0
                }
            };
            
            // Intentar insertar con usuario_id si es válido
            // Si la columna no existe, se intentará sin ella
            if (usuarioId && typeof usuarioId === 'string' && usuarioId.trim() !== '' && usuarioId !== 'null' && usuarioId !== 'undefined') {
                datosInsertar.usuario_id = usuarioId;
            }
            
            const { data, error } = await supabaseClient
                .from('participantes')
                .insert(datosInsertar)
                .select();
            
            if (error) {
                // Si el error es que la columna usuario_id no existe, intentar sin ella
                if (error.code === 'PGRST204' && error.message && error.message.includes('usuario_id')) {
                    // Eliminar usuario_id del objeto y volver a intentar
                    delete datosInsertar.usuario_id;
                    const { data: dataRetry, error: errorRetry } = await supabaseClient
                        .from('participantes')
                        .insert(datosInsertar)
                        .select();
                    
                    if (errorRetry) {
                        console.error('Error al insertar participante en Supabase:', errorRetry);
                        throw errorRetry;
                    }
                } else {
                    console.error('Error al insertar participante en Supabase:', error);
                    throw error;
                }
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error en guardarParticipanteSupabase:', error);
        return false;
    }
}

// Eliminar participante de un torneo
async function eliminarParticipanteSupabase(codigo, nombre) {
    if (!usarSupabase()) {
        console.warn('Supabase no está disponible');
        return false;
    }
    
    try {
        // Obtener el ID del torneo
        const torneo = await obtenerTorneoPorCodigoSupabase(codigo);
        if (!torneo) {
            console.error('Torneo no encontrado:', codigo);
            return false;
        }
        
        console.log('Intentando eliminar participante:', { codigo, nombre, torneoId: torneo.id });
        
        // Intentar eliminar directamente por torneo_id y nombre (más eficiente)
        const { data: eliminado, error: errorEliminar } = await supabaseClient
            .from('participantes')
            .delete()
            .eq('torneo_id', torneo.id)
            .eq('nombre', nombre)
            .select();
        
        if (errorEliminar) {
            console.error('Error al eliminar participante (directo):', errorEliminar);
            
            // Si falla, intentar buscar primero y luego eliminar por ID
            const { data: participante, error: errorBuscar } = await supabaseClient
                .from('participantes')
                .select('id')
                .eq('torneo_id', torneo.id)
                .eq('nombre', nombre)
                .maybeSingle();
            
            if (errorBuscar) {
                console.error('Error al buscar participante:', errorBuscar);
                return false;
            }
            
            if (!participante) {
                // El participante no existe, considerar éxito
                console.log('Participante no encontrado, ya fue eliminado');
                return true;
            }
            
            // Intentar eliminar por ID
            const { data: eliminadoPorId, error: errorEliminarPorId } = await supabaseClient
                .from('participantes')
                .delete()
                .eq('id', participante.id)
                .select();
            
            if (errorEliminarPorId) {
                console.error('Error al eliminar participante por ID:', errorEliminarPorId);
                console.error('Detalles del error:', JSON.stringify(errorEliminarPorId, null, 2));
                return false;
            }
            
            if (eliminadoPorId && eliminadoPorId.length > 0) {
                console.log('Participante eliminado correctamente por ID:', eliminadoPorId[0].id);
                return true;
            }
            
            return false;
        }
        
        // Verificar que se eliminó correctamente
        if (eliminado && eliminado.length > 0) {
            console.log('Participante eliminado correctamente:', eliminado[0].id);
            return true;
        } else {
            console.warn('No se encontró participante para eliminar');
            return true; // Considerar éxito si no existe
        }
    } catch (error) {
        console.error('Error en eliminarParticipanteSupabase:', error);
        console.error('Stack trace:', error.stack);
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
        
    } catch (error) {
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
        return null;
    }
}

