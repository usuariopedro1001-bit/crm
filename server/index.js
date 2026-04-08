const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Start Server
app.listen(PORT, () => {
  console.log('-------------------------------------------');
  console.log(`🚀 CRM Pro Backend rodando na porta ${PORT}`);
  console.log(`📂 Banco de Dados Local (JSON) ativo`);
  console.log('-------------------------------------------');
});
