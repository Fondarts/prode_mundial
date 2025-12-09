// Sistema de traducciones
const translations = {
    es: {
        // Header
        title: "⚽ Fixture Interactivo Mundial 2026",
        subtitle: "Predice los resultados y visualiza los cruces",
        
        // Tabs
        grupos: "Grupos",
        eliminatorias: "Eliminatorias",
        torneo: "Torneo",
        informacion: "Información",
        
        // Buttons
        enviarPredicciones: "📤 Enviar Predicciones",
        verMisPredicciones: "👁️ Ver Mis Predicciones",
        reglas: "Reglas",
        cargarPrediccion: "📥 Cargar Predicción",
        
        // Auth
        bienvenido: "Bienvenido",
        iniciarSesion: "Iniciar Sesión",
        registrarse: "Registrarse",
        cerrarSesion: "Cerrar Sesión",
        nombreUsuario: "Nombre de usuario",
        clave: "Clave",
        ingresarNombreUsuario: "Ingresa tu nombre de usuario:",
        ingresarClave: "Ingresa tu clave (5 números):",
        clave5Numeros: "00000",
        errorIniciarSesion: "Error al iniciar sesión",
        errorRegistro: "Error al registrarse",
        elegirNombreUsuario: "Elige un nombre de usuario único (mínimo 3 caracteres):",
        elegirClave: "Elige una clave de 5 números:",
        confirmarClave: "Confirma tu clave:",
        clavesNoCoinciden: "Las claves no coinciden",
        registroExitosoCompleto: "¡Registro Exitoso!",
        teHasRegistradoComo: "Te has registrado como:",
        yaEstasLogueado: "Ya estás logueado.",
        usuarioYaExiste: "El usuario ya existe",
        claveIncorrecta: "Clave incorrecta",
        usuarioNoEncontrado: "Usuario no encontrado",
        registroExitoso: "¡Registro exitoso!",
        bienvenidoUsuario: "¡Bienvenido!",
        hasIniciadoSesionComo: "Has iniciado sesión como:",
        
        // Torneo
        misTorneos: "🏆 Mis Torneos",
        tablaGlobal: "🌍 Tabla Global",
        noEstasEnNingunTorneo: "No estás en ningún torneo aún. Envía tus predicciones desde la pestaña \"Grupos\".",
        creador: "Creador",
        codigo: "Código",
        contraseña: "Contraseña",
        participantes: "Participantes",
        tuPosicion: "Tu posición",
        con: "con",
        puntos: "puntos",
        clasificacion: "Clasificación",
        pos: "Pos",
        nombre: "Nombre",
        pts: "Pts",
        exactos: "Exactos",
        acertados: "Acertados",
        partidos: "Partidos",
        crearTorneo: "Crear Torneo",
        unirseATorneo: "Unirse a Torneo",
        nombreTorneo: "Nombre del torneo",
        ingresarNombreTorneo: "Ingresa el nombre del torneo:",
        torneoCreado: "¡Torneo Creado!",
        torneoCreadoExitosamente: "¡Torneo creado exitosamente!",
        codigoTorneo: "Código del torneo",
        compartirCodigo: "Comparte este código con tus amigos para que se unan.",
        torneoPrivadoCreado: "¡Torneo privado creado exitosamente!",
        contraseñaTorneo: "Contraseña del torneo",
        compartirContraseña: "Comparte esta contraseña con tus amigos para que se unan.",
        seleccionarTorneo: "Seleccionar Torneo",
        torneosAbiertos: "🌍 Torneos Abiertos",
        torneosPrivados: "🔒 Torneos de Amigos",
        buscarTorneo: "🔍 Buscar torneo por nombre o código...",
        noHayTorneos: "No hay torneos en esta categoría",
        sinTorneos: "Sin Torneos",
        noHayTorneosDisponibles: "No hay torneos disponibles en este momento.",
        torneoPrivado: "Torneo Privado",
        ingresarContraseñaTorneo: "Este es un torneo privado.\n\nIngresa la contraseña del torneo",
        contraseñaIncorrecta: "Contraseña Incorrecta",
        contraseñaNoCorrecta: "La contraseña ingresada no es correcta.",
        ingresarCodigoTorneo: "Ingresa el código del torneo",
        codigo6Digitos: "6 dígitos",
        codigoDebeTener6Digitos: "El código debe tener 6 dígitos",
        codigoNoCoincide: "El código ingresado no coincide con el torneo seleccionado",
        error: "Error",
        esteEsTorneoPrivado: "Este es un torneo privado. Usa la opción \"Torneo Privado\" para unirte.",
        torneoNoEncontrado: "Torneo no encontrado",
        noSeEncontroTorneoPrivado: "No se encontró un torneo privado con esa contraseña.",
        misPredicciones: "Mis Predicciones",
        prediccionCargada: "Predicción Cargada",
        prediccionesCargadasCorrectamente: "Las predicciones se han cargado correctamente en la página principal.",
        sinPredicciones: "Sin Predicciones",
        noHasEnviadoPredicciones: "No has enviado predicciones para este torneo aún.",
        abierto: "🌍 Abierto",
        privado: "🔒 Privado",
        
        // Eliminatorias
        eliminatoriasTitle: "Eliminatorias",
        eliminatoriasDescription: "Ingresa los resultados para ver los cruces y predecir el torneo completo",
        
        // Información
        sobreElMundial: "Sobre el Mundial 2026",
        paisesCiudades: "Países y Ciudades Anfitrionas",
        formatoTorneo: "Formato del Torneo",
        fechasImportantes: "Fechas Importantes",
        entradasVisados: "Entradas y Visados",
        reglasPredicciones: "Reglas de Predicciones",
        
        // Reglas
        reglasTorneo: "Reglas del Torneo",
        comoFunciona: "🎯 Cómo Funciona",
        creaTorneo: "Crea tu propio torneo con amigos y comparte el código único con ellos.",
        uneteTorneo: "Únete a un torneo existente usando el código de 6 dígitos.",
        sistemaPuntos: "🏆 Sistema de Puntos",
        resultadoExacto: "Resultado exacto: 5 puntos",
        resultadoAcertado: "Resultado acertado (ganador correcto): 3 puntos",
        resultadoErroneo: "Resultado erróneo: 0 puntos",
        modificacionPredicciones: "📅 Modificación de Predicciones",
        prediccionesModificablesHasta: "Las predicciones pueden modificarse hasta el",
        inclusive: "inclusive",
        despuesSoloNuevas: "Después de esa fecha, solo puedes hacer predicciones nuevas para partidos que aún no han comenzado pero no podrán ser modificadas.",
        partidoComenzado: "Una vez que un partido ha comenzado, su predicción queda bloqueada",
        faseEliminatoriaHabilitada: "Una vez terminada la fase de grupos se habilitarán las predicciones para la fase eliminatoria.",
        clasificacionTitle: "🏆 Clasificación",
        clasificacionActualiza: "La clasificación se actualiza automáticamente según los resultados reales de los partidos",
        muestraPosicion: "Se muestra tu posición, puntos totales, resultados exactos y acertados",
        tablaGlobalMuestra: "La tabla global muestra la clasificación combinada de todos los torneos",
        
        // Grupos
        grupo: "Grupo",
        partidos: "Partidos",
        tuPrediccion: "TU PREDICCIÓN",
        pendiente: "PENDIENTE",
        jugado: "JUGADO",
        pj: "PJ",
        pg: "PG",
        pe: "PE",
        pp: "PP",
        gf: "GF",
        gc: "GC",
        dg: "DG",
        
        // Modales
        cancelar: "Cancelar",
        aceptar: "Aceptar",
        cerrar: "Cerrar",
        
        // Supabase
        supabaseDesconectado: "Supabase Desconectado",
        supabaseConectado: "Supabase Conectado",
        resultadosNoSincronizaran: "Los resultados ya no se sincronizarán con Supabase. Los cambios se guardarán solo localmente. Los partidos marcados como jugados desde Supabase han sido limpiados. Útil para pruebas.",
        resultadosSincronizaran: "Los resultados ahora se sincronizarán con Supabase.",
        
        // Predicciones
        prediccionEnviada: "Predicción enviada correctamente",
        prediccionActualizada: "Predicción actualizada correctamente",
        noSePudieronEnviar: "No se pudieron enviar las predicciones",
        yaHasEnviadoPrediccion: "Ya has enviado una predicción para este torneo. Las predicciones no se pueden modificar después del 7 de junio.",
        prediccionNoModificable: "Predicción no modificable",
        prediccionesNoModificablesDespues: "Las predicciones existentes no se pueden modificar después del 7 de junio. Solo puedes hacer nuevas predicciones de partidos que aún no han empezado.",
        
        // Otros
        borrarTodo: "Borrar Todo",
        exportarPredicciones: "Exportar Predicciones",
        importarPredicciones: "Importar Predicciones",
        idioma: "Idioma",
        español: "Español",
        english: "English"
    },
    en: {
        // Header
        title: "⚽ Interactive World Cup 2026 Fixture",
        subtitle: "Predict results and visualize matchups",
        
        // Tabs
        grupos: "Groups",
        eliminatorias: "Knockout Stage",
        torneo: "Tournament",
        informacion: "Information",
        
        // Buttons
        enviarPredicciones: "📤 Send Predictions",
        verMisPredicciones: "👁️ View My Predictions",
        reglas: "Rules",
        cargarPrediccion: "📥 Load Prediction",
        
        // Auth
        bienvenido: "Welcome",
        iniciarSesion: "Log In",
        registrarse: "Sign Up",
        cerrarSesion: "Log Out",
        nombreUsuario: "Username",
        clave: "Password",
        ingresarNombreUsuario: "Enter your username:",
        ingresarClave: "Enter your password (5 digits):",
        clave5Numeros: "00000",
        errorIniciarSesion: "Error logging in",
        errorRegistro: "Error signing up",
        usuarioYaExiste: "User already exists",
        claveIncorrecta: "Incorrect password",
        usuarioNoEncontrado: "User not found",
        registroExitoso: "Registration successful!",
        bienvenidoUsuario: "Welcome!",
        hasIniciadoSesionComo: "You have logged in as:",
        
        // Torneo
        misTorneos: "🏆 My Tournaments",
        tablaGlobal: "🌍 Global Table",
        noEstasEnNingunTorneo: "You are not in any tournament yet. Send your predictions from the \"Groups\" tab.",
        creador: "Creator",
        codigo: "Code",
        contraseña: "Password",
        participantes: "Participants",
        tuPosicion: "Your position",
        con: "with",
        puntos: "points",
        clasificacion: "Classification",
        pos: "Pos",
        nombre: "Name",
        pts: "Pts",
        exactos: "Exact",
        acertados: "Correct",
        partidos: "Matches",
        crearTorneo: "Create Tournament",
        unirseATorneo: "Join Tournament",
        nombreTorneo: "Tournament name",
        ingresarNombreTorneo: "Enter the tournament name:",
        torneoCreado: "Tournament Created!",
        torneoCreadoExitosamente: "Tournament created successfully!",
        codigoTorneo: "Tournament code",
        compartirCodigo: "Share this code with your friends to join.",
        torneoPrivadoCreado: "Private tournament created successfully!",
        contraseñaTorneo: "Tournament password",
        compartirContraseña: "Share this password with your friends to join.",
        seleccionarTorneo: "Select Tournament",
        torneosAbiertos: "🌍 Open Tournaments",
        torneosPrivados: "🔒 Friend Tournaments",
        buscarTorneo: "🔍 Search tournament by name or code...",
        noHayTorneos: "No tournaments in this category",
        sinTorneos: "No Tournaments",
        noHayTorneosDisponibles: "No tournaments available at this time.",
        torneoPrivado: "Private Tournament",
        ingresarContraseñaTorneo: "This is a private tournament.\n\nEnter the tournament password",
        contraseñaIncorrecta: "Incorrect Password",
        contraseñaNoCorrecta: "The password entered is not correct.",
        ingresarCodigoTorneo: "Enter the tournament code",
        codigo6Digitos: "6 digits",
        codigoDebeTener6Digitos: "The code must have 6 digits",
        codigoNoCoincide: "The code entered does not match the selected tournament",
        error: "Error",
        esteEsTorneoPrivado: "This is a private tournament. Use the \"Private Tournament\" option to join.",
        torneoNoEncontrado: "Tournament not found",
        noSeEncontroTorneoPrivado: "No private tournament found with that password.",
        misPredicciones: "My Predictions",
        prediccionCargada: "Prediction Loaded",
        prediccionesCargadasCorrectamente: "Predictions have been loaded successfully into the main page.",
        sinPredicciones: "No Predictions",
        noHasEnviadoPredicciones: "You have not sent predictions for this tournament yet.",
        abierto: "🌍 Open",
        privado: "🔒 Private",
        
        // Eliminatorias
        eliminatoriasTitle: "Knockout Stage",
        eliminatoriasDescription: "Enter results to see matchups and predict the complete tournament",
        
        // Información
        sobreElMundial: "About World Cup 2026",
        paisesCiudades: "Host Countries and Cities",
        formatoTorneo: "Tournament Format",
        fechasImportantes: "Important Dates",
        entradasVisados: "Tickets and Visas",
        reglasPredicciones: "Prediction Rules",
        
        // Reglas
        reglasTorneo: "Tournament Rules",
        comoFunciona: "🎯 How It Works",
        creaTorneo: "Create your own tournament with friends and share the unique code with them.",
        uneteTorneo: "Join an existing tournament using the 6-digit code.",
        sistemaPuntos: "🏆 Points System",
        resultadoExacto: "Exact result: 5 points",
        resultadoAcertado: "Correct result (correct winner): 3 points",
        resultadoErroneo: "Wrong result: 0 points",
        modificacionPredicciones: "📅 Prediction Modification",
        prediccionesModificablesHasta: "Predictions can be modified until",
        inclusive: "inclusive",
        despuesSoloNuevas: "After that date, you can only make new predictions for matches that have not yet started but they cannot be modified.",
        partidoComenzado: "Once a match has started, its prediction is locked",
        faseEliminatoriaHabilitada: "Once the group stage is finished, predictions for the knockout stage will be enabled.",
        clasificacionTitle: "🏆 Classification",
        clasificacionActualiza: "The classification is automatically updated according to the actual match results",
        muestraPosicion: "Your position, total points, exact and correct results are shown",
        tablaGlobalMuestra: "The global table shows the combined classification of all tournaments",
        
        // Grupos
        grupo: "Group",
        partidos: "Matches",
        tuPrediccion: "YOUR PREDICTION",
        pendiente: "PENDING",
        jugado: "PLAYED",
        pj: "PJ",
        pg: "PG",
        pe: "PE",
        pp: "PP",
        gf: "GF",
        gc: "GC",
        dg: "DG",
        
        // Modales
        cancelar: "Cancel",
        aceptar: "Accept",
        cerrar: "Close",
        
        // Supabase
        supabaseDesconectado: "Supabase Disconnected",
        supabaseConectado: "Supabase Connected",
        resultadosNoSincronizaran: "Results will no longer sync with Supabase. Changes will be saved locally only. Matches marked as played from Supabase have been cleared. Useful for testing.",
        resultadosSincronizaran: "Results will now sync with Supabase.",
        
        // Predicciones
        prediccionEnviada: "Prediction sent successfully",
        prediccionActualizada: "Prediction updated successfully",
        noSePudieronEnviar: "Could not send predictions",
        yaHasEnviadoPrediccion: "You have already sent a prediction for this tournament. Predictions cannot be modified after June 7.",
        prediccionNoModificable: "Prediction Not Modifiable",
        prediccionesNoModificablesDespues: "Existing predictions cannot be modified after June 7. You can only make new predictions for matches that have not yet started.",
        
        // Otros
        borrarTodo: "Delete All",
        exportarPredicciones: "Export Predictions",
        importarPredicciones: "Import Predictions",
        idioma: "Language",
        español: "Español",
        english: "English"
    }
};

// Obtener idioma actual
function getCurrentLanguage() {
    return localStorage.getItem('idioma') || 'es';
}

// Establecer idioma
function setLanguage(lang) {
    localStorage.setItem('idioma', lang);
}

// Obtener traducción
function t(key) {
    const lang = getCurrentLanguage();
    return translations[lang]?.[key] || translations.es[key] || key;
}

// Función para traducir elementos del DOM
function translatePage() {
    const lang = getCurrentLanguage();
    
    // Traducir elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    
    // Traducir placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    
    // Traducir títulos
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.title = t(key);
    });
}

// Hacer funciones disponibles globalmente
window.translations = translations;
window.getCurrentLanguage = getCurrentLanguage;
window.setLanguage = setLanguage;
window.t = t;
window.translatePage = translatePage;

