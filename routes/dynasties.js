// Package imports
const express = require('express');

const router = express.Router();
const { getAllDynasties } = require('../controllers/dynasties');

// Routes
// GET Routes
router.get('/', getAllDynasties);

// Router export
module.exports = router;
