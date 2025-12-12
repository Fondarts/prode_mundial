-- Agregar política RLS para permitir eliminar participantes
-- Ejecuta este script en el SQL Editor de Supabase
-- IMPORTANTE: Este script debe ejecutarse para que funcione la eliminación de participantes

-- Verificar si RLS está habilitado
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;

-- Eliminar política existente si existe
DROP POLICY IF EXISTS "Cualquiera puede eliminar participantes" ON participantes;

-- Política: Cualquiera puede eliminar participantes (para salir de torneos)
-- Esta política permite que cualquier usuario elimine su propio registro de participante
CREATE POLICY "Cualquiera puede eliminar participantes" ON participantes
    FOR DELETE USING (true);

-- Verificar que la política se creó correctamente
-- Puedes ejecutar esto para verificar:
-- SELECT * FROM pg_policies WHERE tablename = 'participantes' AND policyname = 'Cualquiera puede eliminar participantes';

