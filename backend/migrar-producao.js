// Script para migrar tabela de produção
// Execute: node migrar-producao.js

import pkg from 'pg';
const { Client } = pkg;

// Configure com a URL do seu banco do Render
const DATABASE_URL = process.env.DATABASE_URL || 'sua_url_do_render_aqui';

async function migrarTabela() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Conectando ao banco de produção...');
    await client.connect();
    
    console.log('🔍 Verificando estrutura atual...');
    const currentColumns = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'pacientes'
    `);
    
    const hasCreatedAt = currentColumns.rows.some(row => row.column_name === 'created_at');
    const hasUpdatedAt = currentColumns.rows.some(row => row.column_name === 'updated_at');
    
    console.log('📊 Colunas atuais:', currentColumns.rows.map(r => r.column_name));
    
    // Adicionar created_at se não existir
    if (!hasCreatedAt) {
      console.log('➕ Adicionando coluna created_at...');
      await client.query(`
        ALTER TABLE pacientes 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      
      console.log('🔄 Atualizando created_at para registros existentes...');
      await client.query(`
        UPDATE pacientes 
        SET created_at = CURRENT_TIMESTAMP 
        WHERE created_at IS NULL
      `);
    } else {
      console.log('✅ Coluna created_at já existe');
    }
    
    // Adicionar updated_at se não existir
    if (!hasUpdatedAt) {
      console.log('➕ Adicionando coluna updated_at...');
      await client.query(`
        ALTER TABLE pacientes 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      
      console.log('🔄 Atualizando updated_at para registros existentes...');
      await client.query(`
        UPDATE pacientes 
        SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP)
        WHERE updated_at IS NULL
      `);
    } else {
      console.log('✅ Coluna updated_at já existe');
    }
    
    // Verificar estrutura final
    console.log('🔍 Verificando estrutura final...');
    const finalColumns = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'pacientes' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estrutura final da tabela:');
    finalColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.column_default || ''}`);
    });
    
    // Contar registros
    const count = await client.query('SELECT COUNT(*) FROM pacientes');
    console.log(`📊 Total de pacientes: ${count.rows[0].count}`);
    
    console.log('✅ Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await client.end();
    console.log('🔌 Conexão fechada');
  }
}

// Executar migração
migrarTabela();
