# 📧 Configuração de Email para Recuperação de Senha

## 🚀 Como Configurar o Gmail para Envio de Emails

### 1. **Ativar Verificação em 2 Etapas**
1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Vá em **Segurança** > **Verificação em duas etapas**
3. Siga as instruções para ativar

### 2. **Gerar Senha de App**
1. Na mesma página de Segurança, procure por **Senhas de app**
2. Clique em **Senhas de app**
3. Selecione o app: **Outro (nome personalizado)**
4. Digite: **e-Prontuário**
5. Clique em **Gerar**
6. **Copie a senha gerada** (16 caracteres)

### 3. **Configurar no Sistema**
Substitua `sua_senha_de_app_aqui` no arquivo `.env` pela senha gerada:

```
EMAIL_PASS=abcd efgh ijkl mnop
```

### 4. **Reiniciar o Backend**
```bash
cd backend
docker-compose restart backend
```

### 5. **Testar o Envio**
Execute o teste:
```bash
node test-api-forgot.js
```

## 🔐 Segurança
- ✅ A senha de app é específica para este sistema
- ✅ Pode ser revogada a qualquer momento
- ✅ Não compromete sua conta principal do Gmail
- ✅ Funciona mesmo com verificação em 2 etapas ativa

## 🌐 Alternativas de Provedores de Email
Se preferir não usar Gmail, pode configurar:
- **SendGrid** (recomendado para produção)
- **Mailgun**
- **Amazon SES**
- **Outlook/Hotmail**

## 📋 Checklist
- [ ] Verificação em 2 etapas ativada
- [ ] Senha de app gerada
- [ ] Arquivo .env atualizado
- [ ] Backend reiniciado
- [ ] Teste executado com sucesso

## 🐛 Problemas Comuns
1. **"Invalid login"**: Verifique se a senha de app está correta
2. **"Less secure app"**: Use senha de app, não a senha normal
3. **"Connection refused"**: Verifique conexão com internet

---
**Após configurar, teste com seu email: fpsjunior87@gmail.com**
