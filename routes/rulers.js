const express = require('express');
const {
  getAllRulers,
  getRulerById,
  getRulerBySlugName,
  getRulerTitles,
  getRandomRuler,
  getRulersBySearch,
} = require('../controllers/rulers');

const router = express.Router();

// Routes
// GET routes
router.get('/', getAllRulers);
router.get('/search/titles', getRulerTitles);
router.get('/random', getRandomRuler);

// GET routes (with params)
router.get('/s/:search', getRulersBySearch);
router.get('/id/:id', getRulerById);
router.get('/:slug', getRulerBySlugName);

module.exports = router;
