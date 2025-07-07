# Passo a passo para deploy e ambientes

## Frontend (Angular)

1. **Ambientes:**
   - `src/environments/environment.ts` (desenvolvimento):
     ```ts
     export const environment = {
       production: false,
       apiUrl: 'http://localhost:3001/pacientes'
     };
     ```
   - `src/environments/environment.prod.ts` (produção):
     ```ts
     export const environment = {
       production: true,
       apiUrl: 'https://protuario-eletronico-1.onrender.com/pacientes'
     };
     ```
2. **Build para produção:**
   - Local: `ng build --prod`
   - Vercel: deploy automático já usa produção.
3. **Não use .env para URL da API no Angular!**

## Backend (Node.js/Express)

1. **Ambientes:**
   - `.env` local:
     ```env
     DATABASE_URL=postgres://postgres:postgres@db:5432/prontuario
     PORT=3001
     FRONTEND_URL=http://localhost:4200
     NODE_ENV=development
     ```
   - No Render (produção):
     - Defina no painel:
       - `DATABASE_URL=postgresql://mydb_l01f_user:...`
       - `PORT=3001`
       - `FRONTEND_URL=https://protuario-eletronico-t3wu.vercel.app`
       - `NODE_ENV=production`
2. **Nunca suba .env para o repositório.**
3. **O backend só executa o init.sql automaticamente em desenvolvimento.**

## Fluxo seguro
- O frontend em produção sempre usará a URL do backend de produção após build/deploy.
- O backend em produção nunca resetará os dados.
- Não é necessário alterar código ao alternar entre ambientes.

---

Dúvidas? Consulte este arquivo ou o README_AMBIENTES.md.
