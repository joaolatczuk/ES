const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// 🔹 Listar todas as receitas aprovadas
router.get('/', (req, res) => {
  const sql = `
    SELECT c.*, u.nome AS autor, GROUP_CONCAT(i.url) AS imagens
    FROM conteudos c
    LEFT JOIN imagens_conteudo i ON c.id = i.id_conteudo
    LEFT JOIN usuarios u ON c.id_autor = u.id
    WHERE c.status = 'aprovado'
    GROUP BY c.id
    ORDER BY c.data_publicacao DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err });
    results.forEach(r => {
      r.imagens = r.imagens ? r.imagens.split(',') : [];
    });
    res.json(results);
  });
});

// 🔸 Listar receitas pendentes (para moderação)
router.get('/pendentes', (req, res) => {
  const sql = `
    SELECT c.*, u.nome AS autor, GROUP_CONCAT(i.url) AS imagens
    FROM conteudos c
    LEFT JOIN imagens_conteudo i ON c.id = i.id_conteudo
    LEFT JOIN usuarios u ON c.id_autor = u.id
    WHERE c.status = 'pendente'
    GROUP BY c.id
    ORDER BY c.data_publicacao DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err });
    results.forEach(r => {
      r.imagens = r.imagens ? r.imagens.split(',') : [];
    });
    res.json(results);
  });
});

// Criar nova receita com imagens
router.post('/', upload.array('imagens'), (req, res) => {
  const {
    nomePlanta,
    categoria,
    epoca,
    temperatura,
    solo,
    rega,
    sol,
    instrucoes,
    id_autor
  } = req.body;

  const data_publicacao = new Date();

  const sql = `
    INSERT INTO conteudos (
      nomePlanta, categoria, epoca, temperatura, solo, rega, sol, instrucoes, id_autor, data_publicacao, status, favorita
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', false)
  `;

  const valores = [nomePlanta, categoria, epoca, temperatura, solo, rega, sol, instrucoes, id_autor, data_publicacao];

  db.query(sql, valores, (err, result) => {
    if (err) return res.status(500).json({ erro: err });

    const id_conteudo = result.insertId;

    if (req.files && req.files.length > 0) {
      const imagensSql = `INSERT INTO imagens_conteudo (id_conteudo, url) VALUES ?`;
      const imagensValores = req.files.map(file => [id_conteudo, `/uploads/${file.filename}`]);

      db.query(imagensSql, [imagensValores], (err2) => {
        if (err2) return res.status(500).json({ erro: err2 });
        res.status(201).json({ sucesso: true, id: id_conteudo });
      });
    } else {
      res.status(201).json({ sucesso: true, id: id_conteudo });
    }
  });
});

// Atualizar status (aprovar ou rejeitar)
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['aprovado', 'rejeitado'].includes(status)) {
    return res.status(400).json({ erro: 'Status inválido.' });
  }

  const sql = 'UPDATE conteudos SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json({ erro: err });
    res.json({ sucesso: true });
  });
});

// 🔴 EXCLUIR receita
// DELETE receita por ID (e imagens associadas)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Primeiro exclui as imagens relacionadas
  const deleteImagens = 'DELETE FROM imagens_conteudo WHERE id_conteudo = ?';
  db.query(deleteImagens, [id], (err) => {
    if (err) return res.status(500).json({ erro: 'Erro ao excluir imagens relacionadas.' });

    // Depois exclui o conteúdo principal
    const deleteConteudo = 'DELETE FROM conteudos WHERE id = ?';
    db.query(deleteConteudo, [id], (err2, result) => {
      if (err2) return res.status(500).json({ erro: 'Erro ao excluir conteúdo.' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: 'Receita não encontrada.' });
      }
      res.json({ sucesso: true, mensagem: 'Receita excluída com sucesso.' });
    });
  });
});

// 🔍 Buscar uma receita específica por ID
// 🔍 Buscar receita específica por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT c.*, u.nome AS autor, GROUP_CONCAT(i.url) AS imagens
    FROM conteudos c
    LEFT JOIN imagens_conteudo i ON c.id = i.id_conteudo
    LEFT JOIN usuarios u ON c.id_autor = u.id
    WHERE c.id = ?
    GROUP BY c.id
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ erro: err });
    if (results.length === 0) return res.status(404).json({ erro: 'Receita não encontrada' });

    const receita = results[0];
    receita.imagens = receita.imagens ? receita.imagens.split(',') : [];
    res.json(receita);
  });
});


module.exports = router;