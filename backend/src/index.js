import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// JWT Secret (em produção deve vir de variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_super_secreto_aqui';

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

app.get('/', (req, res) => {
  res.send('API do Prontuário Eletrônico');
});

// Endpoint de login
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validar campos obrigatórios
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário no banco
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const usuario = rows[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        nome: usuario.nome 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint de recuperação de senha
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório' });
    }

    // Verificar se o usuário existe
    const query = 'SELECT id, email, nome FROM usuarios WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      // Por segurança, retornamos sucesso mesmo se o email não existir
      // Isso evita que atacantes descubram emails válidos
      return res.json({ 
        message: 'Se o e-mail existir em nossa base, você receberá as instruções de recuperação.' 
      });
    }

    const usuario = result.rows[0];

    // Gerar token de recuperação de senha
    const resetToken = jwt.sign(
      { 
        userId: usuario.id,
        email: usuario.email,
        type: 'password-reset' 
      },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expira em 1 hora
    );

    // Em um ambiente real, você enviaria um e-mail aqui
    // Por enquanto, vamos apenas logar o token (APENAS PARA DESENVOLVIMENTO)
    console.log('=== TOKEN DE RECUPERAÇÃO DE SENHA ===');
    console.log(`Usuário: ${usuario.nome} (${usuario.email})`);
    console.log(`Token: ${resetToken}`);
    console.log(`Link de recuperação: ${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`);
    console.log('=====================================');

    // TODO: Implementar envio de e-mail real
    // await sendPasswordResetEmail(usuario.email, resetToken);

    res.json({ 
      message: 'As instruções para recuperação de senha foram enviadas para seu e-mail.' 
    });

  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Executa o script de criação da tabela ao iniciar o backend (apenas em ambiente de desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  const initSql = fs.readFileSync(new URL('../init.sql', import.meta.url), 'utf8');
  pool.query(initSql)
    .then(() => console.log('Script de inicialização executado com sucesso.'))
    .catch(err => console.error('Erro ao executar script de inicialização:', err));
}

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

app.get('/api/pacientes', authenticateToken, async (req, res) => {
  const { nome, mae, nascimento } = req.query;
  let query = 'SELECT * FROM pacientes';
  let params = [];
  
  if (nome && mae) {
    // Busca por nome e mãe (para validação de duplicidade)
    query += ' WHERE LOWER(nome) = LOWER($1) AND LOWER(mae) = LOWER($2)';
    params = [nome, mae];
  } else if (nome && nascimento) {
    // Busca por nome e nascimento
    query += ' WHERE nome = $1 AND nascimento = $2';
    params = [nome, nascimento];
  } else if (nome) {
    // Busca apenas por nome
    query += ' WHERE nome = $1';
    params = [nome];
  } else if (nascimento) {
    // Busca apenas por nascimento
    query += ' WHERE nascimento = $1';
    params = [nascimento];
  }
  
  query += ' ORDER BY id DESC';
  try {
    const { rows } = await pool.query(query, params);
    res.json(rows.map(mapPacienteDbToApi));
  } catch (err) {
    console.error('Erro ao buscar pacientes:', err);
    res.status(500).json({ error: 'Erro ao buscar pacientes' });
  }
});

app.post('/api/pacientes', authenticateToken, async (req, res) => {
  const {
    nome, mae, nascimento, sexo, estadoCivil, profissao, escolaridade, raca, endereco, bairro, municipio, uf, cep, acompanhante, procedencia
  } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO pacientes (
        nome, mae, nascimento, sexo, estado_civil, profissao, escolaridade, raca, endereco, bairro, municipio, uf, cep, acompanhante, procedencia
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [nome, mae, nascimento, sexo, estadoCivil, profissao, escolaridade, raca, endereco, bairro, municipio, uf, cep, acompanhante, procedencia]
    );
    res.status(201).json(mapPacienteDbToApi(rows[0]));
  } catch (err) {
    if (err.code === '23505') { // unique_violation
      return res.status(409).json({ error: 'Já existe paciente com este nome e data de nascimento.' });
    }
    console.error('Erro ao cadastrar paciente:', err);
    res.status(400).json({ error: 'Erro ao cadastrar paciente', details: err.message });
  }
});

app.delete('/api/pacientes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM pacientes WHERE id = $1', [id]);
  res.status(204).send();
});

app.put('/api/pacientes/:id', authenticateToken, async (req, res) => {
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

app.options('*', cors());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
