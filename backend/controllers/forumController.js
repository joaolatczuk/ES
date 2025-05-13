const db = require('../db');

exports.enviarPergunta = (req, res) => {
  const { titulo, mensagem } = req.body;
  const query = 'INSERT INTO forum (titulo, mensagem) VALUES (?, ?)';
  db.query(query, [titulo, mensagem], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erro ao enviar pergunta.', error: err });
    return res.status(201).json({ message: 'Pergunta enviada com sucesso!' });
  });
};

exports.listarPerguntas = (req, res) => {
  db.query('SELECT * FROM forum ORDER BY id DESC', (err, result) => {
    if (err) return res.status(500).json({ message: 'Erro ao listar perguntas.', error: err });
    return res.json(result);
  });
};
