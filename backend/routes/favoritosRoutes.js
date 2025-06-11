const express = require('express');
const router = express.Router();
const db = require('../dbFunctions/db.js'); // ajuste o caminho se necessário

// 🔍 Buscar todos os favoritos de um usuário (com autor e imagem)
router.get('/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params;

  try {
    const [favoritos] = await db.query(`
      SELECT 
        c.*, 
        GROUP_CONCAT(i.url) AS imagens,
        u.nome AS autor
      FROM favoritos f
      INNER JOIN conteudos c ON c.id = f.id_conteudo
      LEFT JOIN imagens_conteudo i ON c.id = i.id_conteudo
      LEFT JOIN usuarios u ON c.id_autor = u.id
      WHERE f.id_usuario = ?
        AND f.statusAtivo = 1
        AND c.statusAtivo != 0
      GROUP BY c.id
    `, [idUsuario]);

    res.json(favoritos);
  } catch (err) {
    console.error('Erro ao buscar favoritos:', err);
    res.status(500).send('Erro ao buscar favoritos');
  }
});

// ✅ Adicionar um favorito
router.post('/', async (req, res) => {
  const { id_usuario, id_conteudo } = req.body;
  try {
    const [existe] = await db.query(`
      SELECT * FROM favoritos
      WHERE id_usuario = ? AND id_conteudo = ?
    `, [id_usuario, id_conteudo]);

    if (existe && existe.length > 0) {
      await db.query(`
        UPDATE favoritos SET statusAtivo = 1 WHERE id_usuario = ? AND id_conteudo = ?
      `, [id_usuario, id_conteudo]);
    } else {
      await db.query(`
        INSERT INTO favoritos (id_usuario, id_conteudo, statusAtivo) VALUES (?, ?, 1)
      `, [id_usuario, id_conteudo]);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Erro ao adicionar favorito:', err);
    res.status(500).send('Erro ao adicionar favorito');
  }
});

// ❌ Remover (desativar) um favorito
router.put('/remover', async (req, res) => {
  const { id_usuario, id_conteudo } = req.body;
  try {
    await db.query(`
      UPDATE favoritos SET statusAtivo = 0 WHERE id_usuario = ? AND id_conteudo = ?
    `, [id_usuario, id_conteudo]);

    res.sendStatus(200);
  } catch (err) {
    console.error('Erro ao remover favorito:', err);
    res.status(500).send('Erro ao remover favorito');
  }
});

module.exports = router;