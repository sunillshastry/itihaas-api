const express = require('express');
const { getAllRulers } = require('../controllers/rulers');

const router = express.Router();

// Routes
// GET routes
router.get('/', getAllRulers);

module.exports = router;
