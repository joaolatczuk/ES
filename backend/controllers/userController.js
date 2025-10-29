const db = require('../dbFunctions/db');

/* ===========================
   REGISTRO
=========================== */
exports.register = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Se sua tabela já tem default para status/tipo, pode omitir as colunas
    await db.query(
      `INSERT INTO usuarios (nome, email, senha, status, tipo)
       VALUES (?, ?, ?, 'ativo', 'comum')`,
      [nome, email, senha]
    );

    return res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
    }
    return res.status(500).json({ message: 'Erro ao registrar o usuário.', error: err });
  }
};

/* ===========================
   LOGIN
=========================== */
exports.login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
  }

  try {
    // Buscamos 1 usuário pelo e-mail
    const [rows] = await db.query(
      `SELECT id, nome, email, senha, is_admin, status, tipo
         FROM usuarios
        WHERE email = ?
        LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    const u = rows[0];

    // ⚠️ Seu projeto atual usa senha em texto plano
    if (String(u.senha) !== String(senha)) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    // 🔒 Bloqueado
    if (u.status === 'bloqueado') {
      return res.status(403).json({
        success: false,
        blocked: true,
        message: 'Sua conta está bloqueada. Fale com o administrador.'
      });
    }

    // 🔒 Qualquer status diferente de "ativo"
    if (u.status !== 'ativo') {
      return res.status(403).json({
        success: false,
        message: `Conta com status "${u.status}". Acesso negado.`
      });
    }

    // Payload limpo para o front
    const usuario = {
      id: u.id,
      nome: u.nome,
      email: u.email,
      is_admin: !!u.is_admin,
      tipo: u.tipo || (u.is_admin ? 'admin' : 'comum'),
    };

    return res.json({ success: true, usuario });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ success: false, message: 'Erro no banco.', error: err });
  }
};