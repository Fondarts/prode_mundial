// Servicio de autenticación simple
// Sistema de usuarios con nombre único y clave de 5 dígitos

let usuarioActual = null;

// Cargar usuario actual desde localStorage
function cargarUsuarioActual() {
    const usuarioGuardado = localStorage.getItem('mundial2026_usuario_actual');
    if (usuarioGuardado) {
        try {
            usuarioActual = JSON.parse(usuarioGuardado);
            return usuarioActual;
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Guardar usuario actual
function guardarUsuarioActual(usuario) {
    usuarioActual = usuario;
    if (usuario) {
        localStorage.setItem('mundial2026_usuario_actual', JSON.stringify(usuario));
    } else {
        localStorage.removeItem('mundial2026_usuario_actual');
    }
}

// Obtener usuario actual
function obtenerUsuarioActual() {
    if (!usuarioActual) {
        usuarioActual = cargarUsuarioActual();
    }
    return usuarioActual;
}

// Verificar si hay un usuario logueado
function estaLogueado() {
    return usuarioActual !== null;
}

// Cerrar sesión
function cerrarSesion() {
    usuarioActual = null;
    guardarUsuarioActual(null);
}

// ============================================
// FUNCIONES DE SUPABASE PARA USUARIOS
// ============================================

// Registrar nuevo usuario
async function registrarUsuarioSupabase(nombreUsuario, clave) {
    if (!usarSupabase()) return { exito: false, mensaje: 'Supabase no disponible' };
    
    try {
        // Verificar que el nombre de usuario no exista
        const { data: usuarioExistente, error: errorBusqueda } = await supabaseClient
            .from('usuarios')
            .select('nombre_usuario')
            .eq('nombre_usuario', nombreUsuario)
            .single();
        
        if (usuarioExistente) {
            return { exito: false, mensaje: 'El nombre de usuario ya existe' };
        }
        
        // Crear nuevo usuario
        const { data, error } = await supabaseClient
            .from('usuarios')
            .insert({
                nombre_usuario: nombreUsuario,
                clave: clave
            })
            .select()
            .single();
        
        if (error) throw error;
        
        return { exito: true, usuario: { id: data.id, nombreUsuario: data.nombre_usuario } };
    } catch (error) {
        return { exito: false, mensaje: error.message || 'Error al registrar usuario' };
    }
}

// Iniciar sesión
async function iniciarSesionSupabase(nombreUsuario, clave) {
    if (!usarSupabase()) return { exito: false, mensaje: 'Supabase no disponible' };
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('id, nombre_usuario')
            .eq('nombre_usuario', nombreUsuario)
            .eq('clave', clave)
            .single();
        
        if (error || !data) {
            return { exito: false, mensaje: 'Usuario o clave incorrectos' };
        }
        
        // Actualizar último acceso
        await supabaseClient
            .from('usuarios')
            .update({ ultimo_acceso: new Date().toISOString() })
            .eq('id', data.id);
        
        return { 
            exito: true, 
            usuario: { 
                id: data.id, 
                nombreUsuario: data.nombre_usuario 
            } 
        };
    } catch (error) {
        return { exito: false, mensaje: error.message || 'Error al iniciar sesión' };
    }
}

// ============================================
// FUNCIONES DE REGISTRO/LOGIN (con fallback a localStorage)
// ============================================

// Registrar nuevo usuario
async function registrarUsuario(nombreUsuario, clave) {
    // Validaciones
    if (!nombreUsuario || nombreUsuario.trim().length < 3) {
        return { exito: false, mensaje: 'El nombre de usuario debe tener al menos 3 caracteres' };
    }
    
    if (!clave || clave.length !== 5 || !/^\d{5}$/.test(clave)) {
        return { exito: false, mensaje: 'La clave debe tener exactamente 5 números' };
    }
    
    // Intentar registrar en Supabase
    if (usarSupabase() && typeof registrarUsuarioSupabase === 'function') {
        const resultado = await registrarUsuarioSupabase(nombreUsuario.trim(), clave);
        if (resultado.exito) {
            guardarUsuarioActual(resultado.usuario);
            return resultado;
        }
        return resultado;
    }
    
    // Fallback a localStorage
    const usuarios = obtenerUsuariosLocalStorage();
    if (usuarios[nombreUsuario.trim()]) {
        return { exito: false, mensaje: 'El nombre de usuario ya existe' };
    }
    
    usuarios[nombreUsuario.trim()] = {
        clave: clave,
        creadoEn: Date.now()
    };
    
    localStorage.setItem('mundial2026_usuarios', JSON.stringify(usuarios));
    
    guardarUsuarioActual({
        id: 'local_' + Date.now(),
        nombreUsuario: nombreUsuario.trim()
    });
    
    return { exito: true, usuario: { nombreUsuario: nombreUsuario.trim() } };
}

// Iniciar sesión
async function iniciarSesion(nombreUsuario, clave) {
    // Intentar login en Supabase
    if (usarSupabase() && typeof iniciarSesionSupabase === 'function') {
        const resultado = await iniciarSesionSupabase(nombreUsuario.trim(), clave);
        if (resultado.exito) {
            guardarUsuarioActual(resultado.usuario);
            return resultado;
        }
        // Si falla en Supabase, intentar localStorage
    }
    
    // Fallback a localStorage
    const usuarios = obtenerUsuariosLocalStorage();
    const usuario = usuarios[nombreUsuario.trim()];
    
    if (!usuario || usuario.clave !== clave) {
        return { exito: false, mensaje: 'Usuario o clave incorrectos' };
    }
    
    guardarUsuarioActual({
        id: 'local_' + Date.now(),
        nombreUsuario: nombreUsuario.trim()
    });
    
    return { exito: true, usuario: { nombreUsuario: nombreUsuario.trim() } };
}

// Obtener usuarios de localStorage (fallback)
function obtenerUsuariosLocalStorage() {
    const usuariosGuardados = localStorage.getItem('mundial2026_usuarios');
    if (usuariosGuardados) {
        try {
            return JSON.parse(usuariosGuardados);
        } catch (e) {
            return {};
        }
    }
    return {};
}

// Inicializar al cargar
cargarUsuarioActual();


