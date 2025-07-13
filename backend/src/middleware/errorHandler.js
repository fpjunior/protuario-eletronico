import config from '../config/env.js';

/**
 * Middleware global de tratamento de erros
 */
export const errorHandler = (err, req, res, next) => {
  console.error('💥 [ERROR]', err);

  // Erro de validação do express-validator
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'ERROR',
      message: 'JSON inválido',
      code: 'INVALID_JSON'
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'ERROR',
      message: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'ERROR',
      message: 'Token expirado',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Erro de banco de dados
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          status: 'ERROR',
          message: 'Registro já existe',
          code: 'DUPLICATE_ENTRY'
        });
      
      case '23503': // Foreign key violation
        return res.status(400).json({
          status: 'ERROR',
          message: 'Referência inválida',
          code: 'FOREIGN_KEY_VIOLATION'
        });
      
      case '23502': // Not null violation
        return res.status(400).json({
          status: 'ERROR',
          message: 'Campo obrigatório não informado',
          code: 'REQUIRED_FIELD_MISSING'
        });
      
      case 'ECONNREFUSED':
        return res.status(503).json({
          status: 'ERROR',
          message: 'Serviço temporariamente indisponível',
          code: 'SERVICE_UNAVAILABLE'
        });
    }
  }

  // Erro de CORS
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      status: 'ERROR',
      message: 'Origem não permitida',
      code: 'CORS_ERROR'
    });
  }

  // Erro de arquivo muito grande
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      status: 'ERROR',
      message: 'Arquivo muito grande',
      code: 'FILE_TOO_LARGE'
    });
  }

  // Erro padrão
  const statusCode = err.statusCode || err.status || 500;
  const message = config.NODE_ENV === 'production' 
    ? 'Erro interno do servidor' 
    : err.message;

  res.status(statusCode).json({
    status: 'ERROR',
    message,
    code: 'INTERNAL_ERROR',
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware para rotas não encontradas
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'ERROR',
    message: `Rota ${req.method} ${req.path} não encontrada`,
    code: 'ROUTE_NOT_FOUND'
  });
};

/**
 * Classe para erros customizados
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wrapper para funções async que podem gerar erros
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
