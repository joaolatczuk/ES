const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');

router.post('/perguntar', forumController.enviarPergunta);
router.get('/perguntas', forumController.listarPerguntas);

module.exports = router;
