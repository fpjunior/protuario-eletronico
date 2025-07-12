// Script de diagnóstico completo para PostgreSQL no Render
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function diagnosticoCompleto() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DO POSTGRESQL');
  console.log('=====================================\n');

  // 1. Verificar variáveis de ambiente
  console.log('1️⃣ VARIÁVEIS DE AMBIENTE:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL existe:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);

  if (process.env.DATABASE_URL) {
    // Parse da URL sem mostrar senha
    const urlMatch = process.env.DATABASE_URL.match(/postgresql:\/\/([^:]+):([^@]+)@([^:\/]+):?(\d+)?\/(.+)/);
    if (urlMatch) {
      console.log('📋 Dados da conexão:');
      console.log('  User:', urlMatch[1]);
      console.log('  Password length:', urlMatch[2]?.length || 0);
      console.log('  Host:', urlMatch[3]);
      console.log('  Port:', urlMatch[4] || '5432');
      console.log('  Database:', urlMatch[5]);
    }
  }
  console.log('');

  // 2. Teste de conexão básico (com SSL)
  console.log('2️⃣ TESTE DE CONEXÃO COM SSL:');
  const poolSSL = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
      require: true
    },
    max: 1,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 10000
  });

  try {
    const client = await poolSSL.connect();
    console.log('✅ Conexão com SSL: SUCESSO');
    
    const result = await client.query('SELECT NOW() as timestamp, current_database() as db, current_user as user');
    console.log('✅ Query executada:', result.rows[0]);
    
    client.release();
    
    // Teste de criação de tabela (para verificar permissões)
    console.log('\n3️⃣ TESTE DE PERMISSÕES:');
    const client2 = await poolSSL.connect();
    
    try {
      await client2.query('CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW())');
      console.log('✅ Permissão de CREATE: OK');
      
      await client2.query('INSERT INTO test_connection DEFAULT VALUES');
      console.log('✅ Permissão de INSERT: OK');
      
      const selectResult = await client2.query('SELECT COUNT(*) as count FROM test_connection');
      console.log('✅ Permissão de SELECT: OK -', selectResult.rows[0].count, 'registros');
      
      await client2.query('DROP TABLE test_connection');
      console.log('✅ Permissão de DROP: OK');
      
    } catch (permError) {
      console.log('❌ Erro de permissão:', permError.message);
    }
    
    client2.release();
    
  } catch (error) {
    console.log('❌ Erro de conexão SSL:', error.message);
    console.log('Código do erro:', error.code);
    console.log('Detalhes:', error.detail);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 SOLUÇÃO: Verificar hostname do banco no Render');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 SOLUÇÃO: Verificar se o banco está rodando no Render');
    } else if (error.message.includes('no pg_hba.conf entry')) {
      console.log('💡 SOLUÇÃO: Adicionar IP do backend no Access Control do PostgreSQL');
      console.log('   IP para adicionar: 177.221.43.199/32 ou 0.0.0.0/0');
    } else if (error.message.includes('password authentication failed')) {
      console.log('💡 SOLUÇÃO: Verificar credenciais no DATABASE_URL');
    }
  }

  await poolSSL.end();

  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Acessar dashboard do Render');
  console.log('2. Ir em PostgreSQL > Access Control');
  console.log('3. Adicionar IP: 177.221.43.199/32');
  console.log('4. Salvar e aguardar alguns minutos');
  console.log('5. Executar este script novamente');

  console.log('\n🔗 LINKS ÚTEIS:');
  console.log('- Dashboard Render: https://dashboard.render.com/');
  console.log('- PostgreSQL logs: Dashboard > PostgreSQL > Logs');
  console.log('- Backend logs: Dashboard > Web Service > Logs');
}

diagnosticoCompleto().catch(console.error);
