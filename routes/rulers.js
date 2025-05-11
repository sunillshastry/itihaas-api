const express = require('express');
const {
  getAllRulers,
  getRulerById,
  getRulerBySlugName,
} = require('../controllers/rulers');

const router = express.Router();

// Routes
// GET routes
router.get('/', getAllRulers);
router.get('/id/:id', getRulerById);
router.get('/:slug', getRulerBySlugName);

module.exports = router;
