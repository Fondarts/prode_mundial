// Interfaz de usuario para autenticación

// Renderizar estado de autenticación en el header
function renderizarEstadoAuth() {
    const authStatus = document.getElementById('auth-status');
    if (!authStatus) return;
    
    const usuario = typeof obtenerUsuarioActual === 'function' ? obtenerUsuarioActual() : null;
    
    if (usuario) {
        authStatus.innerHTML = `
            <div class="usuario-logueado">
                <span class="usuario-nombre">👤 ${usuario.nombreUsuario}</span>
                <button id="cerrar-sesion-btn" class="btn-cerrar-sesion">Cerrar Sesión</button>
            </div>
        `;
        
        document.getElementById('cerrar-sesion-btn')?.addEventListener('click', async () => {
            if (typeof cerrarSesion === 'function') {
                cerrarSesion();
            }
            renderizarEstadoAuth();
        });
    } else {
        authStatus.innerHTML = `
            <div class="usuario-no-logueado">
                <button id="login-btn" class="btn-login">Iniciar Sesión</button>
                <button id="registro-btn" class="btn-registro">Registrarse</button>
            </div>
        `;
        
        document.getElementById('login-btn')?.addEventListener('click', async () => {
            await mostrarDialogoLogin();
            renderizarEstadoAuth();
            // Actualizar también el selector de participantes si existe
            if (typeof renderizarGrupos === 'function') {
                renderizarGrupos();
            }
        });
        
        document.getElementById('registro-btn')?.addEventListener('click', async () => {
            await mostrarDialogoRegistro();
            renderizarEstadoAuth();
            // Actualizar también el selector de participantes si existe
            if (typeof renderizarGrupos === 'function') {
                renderizarGrupos();
            }
        });
    }
}

// Mostrar diálogo de login
async function mostrarDialogoLogin() {
    const nombreUsuario = await mostrarModal({
        titulo: 'Iniciar Sesión',
        mensaje: 'Ingresa tu nombre de usuario:',
        input: true,
        placeholder: 'Nombre de usuario',
        maxLength: 30,
        cancelar: true
    });
    
    if (!nombreUsuario || nombreUsuario === false) return;
    
    const clave = await mostrarModal({
        titulo: 'Iniciar Sesión',
        mensaje: 'Ingresa tu clave (5 números):',
        input: true,
        inputType: 'password',
        placeholder: '00000',
        maxLength: 5,
        cancelar: true
    });
    
    if (!clave || clave === false) return;
    
    if (typeof iniciarSesion === 'function') {
        const resultado = await iniciarSesion(nombreUsuario.trim(), clave);
        
        if (resultado.exito) {
            if (typeof guardarUsuarioActual === 'function') {
                guardarUsuarioActual(resultado.usuario);
            }
            await mostrarModal({
                titulo: '¡Bienvenido!',
                mensaje: `Has iniciado sesión como: ${resultado.usuario.nombreUsuario}`,
                cancelar: false
            });
            return true;
        } else {
            await mostrarModal({
                titulo: 'Error',
                mensaje: resultado.mensaje || 'Error al iniciar sesión',
                cancelar: false
            });
            return false;
        }
    }
    return false;
}

// Mostrar diálogo de registro
async function mostrarDialogoRegistro() {
    const nombreUsuario = await mostrarModal({
        titulo: 'Registrarse',
        mensaje: 'Elige un nombre de usuario único (mínimo 3 caracteres):',
        input: true,
        placeholder: 'Nombre de usuario',
        maxLength: 30,
        cancelar: true
    });
    
    if (!nombreUsuario || nombreUsuario === false) return;
    
    const clave = await mostrarModal({
        titulo: 'Registrarse',
        mensaje: 'Elige una clave de 5 números:',
        input: true,
        inputType: 'password',
        placeholder: '00000',
        maxLength: 5,
        cancelar: true
    });
    
    if (!clave || clave === false) return;
    
    const confirmarClave = await mostrarModal({
        titulo: 'Registrarse',
        mensaje: 'Confirma tu clave:',
        input: true,
        inputType: 'password',
        placeholder: '00000',
        maxLength: 5,
        cancelar: true
    });
    
    if (!confirmarClave || confirmarClave === false) return;
    
    if (clave !== confirmarClave) {
        await mostrarModal({
            titulo: 'Error',
            mensaje: 'Las claves no coinciden',
            cancelar: false
        });
        return;
    }
    
    if (typeof registrarUsuario === 'function') {
        const resultado = await registrarUsuario(nombreUsuario.trim(), clave);
        
        if (resultado.exito) {
            if (typeof guardarUsuarioActual === 'function') {
                guardarUsuarioActual(resultado.usuario);
            }
            await mostrarModal({
                titulo: '¡Registro Exitoso!',
                mensaje: `Te has registrado como: ${resultado.usuario.nombreUsuario}\n\nYa estás logueado.`,
                cancelar: false
            });
            return true;
        } else {
            await mostrarModal({
                titulo: 'Error',
                mensaje: resultado.mensaje || 'Error al registrar usuario',
                cancelar: false
            });
            return false;
        }
    }
    return false;
}

