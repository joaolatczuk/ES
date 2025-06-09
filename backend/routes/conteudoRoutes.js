const express = require('express');
const router = express.Router();
const db = require('../dbFunctions/db');
const multer = require('multer');
const path = require('path');

// 📂 Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// 🔹 Criar nova receita com imagens
router.post('/', upload.array('imagens'), async (req, res) => {
  try {
    const {
      nomePlanta, categoria, epoca, temperatura,
      solo, rega, sol, instrucoes, id_autor
    } = req.body;
    const data_publicacao = new Date();

    const sql = `
      INSERT INTO conteudos (
        nomePlanta, categoria, epoca, temperatura, solo, rega, sol, instrucoes,
        id_autor, data_publicacao, status, favorita, statusAtivo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', false, 1)
    `;

    const valores = [
      nomePlanta, categoria, epoca, temperatura,
      solo, rega, sol, instrucoes, id_autor, data_publicacao
    ];
    
    const [insertResult] = await db.query(sql, valores);
    const id_conteudo = insertResult.insertId;

    if (req.files && req.files.length > 0) {
      const imagensSql = `INSERT INTO imagens_conteudo (id_conteudo, url) VALUES ?`;
      const imagensValores = req.files.map(file => [id_conteudo, `/uploads/${file.filename}`]);
      await db.query(imagensSql, [imagensValores]);
    }

    res.status(201).json({ sucesso: true, id: id_conteudo });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// 🔸 Listar receitas pendentes
router.get('/pendentes', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT c.*, u.nome AS autor, GROUP_CONCAT(i.url) AS imagens
      FROM conteudos c
      LEFT JOIN imagens_conteudo i ON c.id = i.id_conteudo
      LEFT JOIN usuarios u ON c.id_autor = u.id
      WHERE c.status = 'pendente' AND c.statusAtivo != 0
      GROUP BY c.id
      ORDER BY c.data_publicacao DESC
    `);
    results.forEach(r => r.imagens = r.imagens ? r.imagens.split(',') : []);
    res.json(results);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// 🔹 Listar todas as receitas visíveis (exceto excluídas)
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT c.*, u.nome AS autor, GROUP_CONCAT(i.url) AS imagens
      FROM conteudos c
      LEFT JOIN imagens_conteudo i ON c.id = i.id_conteudo
      LEFT JOIN usuarios u ON c.id_autor = u.id
      WHERE c.statusAtivo != 0 AND c.status != 'rejeitado'
      GROUP BY c.id
      ORDER BY c.data_publicacao DESC
    `);
    results.forEach(r => r.imagens = r.imagens ? r.imagens.split(',') : []);
    res.json(results);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// 🔸 Atualizar statusAtivo (exclusão lógica)
router.put('/:id/excluir', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE conteudos SET statusAtivo = 0 WHERE id = ?', [id]);
    res.json({ sucesso: true, mensagem: 'Receita marcada como excluída.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});


router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['aprovado', 'rejeitado'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Status inválido' });
  }

  try {
    await db.query('UPDATE conteudos SET status = ? WHERE id = ?', [status, id]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔍 Buscar receita por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query(`
      SELECT c.*, u.nome AS autor, GROUP_CONCAT(i.url) AS imagens
      FROM conteudos c
      LEFT JOIN imagens_conteudo i ON c.id = i.id_conteudo
      LEFT JOIN usuarios u ON c.id_autor = u.id
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);

    if (results.length === 0) {
      return res.status(404).json({ erro: 'Receita não encontrada' });
    }

    const receita = results[0];
    receita.imagens = receita.imagens ? receita.imagens.split(',') : [];
    res.json(receita);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// 🔴 Excluir permanentemente receita e imagens
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM imagens_conteudo WHERE id_conteudo = ?', [id]);
    const [result] = await db.query('DELETE FROM conteudos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Receita não encontrada.' });
    }

    res.json({ sucesso: true, mensagem: 'Receita excluída permanentemente.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;