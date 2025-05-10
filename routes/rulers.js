const express = require('express');
const { getAllRulers, getRulerById } = require('../controllers/rulers');

const router = express.Router();

// Routes
// GET routes
router.get('/', getAllRulers);
router.get('/id/:id', getRulerById);

module.exports = router;
