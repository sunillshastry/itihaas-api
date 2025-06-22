// Package imports
const express = require('express');

const router = express.Router();
const {
  getAllDynasties,
  getDynastiesById,
  getDynastyBySlugName,
  getDynastyTitles,
  getRandomDynasty,
  getDynastiesBySearch,
} = require('../controllers/dynasties');

// Routes
// GET Routes
router.get('/', getAllDynasties);
router.get('/search/titles', getDynastyTitles);
router.get('/random', getRandomDynasty);

// GET routes (with params)
router.get('/s/:search', getDynastiesBySearch);
router.get('/id/:id', getDynastiesById);
router.get('/:slug', getDynastyBySlugName);

// Router export
module.exports = router;
