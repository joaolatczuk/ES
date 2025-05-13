const db = require('../db');

// REGISTRO DE USUÁRIO
exports.register = (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
  db.query(query, [nome, email, senha], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
      }
      return res.status(500).json({ message: 'Erro ao registrar o usuário.', error: err });
    }

    return res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
  });
};

// LOGIN DE USUÁRIO
exports.login = (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
  }

  const query = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
  db.query(query, [email, senha], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Erro no banco.', error: err });

    if (results.length > 0) {
      return res.status(200).json({ success: true, usuario: results[0] });
    } else {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }
  });
};
