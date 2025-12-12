-- Agregar política RLS para permitir eliminar participantes
-- Ejecuta este script en el SQL Editor de Supabase

-- Eliminar política existente si existe
DROP POLICY IF EXISTS "Cualquiera puede eliminar participantes" ON participantes;

-- Política: Cualquiera puede eliminar participantes (para salir de torneos)
CREATE POLICY "Cualquiera puede eliminar participantes" ON participantes
    FOR DELETE USING (true);

