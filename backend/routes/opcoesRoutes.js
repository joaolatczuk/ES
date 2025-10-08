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

router.get("/filtros", async (req, res) => {
  try {
    const [categorias] = await db.query("SELECT id, nome FROM conteudocategoria ORDER BY id");
    const [epocas]     = await db.query("SELECT id, nome FROM conteudoepoca ORDER BY id");
    const [solos]      = await db.query("SELECT id, nome FROM conteudosolo ORDER BY id");
    const [sois]       = await db.query("SELECT id, nome FROM conteudosol ORDER BY id");

    res.json({
      categorias,
      epocas,
      solos,
      sois
    });
  } catch (error) {
    console.error("Erro ao buscar filtros:", error);
    res.status(500).json({ error: "Erro ao buscar filtros" });
  }
});


module.exports = router;
