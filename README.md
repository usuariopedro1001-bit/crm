# CRM Pro - Gestão de Leads e Vendas

Um sistema de CRM moderno, simples e funcional para gerenciar clientes e acompanhar o funil de vendas de sites.

## 🚀 Tecnologias

- **Frontend:** React, Tailwind CSS, Lucide React, Recharts, Framer Motion, Hello-Pangea/DND
- **Backend:** Node.js, Express, MongoDB, JWT, BcryptJS

## 📦 Funcionalidades

- **Autenticação:** Cadastro e login de usuários com proteção de rotas.
- **Gestão de Leads:** CRUD completo de leads com informações detalhadas.
- **Funil de Vendas (Kanban):** Arraste e solte para gerenciar o status dos leads.
- **Dashboard:** Visão geral da operação com estatísticas e gráficos.
- **Histórico:** Registro de notas e interações para cada cliente.

## 🛠️ Como Rodar o Projeto

### Pré-requisitos
- Node.js instalado
- MongoDB instalado e rodando (ou link do MongoDB Atlas)

### 1. Configurar o Backend
```bash
cd server
npm install
```
Crie um arquivo `.env` na pasta `server` (já configurado no projeto):
```env
PORT=5050
MONGO_URI=mongodb://localhost:27017/crmpedro
JWT_SECRET=supersecretkey123
```
Inicie o servidor:
```bash
npm run dev
```

### 2. Configurar o Frontend
```bash
cd client
npm install
npm run dev
```
O frontend estará disponível em `http://localhost:5150`.

## 📁 Estrutura do Projeto

- `/client`: Código do frontend em React.
- `/server`: API REST em Node.js.
- `/server/models`: Esquemas do MongoDB.
- `/server/routes`: Definição das rotas da API.
- `/client/src/pages`: Páginas da aplicação.
- `/client/src/components`: Componentes reutilizáveis.

---
Desenvolvido com ❤️ para gestão de vendas de sites.
