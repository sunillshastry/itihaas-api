const getAllRulers = require('@/controllers/rulers/getAllRulers');
const getRandomRuler = require('@/controllers/rulers/getRandomRuler');
const getRulerById = require('@/controllers/rulers/getRulerById');
const getRulerBySlugName = require('@/controllers/rulers/getRulerBySlugName');
const getRulersBySearch = require('@/controllers/rulers/getRulersBySearch');
const getRulerTitles = require('@/controllers/rulers/getRulerTitles');
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
