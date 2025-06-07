const db = require('../dbFunctions/db');

// REGISTRO DE USUÁRIO
exports.register = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    await db.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha]
    );

    return res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
    }

    return res.status(500).json({
      message: 'Erro ao registrar o usuário.',
      error: err
    });
  }
};

// LOGIN DE USUÁRIO
exports.login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Email e senha são obrigatórios.'
    });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
      [email, senha]
    );

    if (rows.length > 0) {
      return res.status(200).json({
        success: true,
        usuario: rows[0]
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.'
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Erro no banco.',
      error: err
    });
  }
};
