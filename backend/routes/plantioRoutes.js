const express = require('express');
const router = express.Router();
const plantioController = require('../controllers/plantioController');

router.post('/registrar', plantioController.registrarPlantio);
router.get('/listar', plantioController.listarPlantios);

module.exports = router;
