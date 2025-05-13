const db = require('../db');

exports.registrarPlantio = (req, res) => {
  const { data, cultura, observacoes } = req.body;
  const query = 'INSERT INTO plantios (data, cultura, observacoes) VALUES (?, ?, ?)';
  db.query(query, [data, cultura, observacoes], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erro ao registrar plantio.', error: err });
    return res.status(201).json({ message: 'Plantio registrado com sucesso!' });
  });
};

exports.listarPlantios = (req, res) => {
  db.query('SELECT * FROM plantios ORDER BY data DESC', (err, result) => {
    if (err) return res.status(500).json({ message: 'Erro ao listar plantios.', error: err });
    return res.json(result);
  });
};
