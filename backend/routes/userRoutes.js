const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const userController = require('../controllers/userController');
const db = require('../dbFunctions/db');

/* ===========================
   Auth
=========================== */
router.post('/register', userController.register);
router.post('/login', userController.login);

/* ===========================
   Helpers: Multer para foto de perfil
=========================== */
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Garante a pasta
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = /^image\/(png|jpe?g|gif|webp|bmp)$/i.test(file.mimetype);
  cb(ok ? null : new Error('Arquivo de imagem inválido'), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ===========================
   Usuário: ler/atualizar dados
=========================== */
// GET /api/users/:id - perfil
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT id, nome, email, tipo, endereco_num, endereco_rua, endereco_bairro, endereco_cep,
              numero_celular, foto_perfil
         FROM usuarios
        WHERE id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/users/:id ->', err);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// PUT /api/users/:id - campos básicos
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email,
      numero_celular,
      endereco_rua,
      endereco_num,
      endereco_bairro,
      endereco_cep,
    } = req.body;

    await db.query(
      `UPDATE usuarios
          SET email = COALESCE(?, email),
              numero_celular = COALESCE(?, numero_celular),
              endereco_rua = COALESCE(?, endereco_rua),
              endereco_num = COALESCE(?, endereco_num),
              endereco_bairro = COALESCE(?, endereco_bairro),
              endereco_cep = COALESCE(?, endereco_cep)
        WHERE id = ?`,
      [
        email ?? null,
        numero_celular ?? null,
        endereco_rua ?? null,
        endereco_num ?? null,
        endereco_bairro ?? null,
        endereco_cep ?? null,
        id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/users/:id ->', err);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

/* ===========================
   Senha (sem limite mínimo)
=========================== */
router.put('/:id/senha', async (req, res) => {
  const { id } = req.params;
  const { senha_atual, nova_senha } = req.body;

  if (!senha_atual || !nova_senha) {
    return res.status(400).json({ error: 'Informe senha_atual e nova_senha' });
  }

  try {
    const [rows] = await db.query('SELECT senha FROM usuarios WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado' });

    // ⚠️ Senha em texto plano no seu projeto atual.
    if (String(rows[0].senha) !== String(senha_atual)) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    await db.query('UPDATE usuarios SET senha = ? WHERE id = ?', [nova_senha, id]);
    return res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/users/:id/senha ->', err);
    return res.status(500).json({ error: 'Erro ao alterar senha' });
  }
});

/* ===========================
   Foto de perfil
   PUT /api/users/:id/foto  (FormData: campo "foto")
=========================== */
router.put('/:id/foto', upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });

    // Caminho público para servir no frontend
    const publicUrl = `/uploads/${req.file.filename}`;

    // (Opcional) apaga foto anterior se existir e for dentro de /uploads
    const [prev] = await db.query('SELECT foto_perfil FROM usuarios WHERE id = ?', [id]);
    if (prev.length && prev[0].foto_perfil) {
      const previousPath = path.join(__dirname, '..', prev[0].foto_perfil.replace(/^\//, ''));
      if (previousPath.startsWith(UPLOAD_DIR) && fs.existsSync(previousPath)) {
        fs.unlink(previousPath, () => {}); // sem travar a resposta
      }
    }

    // Grava no banco
    await db.query('UPDATE usuarios SET foto_perfil = ? WHERE id = ?', [publicUrl, id]);

    // Responde com a URL para o front atualizar
    res.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error('PUT /api/users/:id/foto ->', err);
    res.status(500).json({ error: 'Erro ao enviar foto' });
  }
});

module.exports = router;
