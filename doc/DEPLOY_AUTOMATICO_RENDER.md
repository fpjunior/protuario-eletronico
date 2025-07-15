# 🚀 Deploy Automático no Render - Passo a Passo

## 📋 O que você precisa fazer:

### **PASSO 1: Fazer commit do render.yaml atualizado**
```bash
git add render.yaml
git commit -m "feat: Configurar deploy automático no Render com email"
git push origin main
```

### **PASSO 2: Criar serviço no Render**

1. **Acesse:** https://render.com
2. **Faça login** na sua conta
3. **Clique em "New +"**
4. **Selecione "Web Service"**

### **PASSO 3: Conectar repositório**

1. **Conecte ao GitHub** se ainda não estiver conectado
2. **Selecione o repositório:** `fpjunior/protuario-eletronico`
3. **Clique em "Connect"**

### **PASSO 4: Configurações automáticas**

O Render vai detectar o arquivo `render.yaml` e configurar automaticamente:

✅ **Name:** protuario-backend  
✅ **Environment:** Node  
✅ **Root Directory:** backend  
✅ **Build Command:** npm install  
✅ **Start Command:** npm start  
✅ **Plan:** Free  

### **PASSO 5: Verificar variáveis de ambiente**

O Render deve carregar automaticamente as variáveis do `render.yaml`:

- ✅ NODE_ENV=production
- ✅ PORT=3001
- ✅ DATABASE_URL=(banco PostgreSQL)
- ✅ JWT_SECRET=(chave de produção)
- ✅ FRONTEND_URL=(Vercel URL)
- ✅ EMAIL_USER=kralinfo18@gmail.com
- ✅ EMAIL_PASS=pmcrdimhpqtigdfz
- ✅ EMAIL_FROM=e-Prontuario Alianca-PE <noreply@alianca.com>

### **PASSO 6: Deploy**

1. **Clique em "Create Web Service"**
2. **Aguarde o build** (pode demorar 5-10 minutos)
3. **Anote a URL gerada** (ex: `https://protuario-backend.onrender.com`)

## 🔄 **Deploy Automático Configurado!**

Após isso, **a cada push para o branch `main`**, o Render vai:

1. ✅ Detectar mudanças automaticamente
2. ✅ Fazer rebuild do serviço
3. ✅ Aplicar as novas mudanças
4. ✅ Manter o serviço online

## 🧪 **Como testar após o deploy:**

1. **Anote a URL** gerada pelo Render
2. **Atualize o script de teste:**
   
   ```javascript
   // Em descobrir-api.js, adicione a URL real:
   const URLS_TO_TEST = [
     'https://SUA-URL-DO-RENDER.onrender.com',  // ← Sua URL aqui
     // ... outras URLs
   ];
   ```

3. **Execute o teste:**
   ```bash
   node descobrir-api.js
   ```

## 📧 **Teste de email:**

Após deploy bem-sucedido:
```bash
curl -X POST https://SUA-URL.onrender.com/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"fpsjunior87@gmail.com"}'
```

## 🚨 **Se der erro:**

1. **Verifique logs** no dashboard do Render
2. **Confirme se todas as variáveis** estão configuradas
3. **Verifique se o build** foi bem-sucedido
4. **Teste endpoints básicos** primeiro (`/api/health`)

---

## ⚡ **Vantagens do Deploy Automático:**

- 🔄 **Auto-deploy** a cada push
- 📊 **Logs automáticos** de build
- 🔧 **Rollback fácil** se algo der errado
- 📈 **Monitoramento** integrado

**Depois de configurar uma vez, nunca mais precisa se preocupar com deploy manual! 🎯**
