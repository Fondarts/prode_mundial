-- Script SQL para subir resultados dummy de grupos a Supabase
-- Ejecutar este script en el SQL Editor de Supabase
-- Simula que los resultados vienen de la API

-- Función para generar un resultado aleatorio realista
CREATE OR REPLACE FUNCTION generar_resultado_dummy()
RETURNS JSONB AS $$
DECLARE
    resultados_comunes JSONB[];
    resultado_seleccionado JSONB;
BEGIN
    -- Array de resultados comunes en fútbol
    resultados_comunes := ARRAY[
        '{"golesLocal": 0, "golesVisitante": 0}'::JSONB,
        '{"golesLocal": 1, "golesVisitante": 0}'::JSONB,
        '{"golesLocal": 0, "golesVisitante": 1}'::JSONB,
        '{"golesLocal": 1, "golesVisitante": 1}'::JSONB,
        '{"golesLocal": 2, "golesVisitante": 0}'::JSONB,
        '{"golesLocal": 0, "golesVisitante": 2}'::JSONB,
        '{"golesLocal": 2, "golesVisitante": 1}'::JSONB,
        '{"golesLocal": 1, "golesVisitante": 2}'::JSONB,
        '{"golesLocal": 2, "golesVisitante": 2}'::JSONB,
        '{"golesLocal": 3, "golesVisitante": 0}'::JSONB,
        '{"golesLocal": 0, "golesVisitante": 3}'::JSONB,
        '{"golesLocal": 3, "golesVisitante": 1}'::JSONB,
        '{"golesVisitante": 1, "golesLocal": 3}'::JSONB,
        '{"golesLocal": 3, "golesVisitante": 2}'::JSONB,
        '{"golesLocal": 2, "golesVisitante": 3}'::JSONB,
        '{"golesLocal": 4, "golesVisitante": 0}'::JSONB,
        '{"golesLocal": 0, "golesVisitante": 4}'::JSONB,
        '{"golesLocal": 4, "golesVisitante": 1}'::JSONB,
        '{"golesLocal": 1, "golesVisitante": 4}'::JSONB,
        '{"golesLocal": 2, "golesVisitante": 4}'::JSONB,
        '{"golesLocal": 4, "golesVisitante": 2}'::JSONB
    ];
    
    -- Seleccionar un resultado aleatorio
    resultado_seleccionado := resultados_comunes[1 + floor(random() * array_length(resultados_comunes, 1))::int];
    
    RETURN resultado_seleccionado;
END;
$$ LANGUAGE plpgsql;

-- Función para generar todos los resultados dummy de grupos
CREATE OR REPLACE FUNCTION generar_resultados_dummy_grupos()
RETURNS JSONB AS $$
DECLARE
    resultados JSONB := '{}'::JSONB;
    grupo_index INTEGER;
    partido_index INTEGER;
    resultado_partido JSONB;
BEGIN
    -- Generar resultados para 12 grupos (índices 0-11)
    FOR grupo_index IN 0..11 LOOP
        resultados := resultados || jsonb_build_object(grupo_index::TEXT, '{}'::JSONB);
        
        -- Cada grupo tiene 6 partidos (índices 0-5)
        FOR partido_index IN 0..5 LOOP
            resultado_partido := generar_resultado_dummy();
            resultados := jsonb_set(
                resultados,
                ARRAY[grupo_index::TEXT, partido_index::TEXT],
                resultado_partido
            );
        END LOOP;
    END LOOP;
    
    RETURN resultados;
END;
$$ LANGUAGE plpgsql;

-- Actualizar todos los torneos con resultados dummy
DO $$
DECLARE
    torneo_record RECORD;
    resultados_dummy JSONB;
    resultados_existentes JSONB;
    resultados_finales JSONB;
    grupo_index TEXT;
    partido_index TEXT;
    resultado_partido JSONB;
BEGIN
    -- Generar resultados dummy una sola vez
    resultados_dummy := generar_resultados_dummy_grupos();
    
    RAISE NOTICE 'Resultados dummy generados para 12 grupos (72 partidos)';
    
    -- Iterar sobre todos los torneos
    FOR torneo_record IN 
        SELECT codigo, resultados_reales 
        FROM torneos
    LOOP
        RAISE NOTICE 'Procesando torneo: %', torneo_record.codigo;
        
        -- Obtener resultados existentes o inicializar vacío
        resultados_existentes := COALESCE(torneo_record.resultados_reales, '{}'::JSONB);
        resultados_finales := resultados_existentes;
        
        -- Combinar resultados dummy con los existentes (los dummy sobrescriben si existen)
        FOR grupo_index IN SELECT * FROM jsonb_object_keys(resultados_dummy) LOOP
            -- Si el grupo no existe en resultados existentes, crearlo
            IF NOT (resultados_finales ? grupo_index) THEN
                resultados_finales := resultados_finales || jsonb_build_object(grupo_index, '{}'::JSONB);
            END IF;
            
            -- Agregar/actualizar partidos del grupo
            FOR partido_index IN 
                SELECT * FROM jsonb_object_keys(resultados_dummy->grupo_index)
            LOOP
                resultado_partido := resultados_dummy->grupo_index->partido_index;
                resultados_finales := jsonb_set(
                    resultados_finales,
                    ARRAY[grupo_index, partido_index],
                    resultado_partido,
                    true  -- crear si no existe
                );
            END LOOP;
        END LOOP;
        
        -- Actualizar el torneo
        UPDATE torneos
        SET resultados_reales = resultados_finales,
            updated_at = NOW()
        WHERE codigo = torneo_record.codigo;
        
        RAISE NOTICE 'Torneo % actualizado correctamente', torneo_record.codigo;
    END LOOP;
    
    RAISE NOTICE 'Proceso completado. Todos los torneos han sido actualizados con resultados dummy.';
END $$;

-- Limpiar funciones temporales (opcional)
-- DROP FUNCTION IF EXISTS generar_resultado_dummy();
-- DROP FUNCTION IF EXISTS generar_resultados_dummy_grupos();

