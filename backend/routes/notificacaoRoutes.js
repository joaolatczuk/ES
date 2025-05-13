const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;
  db.query('SELECT * FROM notificacoes WHERE id_usuario = ? ORDER BY criado_em DESC', [id_usuario], (err, results) => {
    if (err) return res.status(500).json({ erro: err });
    res.json(results);
  });
});

module.exports = router;
