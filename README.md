# Prontuário Eletrônico – Cadastro de Pacientes

Sistema simples para cadastro de pacientes (prontuário eletrônico) para a recepção de um posto de saúde.

## Tecnologias Utilizadas
- **Frontend:** Angular + Angular Material
- **Backend:** Node.js (Express)
- **Banco de Dados:** PostgreSQL (via Docker Compose)

---

## Funcionalidades
- Cadastro de pacientes
- Listagem de pacientes
- Remoção de pacientes
- Formulário e tabela seguindo o modelo de ficha de atendimento de urgência

---

## Pré-requisitos
- [Node.js](https://nodejs.org/) (v18+ recomendado)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [Angular CLI](https://angular.io/cli) (global):
  ```bash
  npm install -g @angular/cli
  ```

---

## Como executar o projeto

### 1. Clone o repositório
```bash
git clone git@github.com:fpjunior/protuario-eletronico.git
cd protuario-eletronico
```

### 2. Suba o backend e o banco de dados (Docker)
```bash
cd backend
docker-compose up --build
```
O backend estará disponível em `http://localhost:3001`.

### 3. Instale as dependências do frontend
Abra outro terminal e execute:
```bash
cd frontend
npm install
```

### 4. Rode o frontend
```bash
npm start
```
O frontend estará disponível em `http://localhost:4200`.

---

## Estrutura do Projeto
```
protuario-eletronico/
├── backend/           # Node.js + Express + Docker + Postgres
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── init.sql
│   └── src/
├── frontend/          # Angular + Angular Material
│   └── src/app/pacientes/
└── README.md
```

---

## Observações
- O backend faz o mapeamento dos campos do banco (snake_case) para camelCase no frontend.
- O banco é inicializado com alguns pacientes de exemplo para testes.
- Para alterar configurações do banco, edite o arquivo `.env` dentro da pasta `backend`.
- Para desenvolvimento, você pode rodar o backend localmente (fora do Docker), se preferir.

---

## Comandos Úteis

### Backend
- Subir backend + banco: `cd backend && docker-compose up --build`
- Parar backend + banco: `cd backend && docker-compose down`

### Frontend
- Instalar dependências: `cd frontend && npm install`
- Rodar frontend: `cd frontend && npm start`

---

## Contato
Fernando Junior – [fpjunior](https://github.com/fpjunior)

---

Sinta-se à vontade para sugerir melhorias ou abrir issues!
