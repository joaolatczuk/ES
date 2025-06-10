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

router.get('/conteudoepoca', async (req, res) => {
  try {
    const dados = await db.select_all('conteudoepoca');
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar épocas' });
  }
});

router.get('/conteudosolo', async (req, res) => {
  try {
    const dados = await db.select_all('conteudosolo'); // Corrigido
    res.json(dados);
  } catch (err) {
    console.error('❌ Erro em /conteudosolo:', err);
    res.status(500).json({ erro: 'Erro ao buscar tipos de solo' });
  }
});

router.get('/conteudosol', async (req, res) => {
  try {
    const dados = await db.select_all('conteudosol'); // Corrigido
    res.json(dados);
  } catch (err) {
    console.error('❌ Erro em /conteudosol:', err);
    res.status(500).json({ erro: 'Erro ao buscar exposição ao sol' });
  }
});



module.exports = router;
