const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const notificacaoRoutes = require('./routes/notificacaoRoutes');
const conteudoRoutes = require('./routes/conteudoRoutes');

// 👇 Habilita CORS antes de tudo
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// 👇 Permite JSON no corpo da requisição
app.use(express.json());

// ✅ Content Security Policy deve vir ANTES das rotas
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: http://localhost:5000"
  );
  next();
});

// 👇 Suas rotas
app.use('/api/conteudos', conteudoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notificacoes', notificacaoRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // imagens públicas

// Start do servidor
app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
