-- Script para agregar la columna usuario_id a la tabla participantes
-- Ejecuta este script en el SQL Editor de Supabase si la columna no existe

-- Verificar si la columna existe y agregarla si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'participantes' 
        AND column_name = 'usuario_id'
    ) THEN
        -- Agregar la columna
        ALTER TABLE participantes 
        ADD COLUMN usuario_id VARCHAR(100);
        
        -- Agregar el índice único (solo si no existe)
        -- Nota: PostgreSQL permite múltiples NULL en UNIQUE, así que esto funcionará
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_constraint 
            WHERE conname = 'participantes_torneo_id_usuario_id_key'
        ) THEN
            ALTER TABLE participantes 
            ADD CONSTRAINT participantes_torneo_id_usuario_id_key 
            UNIQUE(torneo_id, usuario_id);
        END IF;
        
        RAISE NOTICE 'Columna usuario_id agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna usuario_id ya existe';
    END IF;
END $$;

