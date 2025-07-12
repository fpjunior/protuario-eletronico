import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

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
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// JWT Secret (em produção deve vir de variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_super_secreto_aqui';

// Configuração do Nodemailer
let transporter;

async function createEmailTransporter() {
  // Se as variáveis de ambiente estão configuradas, use Gmail
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'sua_senha_de_app_aqui') {
    console.log('📧 Configurando Gmail para envio de emails...');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Use Ethereal para teste (email de desenvolvimento)
    console.log('🧪 Configurando Ethereal (email de teste) para desenvolvimento...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log('📧 Credenciais de teste criadas:');
    console.log('   User:', testAccount.user);
    console.log('   Pass:', testAccount.pass);
  }
  
  // Verificar conexão
  try {
    await transporter.verify();
    console.log('✅ Conexão de email estabelecida com sucesso!');
  } catch (error) {
    console.error('❌ Erro na conexão de email:', error.message);
  }
}

// Inicializar transporter
createEmailTransporter();

// Função para enviar email de recuperação de senha
async function sendPasswordResetEmail(email, resetToken, userName) {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"e-Prontuário Aliança-PE" <noreply@alianca.com>',
    to: email,
    subject: 'Recuperação de Senha - e-Prontuário',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; margin: 0;">e-Prontuário</h1>
          <p style="color: #7f8c8d; margin: 5px 0;">Aliança-PE - Sistema de Gerenciamento</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; border-left: 4px solid #667eea;">
          <h2 style="color: #2c3e50; margin-top: 0;">Recuperação de Senha</h2>
          <p style="color: #34495e; line-height: 1.6;">
            Olá <strong>${userName}</strong>,
          </p>
          <p style="color: #34495e; line-height: 1.6;">
            Recebemos uma solicitação para redefinir a senha da sua conta no e-Prontuário. 
            Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      font-weight: bold; 
                      display: inline-block;">
              Redefinir Senha
            </a>
          </div>
          
          <p style="color: #7f8c8d; font-size: 14px; line-height: 1.5;">
            Este link é válido por <strong>1 hora</strong> e pode ser usado apenas uma vez.
          </p>
          
          <p style="color: #7f8c8d; font-size: 14px; line-height: 1.5;">
            Se você não solicitou esta alteração, pode ignorar este email com segurança. 
            Sua senha atual permanece inalterada.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
          
          <p style="color: #95a5a6; font-size: 12px; text-align: center;">
            Este é um email automático. Por favor, não responda a esta mensagem.<br>
            Se você está tendo problemas com o botão acima, copie e cole o link abaixo no seu navegador:<br>
            <span style="word-break: break-all;">${resetLink}</span>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #95a5a6; font-size: 12px;">
          © 2025 Aliança-PE. Todos os direitos reservados.
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado com sucesso:', info.messageId);
    
    // Se estiver usando Ethereal (teste), mostrar link de preview
    if (info.messageId && transporter.options && transporter.options.host === 'smtp.ethereal.email') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('🔗 Preview do email (Ethereal):', previewUrl);
      console.log('📧 Abra o link acima para ver o email enviado');
    }
    
    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw error;
  }
}

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

// Endpoint de health check para diagnóstico
app.get('/api/health', async (req, res) => {
  try {
    // Verificar se a URL do banco está definida
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não está definida');
    }

    console.log('🔍 Testando conexão com banco...');
    const dbTest = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com banco funcionando');

    res.json({
      status: 'OK',
      message: 'API funcionando corretamente',
      database: 'Conectado',
      timestamp: dbTest.rows[0].now,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        FRONTEND_URL: process.env.FRONTEND_URL,
        HAS_DATABASE_URL: !!process.env.DATABASE_URL,
        HAS_JWT_SECRET: !!process.env.JWT_SECRET,
        DATABASE_URL_LENGTH: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
        JWT_SECRET_LENGTH: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
      }
    });
  } catch (error) {
    console.error('❌ Erro no health check:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Erro na API',
      database: 'Erro de conexão',
      error: error.message,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        FRONTEND_URL: process.env.FRONTEND_URL,
        HAS_DATABASE_URL: !!process.env.DATABASE_URL,
        HAS_JWT_SECRET: !!process.env.JWT_SECRET,
        DATABASE_URL_LENGTH: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
        JWT_SECRET_LENGTH: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
      }
    });
  }
});

// Endpoint de login
app.post('/api/login', async (req, res) => {
  try {
    console.log('📝 Tentativa de login recebida');
    const { email, senha } = req.body;

    // Validar campos obrigatórios
    if (!email || !senha) {
      console.log('❌ Campos obrigatórios ausentes');
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    console.log(`📧 Buscando usuário: ${email}`);
    
    // Buscar usuário no banco
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const usuario = rows[0];
    console.log('✅ Usuário encontrado, verificando senha');

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      console.log('❌ Senha inválida');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log('✅ Login bem-sucedido, gerando token');

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
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
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

    // Logs para desenvolvimento
    console.log('=== TOKEN DE RECUPERAÇÃO DE SENHA ===');
    console.log(`Usuário: ${usuario.nome} (${usuario.email})`);
    console.log(`Token: ${resetToken}`);
    console.log(`Link de recuperação: ${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`);
    console.log('=====================================');

    try {
      // Enviar e-mail de recuperação
      await sendPasswordResetEmail(usuario.email, resetToken, usuario.nome);
      console.log(`✅ Email de recuperação enviado para: ${usuario.email}`);
    } catch (emailError) {
      console.error('❌ Erro ao enviar email:', emailError.message);
      // Mesmo com erro no email, retornamos sucesso por segurança
      // Em produção, você pode querer logar este erro para monitoramento
    }

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

// ENDPOINT TEMPORÁRIO: Criar usuário de teste (REMOVER EM PRODUÇÃO)
app.post('/api/create-test-user', async (req, res) => {
  try {
    console.log('🔧 Criando usuário de teste...');
    
    // Verificar se a tabela usuarios existe
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      );
    `);
    
    if (!checkTable.rows[0].exists) {
      console.log('📋 Criando tabela usuarios...');
      await pool.query(`
        CREATE TABLE usuarios (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          senha VARCHAR(255) NOT NULL,
          nome VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabela usuarios criada!');
    }

    // Verificar se já existe um usuário teste
    const existingUser = await pool.query('SELECT * FROM usuarios WHERE email = $1', ['admin@teste.com']);
    
    if (existingUser.rows.length > 0) {
      return res.json({
        message: 'Usuário teste já existe',
        email: 'admin@teste.com',
        senha: '123456'
      });
    }

    // Criar senha hash
    const senhaHash = await bcrypt.hash('123456', 10);
    
    // Inserir usuário teste
    const result = await pool.query(
      'INSERT INTO usuarios (email, senha, nome) VALUES ($1, $2, $3) RETURNING *',
      ['admin@teste.com', senhaHash, 'Administrador Teste']
    );
    
    console.log('🎉 Usuário teste criado com sucesso!');
    
    res.json({
      message: 'Usuário teste criado com sucesso!',
      email: 'admin@teste.com',
      senha: '123456',
      usuario: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        nome: result.rows[0].nome
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário teste:', error);
    res.status(500).json({ 
      error: 'Erro ao criar usuário teste', 
      details: error.message 
    });
  }
});

// ENDPOINT TEMPORÁRIO: Listar usuários (REMOVER EM PRODUÇÃO)
app.get('/api/list-users', async (req, res) => {
  try {
    console.log('📋 Listando usuários...');
    
    // Verificar se a tabela usuarios existe
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      );
    `);
    
    if (!checkTable.rows[0].exists) {
      return res.json({
        message: 'Tabela usuarios não existe',
        users: []
      });
    }

    // Listar usuários (sem senhas)
    const result = await pool.query('SELECT id, email, nome, created_at FROM usuarios ORDER BY id');
    
    res.json({
      message: 'Usuários encontrados',
      count: result.rows.length,
      users: result.rows
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    res.status(500).json({ 
      error: 'Erro ao listar usuários', 
      details: error.message 
    });
  }
});

// Endpoint de diagnóstico detalhado da conexão
app.get('/api/debug-connection', async (req, res) => {
  try {
    console.log('🔍 Diagnóstico detalhado da conexão...');
    
    // Informações da URL (sem revelar senha)
    const dbUrl = process.env.DATABASE_URL;
    const urlParts = dbUrl ? dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:\/]+):?(\d+)?\/(.+)/) : null;
    
    const diagnostics = {
      hasUrl: !!dbUrl,
      urlLength: dbUrl ? dbUrl.length : 0,
      parsedUrl: urlParts ? {
        user: urlParts[1],
        passwordLength: urlParts[2] ? urlParts[2].length : 0,
        host: urlParts[3],
        port: urlParts[4] || '5432',
        database: urlParts[5]
      } : null,
      environment: process.env.NODE_ENV,
      sslConfig: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };

    // Teste básico de conexão
    console.log('🔗 Testando conexão básica...');
    const client = await pool.connect();
    
    console.log('✅ Cliente conectado, testando query...');
    const result = await client.query('SELECT NOW() as timestamp, version() as pg_version');
    
    client.release();
    console.log('✅ Query executada com sucesso');
    
    res.json({
      status: 'SUCCESS',
      message: 'Conexão estabelecida com sucesso',
      diagnostics,
      database: {
        connected: true,
        timestamp: result.rows[0].timestamp,
        version: result.rows[0].pg_version
      }
    });

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Erro na conexão',
      error: {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      },
      diagnostics: {
        hasUrl: !!process.env.DATABASE_URL,
        urlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
        environment: process.env.NODE_ENV
      }
    });
  }
});

app.options('*', cors());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
