# 🚀 Configuração de Variáveis de Ambiente para Produção

## 📋 Problema Identificado
O sistema de email está funcionando localmente (develop) mas não na produção (main) porque as variáveis de ambiente não estão configuradas corretamente no serviço de hospedagem.

## 🔧 Configurações Necessárias na Produção

### **Variáveis de Ambiente Obrigatórias:**

```bash
# Configurações do Gmail
EMAIL_USER=kralinfo18@gmail.com
EMAIL_PASS=pmcrdimhpqtigdfz
EMAIL_FROM=e-Prontuario Alianca-PE <noreply@alianca.com>

# Outras configurações importantes
NODE_ENV=production
JWT_SECRET=jwt_secret_production_2025_alianca_pe_secure_key_12345
FRONTEND_URL=https://protuario-eletronico-t3wu.vercel.app
DATABASE_URL=postgresql://mydb_l01f_user:9SMTVGi0Sb1QgSesdVxAmGZuCXnMEtKJ@dpg-d1jjelemcj7s739u1vjg-a.oregon-postgres.render.com/mydb_l01f
```

## 🎯 Como Configurar no Render (ou outro serviço)

### **1. No Dashboard do Render:**
1. Acesse o projeto do backend
2. Vá em **Environment**
3. Adicione cada variável:
   - Nome: `EMAIL_USER`
   - Valor: `kralinfo18@gmail.com`
   - Nome: `EMAIL_PASS`
   - Valor: `pmcrdimhpqtigdfz`
   - Nome: `EMAIL_FROM`
   - Valor: `e-Prontuario Alianca-PE <noreply@alianca.com>`

### **2. Reiniciar o Serviço:**
Após adicionar as variáveis, reinicie o deployment.

## 🧪 Como Testar na Produção

### **1. Teste Direto da API:**
```bash
curl -X POST https://sua-api-producao.com/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"fpsjunior87@gmail.com"}'
```

### **2. Verificar Logs:**
No dashboard do Render, verifique os logs para ver se:
- ✅ Variáveis de email estão carregadas
- ✅ Conexão com Gmail está sendo estabelecida
- ✅ Email está sendo enviado

## 📝 Checklist de Configuração

- [ ] `EMAIL_USER` configurado no Render
- [ ] `EMAIL_PASS` configurado no Render  
- [ ] `EMAIL_FROM` configurado no Render
- [ ] Deployment reiniciado
- [ ] Logs verificados
- [ ] Teste da API realizado
- [ ] Email recebido na caixa de entrada

## 🚨 Troubleshooting

### **Se ainda não funcionar:**

1. **Verificar se as variáveis estão sendo carregadas:**
   - Adicionar logs temporários no código
   - Verificar se `process.env.EMAIL_USER` não está undefined

2. **Verificar conexão:**
   - Render pode ter restrições de firewall
   - Verificar se portas 587/465 estão abertas

3. **Verificar senha de app:**
   - Testar a mesma senha localmente
   - Gerar nova senha de app se necessário

## 🔄 Próximos Passos

1. Configure as variáveis no Render
2. Reinicie o deployment
3. Teste a API de recuperação de senha
4. Verifique se o email chega na caixa de entrada

---
**📧 Email de teste recomendado:** fpsjunior87@gmail.com
