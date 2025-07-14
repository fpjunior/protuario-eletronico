import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 DIAGNÓSTICO DETALHADO DO GMAIL');
console.log('=================================');
console.log('📧 Email:', process.env.EMAIL_USER);
console.log('🔑 Senha length:', process.env.EMAIL_PASS?.length || 0);
console.log('🔤 Senha (primeiros 4 chars):', process.env.EMAIL_PASS?.substring(0, 4) || 'N/A');
console.log('🔤 Senha (últimos 4 chars):', process.env.EMAIL_PASS?.substring(-4) || 'N/A');

// Verificar se há caracteres especiais
const hasSpecialChars = /[^a-zA-Z0-9]/.test(process.env.EMAIL_PASS);
console.log('🔍 Contém caracteres especiais:', hasSpecialChars ? '❌ SIM' : '✅ NÃO');

// Verificar se há espaços
const hasSpaces = process.env.EMAIL_PASS?.includes(' ');
console.log('🔍 Contém espaços:', hasSpaces ? '❌ SIM' : '✅ NÃO');

console.log('\n📋 CHECKLIST DE VERIFICAÇÃO:');
console.log('1. ✅ Verificação em 2 etapas ativada?');
console.log('2. ❓ Senha de app gerada recentemente?');
console.log('3. ❓ Senha copiada corretamente (sem espaços)?');
console.log('4. ❓ Conta do Gmail funcionando normalmente?');

console.log('\n💡 SUGESTÕES:');
console.log('1. Tente gerar uma NOVA senha de app');
console.log('2. Certifique-se de copiar EXATAMENTE como aparece');
console.log('3. Teste primeiro em um cliente de email normal');
console.log('4. Verifique se não há restrições na conta Google');

// Testar com Ethereal para confirmar que o código funciona
console.log('\n🧪 Testando com Ethereal (para confirmar que o código funciona)...');

async function testarEthereal() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    await transporter.verify();
    console.log('✅ Código funcionando - problema é especificamente com Gmail');
    
    const info = await transporter.sendMail({
      from: '"Test" <test@example.com>',
      to: 'test@example.com',
      subject: 'Teste',
      text: 'Email de teste'
    });
    
    console.log('✅ Email de teste enviado via Ethereal');
    console.log('🔗 Preview:', nodemailer.getTestMessageUrl(info));
    
  } catch (error) {
    console.log('❌ Erro no teste Ethereal:', error.message);
  }
}

testarEthereal();
