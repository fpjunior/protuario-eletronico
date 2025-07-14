import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  async init() {
    try {
      // Se as variáveis de ambiente estão configuradas, use Gmail
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'sua_senha_de_app_aqui') {
        console.log('📧 Configurando Gmail para envio de emails...');
        this.transporter = nodemailer.createTransport({
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
        this.transporter = nodemailer.createTransport({
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
      await this.transporter.verify();
      console.log('✅ Conexão de email estabelecida com sucesso!');
    } catch (error) {
      console.error('❌ Erro na conexão de email:', error.message);
    }
  }

  async sendPasswordResetEmail(email, resetToken, userName) {
    if (!this.transporter) {
      throw new Error('Transporter de email não inicializado');
    }

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
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado com sucesso:', info.messageId);
      
      // Se estiver usando Ethereal (teste), mostrar link de preview
      if (info.messageId && this.transporter.options && this.transporter.options.host === 'smtp.ethereal.email') {
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
}

// Instância singleton
const emailService = new EmailService();

export default emailService;
