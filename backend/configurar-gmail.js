/**
 * Script para configurar Gmail e testar envio de email
 * 
 * PASSO A PASSO PARA CONFIGURAR GMAIL:
 * 
 * 1. Acesse: https://myaccount.google.com
 * 2. Vá em "Segurança" 
 * 3. Ative "Verificação em duas etapas" se não estiver ativada
 * 4. Procure por "Senhas de app" 
 * 5. Clique em "Senhas de app"
 * 6. Selecione "Outro (nome personalizado)"
 * 7. Digite: "e-Prontuário Aliança"
 * 8. Clique em "Gerar"
 * 9. Copie a senha de 16 caracteres (formato: xxxx xxxx xxxx xxxx)
 * 10. Substitua no arquivo .env: EMAIL_PASS=xxxxxxxxxxxxxxxx
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔧 CONFIGURAÇÃO DE EMAIL GMAIL');
console.log('===============================');
console.log('📧 Email configurado:', process.env.EMAIL_USER);
console.log('🔑 Senha configurada:', process.env.EMAIL_PASS ? 
  (process.env.EMAIL_PASS === 'sua_senha_de_app_aqui' ? '❌ NÃO CONFIGURADA' : '✅ CONFIGURADA') 
  : '❌ NÃO DEFINIDA');

if (process.env.EMAIL_PASS === 'sua_senha_de_app_aqui' || !process.env.EMAIL_PASS) {
  console.log('\n❌ ERRO: Senha de app do Gmail não configurada!');
  console.log('\n📋 COMO CONFIGURAR:');
  console.log('1. Acesse: https://myaccount.google.com');
  console.log('2. Vá em "Segurança"');
  console.log('3. Ative "Verificação em duas etapas"');
  console.log('4. Procure por "Senhas de app"');
  console.log('5. Clique em "Senhas de app"');
  console.log('6. Selecione "Outro (nome personalizado)"');
  console.log('7. Digite: "e-Prontuário Aliança"');
  console.log('8. Clique em "Gerar"');
  console.log('9. Copie a senha de 16 caracteres');
  console.log('10. Substitua no arquivo .env: EMAIL_PASS=sua_senha_de_16_chars');
  console.log('\n🔄 Depois execute: docker-compose restart backend');
  process.exit(1);
}

async function testarConfiguracaoGmail() {
  console.log('\n🧪 Testando configuração do Gmail...');
  
  try {
    // Criar transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('🔗 Testando conexão com Gmail...');
    await transporter.verify();
    console.log('✅ Conexão com Gmail estabelecida com sucesso!');

    // Testar envio
    console.log('📧 Enviando email de teste...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"e-Prontuário Aliança-PE" <noreply@alianca.com>',
      to: process.env.EMAIL_USER,
      subject: '🧪 Teste de Email - e-Prontuário',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">🎉 Email configurado com sucesso!</h2>
          <p>Este é um email de teste para confirmar que a configuração do Gmail está funcionando corretamente.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>✅ Configurações testadas:</h3>
            <ul>
              <li>Conexão com servidor Gmail</li>
              <li>Autenticação com senha de app</li>
              <li>Envio de email HTML</li>
            </ul>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">
            Data do teste: ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      `
    });

    console.log('✅ Email de teste enviado com sucesso!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Verifique sua caixa de entrada:', process.env.EMAIL_USER);
    
  } catch (error) {
    console.error('❌ Erro na configuração do Gmail:');
    console.error('🔍 Tipo do erro:', error.code || error.name);
    console.error('📝 Mensagem:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🚨 ERRO DE AUTENTICAÇÃO:');
      console.log('- Verifique se a senha de app está correta');
      console.log('- Certifique-se que não há espaços extras na senha');
      console.log('- A senha deve ter 16 caracteres (sem espaços)');
      console.log('- Exemplo: abcdefghijklmnop');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🌐 ERRO DE CONEXÃO:');
      console.log('- Verifique sua conexão com a internet');
      console.log('- Pode ser um firewall bloqueando a conexão');
    } else if (error.message.includes('Invalid login')) {
      console.log('\n🔐 ERRO DE LOGIN:');
      console.log('- Email ou senha incorretos');
      console.log('- Verifique se o email está correto');
      console.log('- Verifique se a senha de app está correta');
    }
  }
}

testarConfiguracaoGmail();
