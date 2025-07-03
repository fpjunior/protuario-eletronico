import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get('/', (req, res) => {
  res.send('API do Prontuário Eletrônico');
});

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
    procedencia: p.procedencia,
    cpf: p.cpf
  };
}

app.get('/pacientes', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM pacientes ORDER BY id DESC');
  res.json(rows.map(mapPacienteDbToApi));
});

app.post('/pacientes', async (req, res) => {
  const {
    nome, mae, nascimento, sexo, estadoCivil, profissao, escolaridade, raca, endereco, bairro, municipio, uf, cep, acompanhante, procedencia, cpf
  } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO pacientes (
      nome, mae, nascimento, sexo, estado_civil, profissao, escolaridade, raca, endereco, bairro, municipio, uf, cep, acompanhante, procedencia, cpf
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [nome, mae, nascimento, sexo, estadoCivil, profissao, escolaridade, raca, endereco, bairro, municipio, uf, cep, acompanhante, procedencia, cpf]
  );
  res.status(201).json(mapPacienteDbToApi(rows[0]));
});

app.delete('/pacientes/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM pacientes WHERE id = $1', [id]);
  res.status(204).send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
