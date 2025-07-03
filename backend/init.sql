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
  cpf VARCHAR(14) NOT NULL UNIQUE
);
