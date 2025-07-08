DROP TABLE IF EXISTS pacientes;
DROP TABLE IF EXISTS usuarios;

-- Tabela de usuários para autenticação
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  nome VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pacientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  mae VARCHAR(100),
  nascimento DATE NOT NULL,
  sexo VARCHAR(1),
  estado_civil VARCHAR(20),
  profissao VARCHAR(50),
  escolaridade VARCHAR(50),
  raca VARCHAR(20),
  endereco VARCHAR(150),
  bairro VARCHAR(50),
  municipio VARCHAR(50),
  uf VARCHAR(2),
  cep VARCHAR(9),
  acompanhante VARCHAR(100),
  procedencia VARCHAR(100),
  CONSTRAINT unique_nome_nascimento UNIQUE (nome, nascimento)
);

INSERT INTO pacientes (nome, mae, nascimento, sexo, estado_civil, profissao, escolaridade, raca, endereco, bairro, municipio, uf, cep, acompanhante, procedencia)
VALUES
  ('Joao Silva', 'Maria Silva45', '1980-05-10', 'M', 'Solteiro', 'Professor', 'Superior', 'Branca', 'Rua das Flores, 123', 'Centro', 'Sao Paulo', 'SP', '01001-000', 'Carlos Silva', 'Residencia'),
  ('Ana Souza', 'Clara Souza', '1992-11-23', 'F', 'Casada', 'Enfermeira', 'Medio', 'Parda', 'Av. Brasil, 456', 'Jardim', 'Rio de Janeiro', 'RJ', '20000-000', 'Paulo Souza', 'Hospital'),
  ('Marcos Lima', 'Helena Lima', '1975-03-15', 'M', 'Divorciado', 'Engenheiro', 'Superior', 'Preta', 'Rua Verde, 789', 'Industrial', 'Belo Horizonte', 'MG', '30000-000', 'Lucas Lima', 'Clinica');

-- Inserir usuários de teste (senha: 123456)
INSERT INTO usuarios (email, senha, nome) VALUES
  ('admin@alianca.com', '$2b$12$fTaXt0BM9Hz/e4PfjvI..uk2yr8d.iqBdXwEsP0gIhKiRtS5bCpfS', 'Administrador'),
  ('medico@alianca.com', '$2b$12$fTaXt0BM9Hz/e4PfjvI..uk2yr8d.iqBdXwEsP0gIhKiRtS5bCpfS', 'Dr. João Silva'),
  ('medico1@teste.com', '$2b$12$fTaXt0BM9Hz/e4PfjvI..uk2yr8d.iqBdXwEsP0gIhKiRtS5bCpfS', 'Dr. Teste'),
  ('enfermeiro@alianca.com', '$2b$12$fTaXt0BM9Hz/e4PfjvI..uk2yr8d.iqBdXwEsP0gIhKiRtS5bCpfS', 'Enfermeiro Paulo')
ON CONFLICT (email) DO NOTHING;