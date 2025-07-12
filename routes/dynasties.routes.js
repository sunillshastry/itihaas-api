// Package imports
const express = require('express');
const getAllDynasties = require('@/controllers/dynasties/getAllDynasties.controller');
const getDynastyTitles = require('@/controllers/dynasties/getDynastyTitles.controller');
const getRandomDynasty = require('@/controllers/dynasties/getRandomDynasty.controller');
const getDynastiesBySearch = require('@/controllers/dynasties/getDynastiesBySearch.controller');
const getDynastiesById = require('@/controllers/dynasties/getDynastiesById.controller');
const getDynastyBySlugName = require('@/controllers/dynasties/getDynastyBySlugName.controller');

const router = express.Router();

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
