// Package imports
const express = require('express');

const router = express.Router();
const {
  getAllDynasties,
  getDynastiesById,
  getDynastyBySlugName,
} = require('../controllers/dynasties');

// Routes
// GET Routes
router.get('/', getAllDynasties);
router.get('/id/:id', getDynastiesById);
router.get('/:slug', getDynastyBySlugName);

// Router export
module.exports = router;
