DROP TABLE IF EXISTS pacientes;

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