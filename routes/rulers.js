const express = require('express');
const {
  getAllRulers,
  getRulerById,
  getRulerBySlugName,
  getRulerTitles,
} = require('../controllers/rulers');

const router = express.Router();

// Routes
// GET routes
router.get('/', getAllRulers);
router.get('/id/:id', getRulerById);
router.get('/:slug', getRulerBySlugName);
router.get('/search/titles', getRulerTitles);

module.exports = router;
