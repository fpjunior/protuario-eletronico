-- Versão simplificada: Migração para Produção
-- Execute cada comando separadamente no Render

-- 1. Adicionar coluna created_at
ALTER TABLE pacientes ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Definir created_at para registros existentes (opcional)
UPDATE pacientes SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;

-- 3. Adicionar coluna updated_at
ALTER TABLE pacientes ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 4. Definir updated_at para registros existentes
UPDATE pacientes SET updated_at = created_at WHERE updated_at IS NULL;

-- 5. Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'pacientes' 
ORDER BY ordinal_position;
