const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 Adicionar uma receita aos favoritos
router.post('/:id_usuario/:id_conteudo', (req, res) => {
  const { id_usuario, id_conteudo } = req.params;

  const sql = `INSERT INTO favoritos (id_usuario, id_conteudo) VALUES (?, ?)`;
  db.query(sql, [id_usuario, id_conteudo], (err) => {
    if (err) return res.status(500).json({ erro: err });
    res.json({ sucesso: true });
  });
});

// 🔻 Remover uma receita dos favoritos
router.delete('/:id_usuario/:id_conteudo', (req, res) => {
  const { id_usuario, id_conteudo } = req.params;

  const sql = `DELETE FROM favoritos WHERE id_usuario = ? AND id_conteudo = ?`;
  db.query(sql, [id_usuario, id_conteudo], (err) => {
    if (err) return res.status(500).json({ erro: err });
    res.json({ sucesso: true });
  });
});

// ✅ Listar receitas favoritas de um usuário (com imagem e dados)
router.get('/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;

  const sql = `
    SELECT 
      c.id AS id,
      c.nomePlanta,
      c.categoria,
      c.epoca,
      c.temperatura,
      c.solo,
      c.rega,
      c.sol,
      c.instrucoes,
      c.status,
      c.id_autor,
      GROUP_CONCAT(i.url) AS imagens
    FROM favoritos f
    JOIN conteudos c ON f.id_conteudo = c.id
    LEFT JOIN imagens_conteudo i ON c.id = i.id_conteudo
    WHERE f.id_usuario = ?
    GROUP BY c.id
  `;

  db.query(sql, [id_usuario], (err, results) => {
    if (err) return res.status(500).json({ erro: err });

    results.forEach(r => {
      r.imagens = r.imagens ? r.imagens.split(',') : [];
    });

    res.json(results);
  });
});

module.exports = router;