import { Pool } from 'pg';
import config from './env.js';

class Database {
  constructor() {
    // Configurar SSL baseado no ambiente
    const sslConfig = config.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false;

    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: sslConfig,
      max: 20, // Máximo de conexões no pool
      idleTimeoutMillis: 30000, // Tempo limite de conexão ociosa
      connectionTimeoutMillis: 2000, // Tempo limite para estabelecer conexão
    });

    // Event listeners para monitoramento
    this.pool.on('connect', (client) => {
      console.log('🔗 Nova conexão estabelecida com o banco de dados');
    });

    this.pool.on('error', (err, client) => {
      console.error('❌ Erro inesperado na conexão do banco:', err);
    });
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log(`🔍 Query executada em ${duration}ms: ${text.substring(0, 50)}...`);
      return res;
    } catch (error) {
      console.error('❌ Erro na query:', error);
      throw error;
    }
  }

  async getClient() {
    return await this.pool.connect();
  }

  async transaction(callback) {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async testConnection() {
    try {
      const client = await this.getClient();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ Conexão com banco de dados testada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Falha ao testar conexão:', error.message);
      return false;
    }
  }

  async close() {
    await this.pool.end();
    console.log('🔌 Pool de conexões fechado');
  }
}

// Singleton instance
const database = new Database();

export default database;
