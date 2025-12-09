-- Script para agregar campos de torneo privado
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar columna es_privado (boolean, default false)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'torneos' 
        AND column_name = 'es_privado'
    ) THEN
        ALTER TABLE torneos 
        ADD COLUMN es_privado BOOLEAN DEFAULT false;
        RAISE NOTICE 'Columna es_privado agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna es_privado ya existe';
    END IF;
END $$;

-- Agregar columna clave (VARCHAR para la contraseña del torneo privado)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'torneos' 
        AND column_name = 'clave'
    ) THEN
        ALTER TABLE torneos 
        ADD COLUMN clave VARCHAR(50);
        RAISE NOTICE 'Columna clave agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna clave ya existe';
    END IF;
END $$;

