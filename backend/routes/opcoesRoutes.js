const express = require('express');
const router = express.Router();
const db = require('../dbFunctions/db');

router.get('/conteudocategoria', async (req, res) => {
  try {
    const dados = await db.select_all('conteudocategoria');
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar categorias' });
  }
});

router.get('/categoriaepoca', async (req, res) => {
  try {
    const dados = await db.select_all('categoriaepoca');
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar épocas' });
  }
});

router.get('/categoriasolo', async (req, res) => {
  try {
    const dados = await db.select_all('categoriasolo');
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar tipos de solo' });
  }
});

router.get('/categoriasol', async (req, res) => {
  try {
    const dados = await db.select_all('categoriasol'); // ← deve estar assim
    res.json(dados);
  } catch (err) {
    console.error('❌ Erro em /categoriasol:', err); // 👈 Adicione isso
    res.status(500).json({ erro: 'Erro ao buscar exposição ao sol' });
  }
});


module.exports = router;
