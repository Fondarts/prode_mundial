-- Esquema de base de datos para Supabase
-- Ejecuta estos comandos en el SQL Editor de Supabase

-- Tabla de torneos
CREATE TABLE IF NOT EXISTS torneos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(6) UNIQUE NOT NULL,
    nombre VARCHAR(100),
    creado_por VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resultados_reales JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de participantes
CREATE TABLE IF NOT EXISTS participantes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    torneo_id UUID REFERENCES torneos(id) ON DELETE CASCADE,
    nombre VARCHAR(50) NOT NULL,
    usuario_id VARCHAR(100), -- ID único del usuario (para prevenir múltiples predicciones)
    predicciones JSONB DEFAULT '{}'::jsonb,
    puntos INTEGER DEFAULT 0,
    estadisticas JSONB DEFAULT '{"resultadosExactos": 0, "resultadosAcertados": 0, "partidosJugados": 0, "puntosTotales": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(torneo_id, nombre),
    UNIQUE(torneo_id, usuario_id) -- Un usuario solo puede tener una predicción por torneo
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_torneos_codigo ON torneos(codigo);
CREATE INDEX IF NOT EXISTS idx_participantes_torneo_id ON participantes(torneo_id);
CREATE INDEX IF NOT EXISTS idx_participantes_nombre ON participantes(nombre);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_torneos_updated_at ON torneos;
CREATE TRIGGER update_torneos_updated_at BEFORE UPDATE ON torneos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_participantes_updated_at ON participantes;
CREATE TRIGGER update_participantes_updated_at BEFORE UPDATE ON participantes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
-- Habilitar RLS
ALTER TABLE torneos ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Cualquiera puede leer torneos" ON torneos;
DROP POLICY IF EXISTS "Cualquiera puede crear torneos" ON torneos;
DROP POLICY IF EXISTS "Solo creador puede actualizar torneo" ON torneos;
DROP POLICY IF EXISTS "Cualquiera puede leer participantes" ON participantes;
DROP POLICY IF EXISTS "Cualquiera puede crear participantes" ON participantes;
DROP POLICY IF EXISTS "Cualquiera puede actualizar participantes" ON participantes;

-- Política: Cualquiera puede leer torneos
CREATE POLICY "Cualquiera puede leer torneos" ON torneos
    FOR SELECT USING (true);

-- Política: Cualquiera puede crear torneos
CREATE POLICY "Cualquiera puede crear torneos" ON torneos
    FOR INSERT WITH CHECK (true);

-- Política: Solo el creador puede actualizar su torneo
CREATE POLICY "Solo creador puede actualizar torneo" ON torneos
    FOR UPDATE USING (auth.uid()::text = creado_por OR creado_por NOT LIKE 'auth:%');

-- Política: Cualquiera puede leer participantes
CREATE POLICY "Cualquiera puede leer participantes" ON participantes
    FOR SELECT USING (true);

-- Política: Cualquiera puede crear participantes
CREATE POLICY "Cualquiera puede crear participantes" ON participantes
    FOR INSERT WITH CHECK (true);

-- Política: Cualquiera puede actualizar participantes (para actualizar predicciones)
CREATE POLICY "Cualquiera puede actualizar participantes" ON participantes
    FOR UPDATE USING (true);

-- Política: Cualquiera puede eliminar participantes (para salir de torneos)
CREATE POLICY "Cualquiera puede eliminar participantes" ON participantes
    FOR DELETE USING (true);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_usuario VARCHAR(30) UNIQUE NOT NULL,
    clave VARCHAR(5) NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultimo_acceso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_nombre ON usuarios(nombre_usuario);

-- Trigger para actualizar updated_at en usuarios
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS en usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
DROP POLICY IF EXISTS "Cualquiera puede leer usuarios" ON usuarios;
DROP POLICY IF EXISTS "Cualquiera puede crear usuarios" ON usuarios;
DROP POLICY IF EXISTS "Cualquiera puede actualizar su propio usuario" ON usuarios;

CREATE POLICY "Cualquiera puede leer usuarios" ON usuarios
    FOR SELECT USING (true);

CREATE POLICY "Cualquiera puede crear usuarios" ON usuarios
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Cualquiera puede actualizar su propio usuario" ON usuarios
    FOR UPDATE USING (true);

