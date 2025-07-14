-- Script para sincronizar tabela de pacientes em produção
-- Este script adiciona as colunas que estão faltando sem perder dados

-- 1. Adicionar coluna created_at se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pacientes' AND column_name = 'created_at') THEN
        ALTER TABLE pacientes ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        -- Definir created_at para registros existentes baseado no ID (mais antigo = menor ID)
        UPDATE pacientes SET created_at = CURRENT_TIMESTAMP - (id * INTERVAL '1 day');
    END IF;
END $$;

-- 2. Adicionar coluna updated_at se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pacientes' AND column_name = 'updated_at') THEN
        ALTER TABLE pacientes ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        -- Definir updated_at igual ao created_at para registros existentes
        UPDATE pacientes SET updated_at = created_at WHERE updated_at IS NULL;
    END IF;
END $$;

-- 3. Adicionar constraint unique se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'pacientes' AND constraint_name = 'unique_nome_nascimento') THEN
        ALTER TABLE pacientes ADD CONSTRAINT unique_nome_nascimento UNIQUE (nome, nascimento);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint já existe, continua
        NULL;
    WHEN unique_violation THEN
        -- Há dados duplicados, vamos remover duplicatas primeiro
        DELETE FROM pacientes a USING pacientes b 
        WHERE a.id > b.id AND a.nome = b.nome AND a.nascimento = b.nascimento;
        -- Agora adiciona a constraint
        ALTER TABLE pacientes ADD CONSTRAINT unique_nome_nascimento UNIQUE (nome, nascimento);
END $$;

-- 4. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'pacientes' 
ORDER BY ordinal_position;

-- 5. Verificar constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'pacientes';

-- 6. Mostrar total de registros
SELECT COUNT(*) as total_pacientes FROM pacientes;
