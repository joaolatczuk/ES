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

/* ===========================
    CRUD de Conteúdos
=========================== */

// 🔹 Criar novo conteúdo com imagens
router.post('/', upload.array('imagens'), async (req, res) => {
  try {
    const {
      nomePlanta, id_categoria, id_epoca, temperatura,
      id_solo, rega, id_sol, instrucoes, id_autor
    } = req.body;
    const data_publicacao = new Date();

    const sql = `
      INSERT INTO conteudos (
        nomePlanta, id_categoria, id_epoca, temperatura, id_solo, rega, id_sol, instrucoes,
        id_autor, data_publicacao, status, statusAtivo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', 1)
    `;

    const valores = [
      nomePlanta, id_categoria, id_epoca, temperatura,
      id_solo, rega, id_sol, instrucoes, id_autor, data_publicacao
    ];

    const [insertResult] = await db.query(sql, valores);
    const id_conteudo = insertResult.insertId;

    // Salvar imagens se houver
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

// 🔸 Listar conteúdos pendentes
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

// 🔹 Listar todos os conteúdos com filtros (exceto rejeitados e excluídos)
router.get('/', async (req, res) => {
  try {
    const { status, id_categoria, id_epoca, id_solo, id_sol } = req.query;

    let sql = `
      SELECT c.*, u.nome AS autor, GROUP_CONCAT(i.url) AS imagens
      FROM conteudos c
      LEFT JOIN imagens_conteudo i ON c.id = i.id_conteudo
      LEFT JOIN usuarios u ON c.id_autor = u.id
      WHERE c.statusAtivo != 0 AND c.status != 'rejeitado'
    `;
    const params = [];

    // Adicionar cláusulas WHERE baseadas nos filtros recebidos
    if (status) {
      sql += ` AND c.status = ?`;
      params.push(status);
    }
    if (id_categoria) {
      sql += ` AND c.id_categoria = ?`;
      params.push(id_categoria);
    }
    if (id_epoca) {
      sql += ` AND c.id_epoca = ?`;
      params.push(id_epoca);
    }
    if (id_solo) {
      sql += ` AND c.id_solo = ?`;
      params.push(id_solo);
    }
    if (id_sol) {
      sql += ` AND c.id_sol = ?`;
      params.push(id_sol);
    }

    sql += ` GROUP BY c.id ORDER BY c.data_publicacao DESC`;

    const [results] = await db.query(sql, params);

    results.forEach(r => r.imagens = r.imagens ? r.imagens.split(',') : []);
    res.json(results);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// 🔸 Exclusão lógica
router.put('/:id/excluir', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE conteudos SET statusAtivo = 0 WHERE id = ?', [id]);
    res.json({ sucesso: true, mensagem: 'Conteúdo marcado como excluído.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// 🔸 Atualizar status (aprovado/rejeitado)
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

router.get('/contagem/:idUsuario', async (req, res) => {
  try {
    const idUsuario = parseInt(req.params.idUsuario, 10);
    if (Number.isNaN(idUsuario)) {
      return res.status(400).json({ error: 'idUsuario inválido' });
    }

    const [rows] = await db.query(
      `SELECT COUNT(*) AS totalPostagens
         FROM conteudos
        WHERE id_autor = ?
          AND status = 'aprovado'
          AND statusAtivo = 1`,
      [idUsuario]
    );

    res.json({ totalPostagens: rows?.[0]?.totalPostagens || 0 });
  } catch (err) {
    console.error('Erro contagem postagens:', err);
    res.status(500).json({ error: 'Erro ao buscar postagens' });
  }
});

// 🔍 Buscar por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query(`
      SELECT 
        c.*,
        u.nome AS autor,

        cat.nome AS categoria,
        cat.url  AS categoria_icon,   -- 🔹 pega url do ícone da categoria

        ep.nome  AS epoca,
        ep.url   AS epoca_icon,       -- 🔹 pega url do ícone da época

        solo.nome AS solo,
        solo.url  AS solo_icon,       -- 🔹 pega url do ícone do solo

        sol.nome AS sol,
        sol.url  AS sol_icon,         -- 🔹 pega url do ícone do tipo de sol

        GROUP_CONCAT(i.url) AS imagens
      FROM conteudos c
      LEFT JOIN usuarios        u    ON c.id_autor    = u.id
      LEFT JOIN conteudocategoria cat ON c.id_categoria = cat.id
      LEFT JOIN conteudoepoca     ep  ON c.id_epoca     = ep.id
      LEFT JOIN conteudosolo      solo ON c.id_solo      = solo.id
      LEFT JOIN conteudosol       sol  ON c.id_sol       = sol.id
      LEFT JOIN imagens_conteudo  i    ON c.id           = i.id_conteudo
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);

    if (results.length === 0) {
      return res.status(404).json({ erro: 'Conteúdo não encontrado' });
    }

    const base = 'http://localhost:5000';
    const addBase = (u) => (u ? (u.startsWith('http') ? u : `${base}${u}`) : null);

    const conteudo = results[0];
    conteudo.imagens = conteudo.imagens ? conteudo.imagens.split(',').map(addBase) : [];

    // 🔹 prefixa base nos ícones vindos do BD
    conteudo.categoria_icon = addBase(conteudo.categoria_icon);
    conteudo.epoca_icon     = addBase(conteudo.epoca_icon);
    conteudo.solo_icon      = addBase(conteudo.solo_icon);
    conteudo.sol_icon       = addBase(conteudo.sol_icon);

    res.json(conteudo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

// 🔴 Exclusão permanente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM imagens_conteudo WHERE id_conteudo = ?', [id]);
    const [result] = await db.query('DELETE FROM conteudos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Conteúdo não encontrado.' });
    }

    res.json({ sucesso: true, mensagem: 'Conteúdo excluído permanentemente.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

/* ===========================
    Listas auxiliares (para filtros)
=========================== */
// 🔹 Categorias
router.get('/categorias', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM conteudocategoria');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// 🔹 Épocas
router.get('/epocas', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM conteudoepoca');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// 🔹 Solos
router.get('/solos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM conteudosolo');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// 🔹 Tipo de Sol
router.get('/sol', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM conteudosol');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get('/favoritos/contagem/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;

  // Query SQL para contar os favoritos ativos do usuário
  const sql = 'SELECT COUNT(*) AS totalFavoritos FROM favoritos WHERE id_usuario = ? AND statusAtivo = 1';
  
  db.query(sql, [id_usuario], (err, result) => {
      if (err) {
          console.error('Erro ao consultar o banco de dados:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      
      // Retorna o resultado da contagem
      const totalFavoritos = result[0].totalFavoritos;
      res.status(200).json({ totalFavoritos });
  });
});

router.get('/conteudos/contagem/:id_autor', (req, res) => {
  const { id_autor } = req.params;

  // Query SQL para contar os conteúdos aprovados e ativos
  const sql = 'SELECT COUNT(*) AS totalPostagens FROM conteudos WHERE id_autor = ? AND statusAprovado = 1 AND statusAtivo = 1';
  
  db.query(sql, [id_autor], (err, result) => {
      if (err) {
          console.error('Erro ao consultar o banco de dados:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      
      // Retorna o resultado da contagem
      const totalPostagens = result[0].totalPostagens;
      res.status(200).json({ totalPostagens });
  });
});

// 🔹 Última postagem do autor (apenas aprovadas e ativas)
// GET /api/conteudos/ultimo/:id_autor
router.get('/ultimo/:id_autor', async (req, res) => {
  const { id_autor } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.nomePlanta, c.data_publicacao
         FROM conteudos c
        WHERE c.id_autor = ?
          AND c.statusAtivo = 1
          AND c.status = 'aprovado'
        ORDER BY c.data_publicacao DESC
        LIMIT 1`,
      [id_autor]
    );

    if (!rows.length) {
      return res.json(null); // sem postagem
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar última postagem:', err);
    res.status(500).json({ error: 'Erro ao buscar última postagem' });
  }
});

module.exports = router;