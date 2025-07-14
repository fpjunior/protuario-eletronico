# 🔧 TUTORIAL COMPLETO: Configurar Gmail para e-Prontuário

## ⚠️ PROBLEMA IDENTIFICADO
A senha de app do Gmail não está configurada no arquivo `.env`

## 🎯 SOLUÇÃO PASSO A PASSO

### 1️⃣ **Acessar Configurações do Google**
- Abra: https://myaccount.google.com
- Faça login com: `fpsjunior87@gmail.com`

### 2️⃣ **Ativar Verificação em 2 Etapas** (se não estiver ativada)
- Clique em **"Segurança"** no menu lateral
- Procure por **"Verificação em duas etapas"**
- Se não estiver ativada, clique em **"Ativar"**
- Siga as instruções para configurar (SMS ou app autenticador)

### 3️⃣ **Gerar Senha de App**
- Ainda na página de **"Segurança"**
- Procure por **"Senhas de app"** 
- Clique em **"Senhas de app"**
- Se pediu senha, digite sua senha normal do Gmail
- Selecione **"Selecionar app"** → **"Outro (nome personalizado)"**
- Digite: **"e-Prontuário Aliança"**
- Clique em **"Gerar"**

### 4️⃣ **Copiar a Senha Gerada**
- O Google vai mostrar uma senha de 16 caracteres
- Exemplo: `abcd efgh ijkl mnop`
- **COPIE ESSA SENHA** (sem os espaços)

### 5️⃣ **Configurar no Sistema**
- Abra o arquivo: `backend/.env`
- Encontre a linha: `EMAIL_PASS=sua_senha_de_app_aqui`
- Substitua por: `EMAIL_PASS=abcdefghijklmnop` (sua senha sem espaços)

### 6️⃣ **Reiniciar o Backend**
```bash
cd backend
docker-compose restart backend
```

### 7️⃣ **Testar a Configuração**
```bash
node configurar-gmail.js
```

## 🔍 **VERIFICAR SE DEU CERTO**
- Você deve ver: `🔑 Senha configurada: ✅ CONFIGURADA`
- Um email de teste será enviado para `fpsjunior87@gmail.com`
- Verifique sua caixa de entrada

## ❌ **PROBLEMAS COMUNS**

### Erro "Invalid login"
- Verifique se copiou a senha corretamente (16 caracteres, sem espaços)
- Certifique-se que está usando a senha de APP, não a senha normal

### Erro "Less secure app"
- Use senha de app, não a senha normal do Gmail
- Certifique-se que a verificação em 2 etapas está ativada

### Não encontra "Senhas de app"
- Primeiro ative a verificação em 2 etapas
- Aguarde alguns minutos e tente novamente

## 🎉 **DEPOIS QUE CONFIGURAR**
- O sistema de recuperação de senha funcionará automaticamente
- Emails serão enviados do Gmail real
- Não haverá mais emails de teste (Ethereal)

---
**📧 Email que será usado como remetente: fpsjunior87@gmail.com**
