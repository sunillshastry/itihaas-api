// Package imports
const express = require('express');

const router = express.Router();
const {
  getAllDynasties,
  getDynastiesById,
} = require('../controllers/dynasties');

// Routes
// GET Routes
router.get('/', getAllDynasties);
router.get('/id/:id', getDynastiesById);

// Router export
module.exports = router;
