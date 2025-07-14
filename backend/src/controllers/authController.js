import Usuario from '../models/Usuario.js';
import { generateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import emailService from '../services/emailService.js';

class AuthController {
  /**
   * Login do usuário
   */
  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        throw new AppError('Email e senha são obrigatórios', 400, 'MISSING_CREDENTIALS');
      }

      // Buscar usuário por email
      const usuario = await Usuario.findByEmail(email);
      if (!usuario) {
        throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
      }

      // Verificar senha
      const senhaValida = await usuario.checkPassword(senha);
      if (!senhaValida) {
        throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
      }

      // Gerar token JWT
      const token = generateToken({
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome
      });

      console.log(`✅ [AUTH] Login realizado: ${usuario.email}`);

      // COMPATIBILIDADE COM PRODUÇÃO - Formato original esperado pelo frontend
      res.json({
        token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome
        }
      });

    } catch (error) {
      console.error('❌ [AUTH] Erro no login:', error);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: 'ERROR',
          message: error.message,
          code: error.code
        });
      }

      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Registro de novo usuário
   */
  static async register(req, res) {
    try {
      const { email, senha, nome } = req.body;

      if (!email || !senha || !nome) {
        throw new AppError('Email, senha e nome são obrigatórios', 400, 'MISSING_FIELDS');
      }

      if (senha.length < 6) {
        throw new AppError('Senha deve ter pelo menos 6 caracteres', 400, 'WEAK_PASSWORD');
      }

      // Criar usuário
      const novoUsuario = await Usuario.create({
        email,
        senha,
        nome
      });

      console.log(`✅ [AUTH] Usuário criado: ${novoUsuario.email}`);

      res.status(201).json({
        status: 'SUCCESS',
        message: 'Usuário criado com sucesso',
        data: {
          user: novoUsuario.toPublicJSON()
        }
      });

    } catch (error) {
      console.error('❌ [AUTH] Erro no registro:', error);
      
      if (error.message.includes('já está em uso')) {
        return res.status(409).json({
          status: 'ERROR',
          message: 'Email já está em uso',
          code: 'EMAIL_EXISTS'
        });
      }

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: 'ERROR',
          message: error.message,
          code: error.code
        });
      }

      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Logout (invalidar token - implementação básica)
   */
  static async logout(req, res) {
    try {
      // Em uma implementação completa, você poderia adicionar o token a uma blacklist
      console.log(`✅ [AUTH] Logout realizado: ${req.user?.email}`);

      res.json({
        status: 'SUCCESS',
        message: 'Logout realizado com sucesso'
      });

    } catch (error) {
      console.error('❌ [AUTH] Erro no logout:', error);
      
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Obter dados do usuário atual
   */
  static async me(req, res) {
    try {
      const usuario = await Usuario.findById(req.user.id);
      
      if (!usuario) {
        throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
      }

      res.json({
        status: 'SUCCESS',
        data: {
          user: usuario.toPublicJSON()
        }
      });

    } catch (error) {
      console.error('❌ [AUTH] Erro ao obter dados do usuário:', error);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: 'ERROR',
          message: error.message,
          code: error.code
        });
      }

      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Alterar senha
   */
  static async changePassword(req, res) {
    try {
      const { senhaAtual, novaSenha } = req.body;

      if (!senhaAtual || !novaSenha) {
        throw new AppError('Senha atual e nova senha são obrigatórias', 400, 'MISSING_PASSWORDS');
      }

      if (novaSenha.length < 6) {
        throw new AppError('Nova senha deve ter pelo menos 6 caracteres', 400, 'WEAK_PASSWORD');
      }

      // Buscar usuário
      const usuario = await Usuario.findById(req.user.id);
      if (!usuario) {
        throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
      }

      // Verificar senha atual
      const senhaValida = await usuario.checkPassword(senhaAtual);
      if (!senhaValida) {
        throw new AppError('Senha atual incorreta', 401, 'WRONG_PASSWORD');
      }

      // Atualizar senha
      await usuario.updatePassword(novaSenha);

      console.log(`✅ [AUTH] Senha alterada: ${usuario.email}`);

      res.json({
        status: 'SUCCESS',
        message: 'Senha alterada com sucesso'
      });

    } catch (error) {
      console.error('❌ [AUTH] Erro ao alterar senha:', error);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: 'ERROR',
          message: error.message,
          code: error.code
        });
      }

      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Verificar token
   */
  static async verifyToken(req, res) {
    try {
      const usuario = await Usuario.findById(req.user.id);
      
      if (!usuario) {
        throw new AppError('Token inválido', 401, 'INVALID_TOKEN');
      }

      res.json({
        status: 'SUCCESS',
        message: 'Token válido',
        data: {
          user: usuario.toPublicJSON()
        }
      });

    } catch (error) {
      console.error('❌ [AUTH] Erro ao verificar token:', error);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: 'ERROR',
          message: error.message,
          code: error.code
        });
      }

      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Recuperação de senha - COMPATIBILIDADE COM PRODUÇÃO
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'E-mail é obrigatório' });
      }

      // Verificar se o usuário existe
      const usuario = await Usuario.findByEmail(email);

      if (!usuario) {
        // Por segurança, retornamos sucesso mesmo se o email não existir
        // Isso evita que atacantes descubram emails válidos
        return res.json({ 
          message: 'Se o e-mail existir em nossa base, você receberá as instruções de recuperação.' 
        });
      }

      // Gerar token de recuperação de senha
      const resetToken = jwt.sign(
        { 
          userId: usuario.id,
          email: usuario.email,
          type: 'password-reset' 
        },
        config.JWT_SECRET,
        { expiresIn: '1h' } // Token expira em 1 hora
      );

      // Logs para desenvolvimento
      console.log('=== TOKEN DE RECUPERAÇÃO DE SENHA ===');
      console.log(`Usuário: ${usuario.nome} (${usuario.email})`);
      console.log(`Token: ${resetToken}`);
      console.log(`Link de recuperação: ${config.FRONTEND_URL}/reset-password?token=${resetToken}`);
      console.log('=====================================');

      try {
        // Enviar email de recuperação usando o serviço de email
        await emailService.sendPasswordResetEmail(usuario.email, resetToken, usuario.nome);
        console.log(`✅ Email de recuperação enviado para: ${usuario.email}`);
      } catch (emailError) {
        console.error('❌ Erro ao enviar email:', emailError.message);
        // Mesmo com erro no email, retornamos sucesso por segurança
      }

      res.json({ 
        message: 'As instruções para recuperação de senha foram enviadas para seu e-mail.' 
      });

    } catch (error) {
      console.error('❌ [AUTH] Erro na recuperação de senha:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default AuthController;
