// Interfaz de usuario para autenticación

// Renderizar estado de autenticación en el header
function renderizarEstadoAuth() {
    // Verificar que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderizarEstadoAuth);
        return;
    }
    const authStatus = document.getElementById('auth-status');
    if (!authStatus) return;
    
    const usuario = typeof obtenerUsuarioActual === 'function' ? obtenerUsuarioActual() : null;
    
    if (usuario) {
        // Obtener estado de actualización automática
        const autoUpdateCheckbox = document.getElementById('auto-update-checkbox');
        const autoUpdateActivo = autoUpdateCheckbox ? autoUpdateCheckbox.checked : false;
        
        authStatus.innerHTML = `
            <div class="usuario-logueado">
                <span class="usuario-nombre">Bienvenido ${usuario.nombreUsuario}</span>
                <div class="menu-usuario-container">
                    <button id="menu-usuario-btn" class="btn-menu-usuario" aria-label="Menú de usuario">
                        ⚙️
                    </button>
                    <div id="menu-usuario" class="menu-usuario">
                        <button id="borrar-todo-btn" class="menu-item menu-item-danger">🗑️ Borrar Todo</button>
                        <div class="menu-separador"></div>
                        <button id="exportar-predicciones-btn" class="menu-item">📥 Exportar Predicciones</button>
                        <button id="importar-predicciones-btn" class="menu-item">📤 Importar Predicciones</button>
                        <div class="menu-separador"></div>
                        <button id="actualizar-resultados-menu-btn" class="menu-item">🔄 Actualizar Resultados</button>
                        <label class="menu-item-toggle">
                            <input type="checkbox" id="auto-update-menu-checkbox" ${autoUpdateActivo ? 'checked' : ''}>
                            <span>⚡ Actualización Automática</span>
                        </label>
                        <div class="menu-separador"></div>
                        <div class="menu-item-submenu">
                            <span class="menu-item-label">🌐 Idioma</span>
                            <div class="menu-item-idiomas">
                                <button class="menu-item-idioma ${localStorage.getItem('idioma') === 'es' || !localStorage.getItem('idioma') ? 'activo' : ''}" data-idioma="es">Español</button>
                                <button class="menu-item-idioma ${localStorage.getItem('idioma') === 'en' ? 'activo' : ''}" data-idioma="en">English</button>
                            </div>
                        </div>
                        <div class="menu-separador"></div>
                        <button id="cerrar-sesion-btn" class="menu-item menu-item-danger">🚪 Cerrar Sesión</button>
                    </div>
                </div>
            </div>
        `;
        
        // Toggle del menú
        const menuBtn = document.getElementById('menu-usuario-btn');
        const menu = document.getElementById('menu-usuario');
        
        menuBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('menu-usuario-abierto');
        });
        
        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!menuBtn?.contains(e.target) && !menu?.contains(e.target)) {
                menu?.classList.remove('menu-usuario-abierto');
            }
        });
        
        // Borrar todo
        document.getElementById('borrar-todo-btn')?.addEventListener('click', () => {
            menu.classList.remove('menu-usuario-abierto');
            if (confirm('¿Estás seguro de que quieres borrar todas las predicciones? Esta acción no se puede deshacer.')) {
                if (typeof resultados !== 'undefined') {
                    localStorage.removeItem('mundial2026_resultados');
                    if (typeof inicializarResultados === 'function') {
                        inicializarResultados();
                    }
                    if (typeof renderizarGrupos === 'function') {
                        renderizarGrupos();
                    }
                    if (typeof actualizarEliminatorias === 'function') {
                        actualizarEliminatorias();
                    }
                }
            }
        });
        
        // Exportar predicciones
        document.getElementById('exportar-predicciones-btn')?.addEventListener('click', () => {
            menu.classList.remove('menu-usuario-abierto');
            if (typeof resultados !== 'undefined') {
                const dataStr = JSON.stringify(resultados, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'mundial2026_predicciones.json';
                link.click();
            }
        });
        
        // Importar predicciones
        document.getElementById('importar-predicciones-btn')?.addEventListener('click', () => {
            menu.classList.remove('menu-usuario-abierto');
            const input = document.getElementById('import-file');
            if (input) {
                input.click();
            } else {
                // Crear input temporal si no existe
                const tempInput = document.createElement('input');
                tempInput.type = 'file';
                tempInput.accept = '.json';
                tempInput.style.display = 'none';
                tempInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            try {
                                if (typeof resultados !== 'undefined') {
                                    resultados = JSON.parse(event.target.result);
                                    if (typeof guardarResultados === 'function') {
                                        guardarResultados();
                                    }
                                    if (typeof renderizarGrupos === 'function') {
                                        renderizarGrupos();
                                    }
                                    if (typeof actualizarEliminatorias === 'function') {
                                        actualizarEliminatorias();
                                    }
                                    alert('Predicciones importadas correctamente');
                                }
                            } catch (error) {
                                alert('Error al importar el archivo');
                            }
                        };
                        reader.readAsText(file);
                    }
                    document.body.removeChild(tempInput);
                });
                document.body.appendChild(tempInput);
                tempInput.click();
            }
        });
        
        // Actualizar resultados
        document.getElementById('actualizar-resultados-menu-btn')?.addEventListener('click', async () => {
            menu.classList.remove('menu-usuario-abierto');
            const btn = document.getElementById('actualizar-resultados-menu-btn');
            if (btn) {
                btn.textContent = '⏳ Actualizando...';
                btn.disabled = true;
            }
            
            try {
                if (typeof actualizarResultadosDesdeAPI === 'function') {
                    const resultado = await actualizarResultadosDesdeAPI();
                    if (resultado && resultado.exito) {
                        if (typeof mostrarModal === 'function') {
                            mostrarModal({
                                titulo: '✅ Resultados Actualizados',
                                mensaje: resultado.mensaje || `Se actualizaron ${resultado.actualizados || 0} resultados`,
                                cancelar: false
                            });
                        } else {
                            alert(resultado.mensaje || `Se actualizaron ${resultado.actualizados || 0} resultados`);
                        }
                    } else {
                        if (typeof mostrarModal === 'function') {
                            mostrarModal({
                                titulo: '⚠️ Sin Cambios',
                                mensaje: resultado?.mensaje || 'No se encontraron resultados nuevos para actualizar',
                                cancelar: false
                            });
                        } else {
                            alert(resultado?.mensaje || 'No se encontraron resultados nuevos para actualizar');
                        }
                    }
                }
            } catch (error) {
                if (typeof mostrarModal === 'function') {
                    mostrarModal({
                        titulo: '❌ Error',
                        mensaje: 'Hubo un error al actualizar los resultados. Por favor, intenta de nuevo.',
                        cancelar: false
                    });
                } else {
                    alert('Error al actualizar los resultados');
                }
            } finally {
                if (btn) {
                    btn.textContent = '🔄 Actualizar Resultados';
                    btn.disabled = false;
                }
            }
        });
        
        // Actualización automática
        const autoUpdateMenuCheckbox = document.getElementById('auto-update-menu-checkbox');
        const autoUpdateMainCheckbox = document.getElementById('auto-update-checkbox');
        
        autoUpdateMenuCheckbox?.addEventListener('change', (e) => {
            if (autoUpdateMainCheckbox) {
                autoUpdateMainCheckbox.checked = e.target.checked;
                autoUpdateMainCheckbox.dispatchEvent(new Event('change'));
            }
            
            // Sincronizar con función de actualización automática
            if (typeof iniciarActualizacionAutomatica === 'function' && typeof detenerActualizacionAutomatica === 'function') {
                if (e.target.checked) {
                    iniciarActualizacionAutomatica();
                } else {
                    detenerActualizacionAutomatica();
                }
            }
        });
        
        // Sincronizar checkbox principal con el del menú
        if (autoUpdateMainCheckbox) {
            autoUpdateMainCheckbox.addEventListener('change', (e) => {
                if (autoUpdateMenuCheckbox) {
                    autoUpdateMenuCheckbox.checked = e.target.checked;
                }
            });
        }
        
        // Selección de idioma
        document.querySelectorAll('.menu-item-idioma').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idioma = e.target.dataset.idioma;
                localStorage.setItem('idioma', idioma);
                document.querySelectorAll('.menu-item-idioma').forEach(b => b.classList.remove('activo'));
                e.target.classList.add('activo');
                // Recargar página para aplicar idioma
                location.reload();
            });
        });
        
        // Cerrar sesión
        document.getElementById('cerrar-sesion-btn')?.addEventListener('click', async () => {
            menu.classList.remove('menu-usuario-abierto');
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

