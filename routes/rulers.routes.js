const getAllRulers = require('@/controllers/rulers/getAllRulers.controller');
const getRandomRuler = require('@/controllers/rulers/getRandomRuler.controller');
const getRulerById = require('@/controllers/rulers/getRulerById.controller');
const getRulerBySlugName = require('@/controllers/rulers/getRulerBySlugName.controller');
const getRulersBySearch = require('@/controllers/rulers/getRulersBySearch.controller');
const getRulerTitles = require('@/controllers/rulers/getRulerTitles.controller');
const express = require('express');

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
