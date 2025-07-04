import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'https://protuario-eletronico-t3wu.vercel.app'
}));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get('/', (req, res) => {
  res.send('API do Prontuário Eletrônico');
});

// Executa o script de criação da tabela ao iniciar o backend
const initSql = fs.readFileSync(new URL('../init.sql', import.meta.url), 'utf8');
pool.query(initSql)
  .then(() => console.log('Script de inicialização executado com sucesso.'))
  .catch(err => console.error('Erro ao executar script de inicialização:', err));

// CRUD Pacientes
function mapPacienteDbToApi(p) {
  return {
    id: p.id,
    nome: p.nome,
    mae: p.mae,
    nascimento: p.nascimento,
    sexo: p.sexo,
    estadoCivil: p.estado_civil,
    profissao: p.profissao,
    escolaridade: p.escolaridade,
    raca: p.raca,
    endereco: p.endereco,
    bairro: p.bairro,
    municipio: p.municipio,
    uf: p.uf,
    cep: p.cep,
    acompanhante: p.acompanhante,
    procedencia: p.procedencia
  };
}

app.get('/pacientes', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM pacientes ORDER BY id DESC');
  res.json(rows.map(mapPacienteDbToApi));
});

app.post('/pacientes', async (req, res) => {
  const {
    nome, mae, nascimento, sexo, estadoCivil, profissao, escolaridade, raca, endereco, bairro, municipio, uf, cep, acompanhante, procedencia
  } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO pacientes (
      nome, mae, nascimento, sexo, estado_civil, profissao, escolaridade, raca, endereco, bairro, municipio, uf, cep, acompanhante, procedencia
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [nome, mae, nascimento, sexo, estadoCivil, profissao, escolaridade, raca, endereco, bairro, municipio, uf, cep, acompanhante, procedencia]
  );
  res.status(201).json(mapPacienteDbToApi(rows[0]));
});

app.delete('/pacientes/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM pacientes WHERE id = $1', [id]);
  res.status(204).send();
});

app.put('/pacientes/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nome, mae, nascimento, sexo, estadoCivil, profissao, escolaridade, raca, endereco, bairro, municipio, uf, cep, acompanhante, procedencia
  } = req.body;
  const { rows } = await pool.query(
    `UPDATE pacientes SET
      nome = $1,
      mae = $2,
      nascimento = $3,
      sexo = $4,
      estado_civil = $5,
      profissao = $6,
      escolaridade = $7,
      raca = $8,
      endereco = $9,
      bairro = $10,
      municipio = $11,
      uf = $12,
      cep = $13,
      acompanhante = $14,
      procedencia = $15
    WHERE id = $16
    RETURNING *`,
    [nome, mae, nascimento, sexo, estadoCivil, profissao, escolaridade, raca, endereco, bairro, municipio, uf, cep, acompanhante, procedencia, id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Paciente não encontrado' });
  }
  res.json(mapPacienteDbToApi(rows[0]));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
