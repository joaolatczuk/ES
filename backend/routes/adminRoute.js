// backend/routes/adminRoute.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../dbFunctions/db');

// ============================================================
// 🧩 Middleware temporário de admin
// (se futuramente usar JWT, troque por req.user?.is_admin)
function requireAdmin(req, res, next) {
  if (req.headers['x-admin'] !== '1') {
    return res.status(403).json({ error: 'Apenas administradores.' });
  }
  next();
}

// ============================================================
// 🔧 Configurações de pastas e upload
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

// Pastas válidas (públicas)
const ALLOWED_FOLDERS = new Set(['solo', 'sol', 'estacao', 'categoria']);

// garante que existam
for (const folder of ALLOWED_FOLDERS) {
  const dir = path.join(PUBLIC_DIR, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Configuração do Multer (armazenamento)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = String(req.query.folder || '').toLowerCase();
    if (!ALLOWED_FOLDERS.has(folder)) {
      return cb(new Error('Pasta inválida. Use solo|sol|estacao|categoria.'));
    }
    const dest = path.join(PUBLIC_DIR, folder);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, `${ts}_${safe}`);
  },
});

const fileFilter = (req, file, cb) => {
  // permitir imagens comuns; SVG inline pode ser perigoso — servir como arquivo estático
  if (/^image\/(png|jpe?g|gif|webp|bmp|svg\+xml)$/i.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

// ============================================================
// 📁 LISTAR arquivos de uma pasta (para o botão "Pesquisar")
// OBS: usamos /static-list para não conflitar com express.static
router.get('/static-list', requireAdmin, (req, res) => {
  try {
    const folder = String(req.query.folder || '').toLowerCase();
    if (!ALLOWED_FOLDERS.has(folder)) {
      return res.status(400).json({ error: 'Parâmetro folder inválido.' });
    }

    const dir = path.join(PUBLIC_DIR, folder);
    if (!fs.existsSync(dir)) return res.json({ files: [] });

    const files = fs
      .readdirSync(dir)
      .filter((f) => !fs.lstatSync(path.join(dir, f)).isDirectory())
      .map((f) => `/${folder}/${f}`); // URLs relativas ao servidor (ex.: /categoria/arquivo.png)

    res.json({ files });
  } catch (err) {
    console.error('Erro ao listar arquivos:', err);
    res.status(500).json({ error: 'Erro ao listar arquivos.' });
  }
});

// ============================================================
// 📤 UPLOAD de imagem (para o botão "Upload")
router.post('/upload', requireAdmin, upload.single('file'), (req, res) => {
  try {
    const folder = String(req.query.folder || '').toLowerCase();
    if (!ALLOWED_FOLDERS.has(folder)) {
      return res.status(400).json({ error: 'Pasta inválida.' });
    }
    if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado.' });

    const url = `/${folder}/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    console.error('Erro no upload:', err);
    res.status(500).json({ error: 'Erro no upload.' });
  }
});

// ============================================================
// 👤 Usuários (exemplo de uso do requireAdmin)
router.get('/usuarios', requireAdmin, async (_req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nome, email, is_admin, status FROM usuarios WHERE deleted_at IS NULL ORDER BY nome ASC'
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
});

router.patch('/usuarios/:id/bloquear', requireAdmin, async (req, res) => {
  try {
    await db.query('UPDATE usuarios SET status="bloqueado" WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Usuário bloqueado.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao bloquear.' });
  }
});

router.patch('/usuarios/:id/ativar', requireAdmin, async (req, res) => {
  try {
    await db.query('UPDATE usuarios SET status="ativo" WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Usuário reativado.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao ativar.' });
  }
});

router.delete('/usuarios/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('UPDATE usuarios SET deleted_at=NOW() WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Usuário excluído (soft delete).' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao excluir.' });
  }
});

// ============================================================
// 🧩 Catálogos: conteudosolo / conteudosol / conteudoepoca / conteudocategoria
const TABLES = {
  conteudosolo:       { folder: '/solo/' },
  conteudosol:        { folder: '/sol/' },
  conteudoepoca:      { folder: '/estacao/' },
  conteudocategoria:  { folder: '/categoria/' },
};

// ✅ Quais colunas existem em cada tabela
const TABLE_COLUMNS = {
  conteudocategoria: ['nome', 'url'],
  conteudoepoca:     ['nome', 'url'],
  conteudosolo:      ['nome', 'observacao', 'url'],
  conteudosol:       ['nome', 'observacao', 'url'],
};

function validateBody(body, tableKey, isUpdate = false) {
  const cols = TABLE_COLUMNS[tableKey] || [];
  const { nome } = body || {};

  if (!isUpdate) {
    if (!nome || typeof nome !== 'string' || !nome.trim()) return 'Informe um nome válido.';
  } else if (nome !== undefined && (typeof nome !== 'string' || !nome.trim())) {
    return 'Nome inválido.';
  }

  // validar url/prefixo, se informado
  if (body.url !== undefined) {
    if (body.url !== null && typeof body.url !== 'string') return 'Campo url inválido.';
    if (body.url && TABLES[tableKey]?.folder && !body.url.startsWith(TABLES[tableKey].folder)) {
      return `A URL deve começar com "${TABLES[tableKey].folder}".`;
    }
  }

  // se a tabela não tiver observacao, remover do payload
  if (!cols.includes('observacao') && body.observacao !== undefined) {
    delete body.observacao;
  }

  return null;
}

// ---------- Listar registros ----------
router.get('/:tabela(conteudosolo|conteudosol|conteudoepoca|conteudocategoria)', requireAdmin, async (req, res) => {
  const { tabela } = req.params;
  try {
    const columns = TABLE_COLUMNS[tabela].join(', ');
    const [rows] = await db.query(
      `SELECT id, ${columns} FROM ${tabela} ORDER BY nome ASC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: `Erro ao listar ${tabela}.` });
  }
});

// ---------- Criar (INSERT dinâmico) ----------
router.post('/:tabela(conteudosolo|conteudosol|conteudoepoca|conteudocategoria)', requireAdmin, async (req, res) => {
  const { tabela } = req.params;

  const payload = { ...req.body }; // clone para limpeza
  const err = validateBody(payload, tabela, false);
  if (err) return res.status(400).json({ error: err });

  try {
    const cols = TABLE_COLUMNS[tabela];
    // manter apenas colunas válidas
    const usedCols = cols.filter(c => payload[c] !== undefined);
    const values   = usedCols.map(c => (payload[c] === '' ? null : payload[c]));

    if (usedCols.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido para inserir.' });
    }

    const placeholders = usedCols.map(() => '?').join(', ');
    const colList = usedCols.join(', ');

    const sql = `INSERT INTO ${tabela} (${colList}) VALUES (${placeholders})`;
    await db.query(sql, values);

    res.json({ success: true, message: 'Registro adicionado com sucesso!' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: `Erro ao inserir em ${tabela}.` });
  }
});

// ---------- Atualizar (UPDATE dinâmico) ----------
router.put('/:tabela(conteudosolo|conteudosol|conteudoepoca|conteudocategoria)/:id', requireAdmin, async (req, res) => {
  const { tabela, id } = req.params;

  const payload = { ...req.body }; // clone para limpeza
  const err = validateBody(payload, tabela, true);
  if (err) return res.status(400).json({ error: err });

  try {
    const cols = TABLE_COLUMNS[tabela];

    const sets = [];
    const params = [];
    cols.forEach((c) => {
      if (payload[c] !== undefined) {
        sets.push(`${c} = ?`);
        params.push(payload[c] === '' ? null : payload[c]);
      }
    });

    if (sets.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
    }

    const sql = `UPDATE ${tabela} SET ${sets.join(', ')} WHERE id = ?`;
    params.push(id);

    await db.query(sql, params);
    res.json({ success: true, message: 'Registro atualizado.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: `Erro ao atualizar ${tabela}.` });
  }
});

// ---------- Excluir ----------
router.delete('/:tabela(conteudosolo|conteudosol|conteudoepoca|conteudocategoria)/:id', requireAdmin, async (req, res) => {
  const { tabela, id } = req.params;
  try {
    await db.query(`DELETE FROM ${tabela} WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Registro excluído.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: `Erro ao excluir de ${tabela}.` });
  }
});

// ---------- Healthcheck ----------
router.get('/ping', (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

module.exports = router;