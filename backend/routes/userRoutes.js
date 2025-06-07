const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const db = require('../dbFunctions/db');

router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;
