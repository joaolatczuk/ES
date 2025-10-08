// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const conteudoRoutes = require('./routes/conteudoRoutes');
const opcoesRoutes = require('./routes/opcoesRoutes');
const favoritosRoutes = require('./routes/favoritosRoutes');
const avisosRoutes = require('./routes/avisosRoutes');

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// JSON body
app.use(express.json());

// CSP (libera imagens do próprio servidor + data/blob)
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: blob: http://localhost:5000"
  );
  next();
});

// arquivos públicos de upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// rotas
app.use('/api/conteudos', conteudoRoutes);
app.use('/api/users', userRoutes);
app.use('/api', opcoesRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/avisos', avisosRoutes);

// start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.clear();
  console.log(`Servidor rodando na porta ${PORT}`);
});