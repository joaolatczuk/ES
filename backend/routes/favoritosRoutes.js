const express = require('express');
const router = express.Router();
const db = require('../dbFunctions/db.js');

/* ===========================
   CONTAGEM DE FAVORITOS ATIVOS
   GET /api/favoritos/contagem/:id_usuario
=========================== */
// routes/favoritosRoutes.js
router.get('/contagem/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  const [rows] = await db.query(
    "SELECT COUNT(*) AS totalFavoritos FROM favoritos WHERE id_usuario = ? AND statusAtivo = 1",
    [id_usuario]
  );
  res.json({ totalFavoritos: rows?.[0]?.totalFavoritos || 0 });
});


/* ===========================
   CHECAR SE CONTEÚDO ESTÁ FAVORITADO (ATIVO)
   GET /api/favoritos/:idUsuario/:idConteudo
=========================== */
router.get('/:idUsuario/:idConteudo', async (req, res) => {
  const { idUsuario, idConteudo } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM favoritos WHERE id_usuario = ? AND id_conteudo = ? AND statusAtivo = 1 LIMIT 1",
      [idUsuario, idConteudo]
    );
    res.json(rows.length > 0 ? rows[0] : null);
  } catch (err) {
    console.error('Erro ao buscar favorito:', err);
    res.status(500).send('Erro ao buscar favorito');
  }
});

/* ===========================
   LISTAR FAVORITOS DO USUÁRIO
   (SOMENTE CONTEÚDOS APROVADOS E ATIVOS)
   GET /api/favoritos/:idUsuario
=========================== */
router.get('/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params;
  try {
    // IMPORTANTE: não cole com espaços/indentação estranhos.
    const sql =
      "SELECT " +
      "  c.id, c.nomePlanta, c.id_categoria, c.id_epoca, c.temperatura, " +
      "  c.id_solo, c.rega, c.id_sol, c.instrucoes, c.id_autor, c.data_publicacao, c.status, c.statusAtivo, " +
      "  GROUP_CONCAT(DISTINCT i.url) AS imagens, " +
      "  u.nome AS autor " +
      "FROM favoritos f " +
      "INNER JOIN conteudos c ON c.id = f.id_conteudo " +
      "LEFT JOIN imagens_conteudo i ON c.id = i.id_conteudo " +
      "LEFT JOIN usuarios u ON c.id_autor = u.id " +
      "WHERE f.id_usuario = ? " +
      "  AND f.statusAtivo = 1 " +
      "  AND c.statusAtivo = 1 " +
      "  AND c.status = 'aprovado' " +
      "GROUP BY c.id " +
      "ORDER BY c.data_publicacao DESC";

    const [rows] = await db.query(sql, [idUsuario]);

    // normalizar imagens para array
    const favoritos = rows.map(r => ({
      ...r,
      imagens: r.imagens ? r.imagens.split(',') : []
    }));

    res.json(favoritos); // retorna array puro (o front pode usar .filter/.map)
  } catch (err) {
    console.error('Erro ao buscar favoritos:', err);
    res.status(500).send('Erro ao buscar favoritos');
  }
});

/* ===========================
   ADICIONAR/ATIVAR FAVORITO
   POST /api/favoritos
=========================== */
router.post('/', async (req, res) => {
  const { id_usuario, id_conteudo } = req.body;
  if (!id_usuario || !id_conteudo) {
    return res.status(400).json({ error: 'id_usuario e id_conteudo são obrigatórios' });
  }

  try {
    const [existe] = await db.query(
      "SELECT 1 FROM favoritos WHERE id_usuario = ? AND id_conteudo = ? LIMIT 1",
      [id_usuario, id_conteudo]
    );

    if (existe.length > 0) {
      await db.query(
        "UPDATE favoritos SET statusAtivo = 1 WHERE id_usuario = ? AND id_conteudo = ?",
        [id_usuario, id_conteudo]
      );
    } else {
      await db.query(
        "INSERT INTO favoritos (id_usuario, id_conteudo, statusAtivo) VALUES (?, ?, 1)",
        [id_usuario, id_conteudo]
      );
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Erro ao adicionar favorito:', err);
    res.status(500).send('Erro ao adicionar favorito');
  }
});

/* ===========================
   DESATIVAR FAVORITO
   PUT /api/favoritos/remover
=========================== */
router.put('/remover', async (req, res) => {
  const { id_usuario, id_conteudo } = req.body;
  if (!id_usuario || !id_conteudo) {
    return res.status(400).json({ error: 'id_usuario e id_conteudo são obrigatórios' });
  }

  try {
    await db.query(
      "UPDATE favoritos SET statusAtivo = 0 WHERE id_usuario = ? AND id_conteudo = ?",
      [id_usuario, id_conteudo]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Erro ao remover favorito:', err);
    res.status(500).send('Erro ao remover favorito');
  }
});

module.exports = router;