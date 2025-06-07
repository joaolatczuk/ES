const express = require('express');
const router = express.Router();
const plantioController = require('../controllers/plantioController');
const db = require('../dbFunctions/db');

router.post('/registrar', plantioController.registrarPlantio);
router.get('/listar', plantioController.listarPlantios);

module.exports = router;
