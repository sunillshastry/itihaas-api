// Package imports
const express = require('express');

const router = express.Router();
const {
  getAllDynasties,
  getDynastiesById,
  getDynastyBySlugName,
  getDynastyTitles,
} = require('../controllers/dynasties');

// Routes
// GET Routes
router.get('/', getAllDynasties);
router.get('/id/:id', getDynastiesById);
router.get('/:slug', getDynastyBySlugName);
router.get('/titles', getDynastyTitles);

// Router export
module.exports = router;
