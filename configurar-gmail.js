#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Configurador do Gmail para e-Prontuário\n');

console.log('📋 PASSO 1: Gerar Senha de App do Gmail');
console.log('1. Acesse: https://myaccount.google.com');
console.log('2. Vá em "Segurança" → "Verificação em duas etapas" (ative se não estiver)');
console.log('3. Vá em "Segurança" → "Senhas de app"');
console.log('4. Selecione "Outro (nome personalizado)" e digite: e-Prontuário');
console.log('5. Clique em "Gerar" e COPIE a senha de 16 caracteres\n');

rl.question('✅ Você já gerou a senha de app? (s/n): ', (resposta) => {
  if (resposta.toLowerCase() !== 's') {
    console.log('❌ Por favor, gere a senha de app primeiro e execute novamente.');
    rl.close();
    return;
  }

  rl.question('📧 Cole aqui a senha de app do Gmail (16 caracteres): ', (senhaApp) => {
    if (!senhaApp || senhaApp.length < 10) {
      console.log('❌ Senha inválida. Deve ter pelo menos 10 caracteres.');
      rl.close();
      return;
    }

    // Ler arquivo .env atual
    const envPath = path.join(__dirname, 'backend', '.env');
    let envContent = '';
    
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
      console.log('❌ Erro ao ler arquivo .env:', error.message);
      rl.close();
      return;
    }

    // Atualizar senha no .env
    const updatedContent = envContent.replace(
      /EMAIL_PASS=.*/,
      `EMAIL_PASS=${senhaApp}`
    );

    try {
      fs.writeFileSync(envPath, updatedContent, 'utf8');
      console.log('✅ Arquivo .env atualizado com sucesso!');
      
      console.log('\n🔄 Agora vou reiniciar o backend...');
      
      const { exec } = require('child_process');
      
      exec('cd backend && docker-compose restart backend', (error, stdout, stderr) => {
        if (error) {
          console.log('❌ Erro ao reiniciar backend:', error.message);
        } else {
          console.log('✅ Backend reiniciado com sucesso!');
          console.log('\n🧪 Testando envio de email...');
          
          // Testar envio
          setTimeout(() => {
            exec('node test-api-forgot.js', (testError, testStdout, testStderr) => {
              console.log('\n📧 Resultado do teste:');
              console.log(testStdout);
              if (testError) {
                console.log('❌ Erro no teste:', testError.message);
              }
              
              console.log('\n🎯 PRONTO! Verifique sua caixa de entrada: fpsjunior87@gmail.com');
              console.log('📱 Pode verificar também na pasta SPAM se não chegou na principal.');
              rl.close();
            });
          }, 5000);
        }
      });
      
    } catch (error) {
      console.log('❌ Erro ao salvar arquivo .env:', error.message);
      rl.close();
    }
  });
});
