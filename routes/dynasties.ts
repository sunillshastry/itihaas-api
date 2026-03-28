import express from 'express';
import getAllDynasties from '@/controllers/dynasties/getAllDynasties';
import getDynastyTitles from '@/controllers/dynasties/getDynastyTitles';
import getRandomDynasty from '@/controllers/dynasties/getRandomDynasty';
import getDynastiesBySearch from '@/controllers/dynasties/getDynastiesBySearch';
import getDynastiesById from '@/controllers/dynasties/getDynastiesById';
import getDynastyBySlugName from '@/controllers/dynasties/getDynastyBySlugName';

const dynastiesRouter = express.Router();

// Routes
// GET Routes
dynastiesRouter.get('/', getAllDynasties);
dynastiesRouter.get('/search/titles', getDynastyTitles);
dynastiesRouter.get('/random', getRandomDynasty);

// GET routes (with params)
dynastiesRouter.get('/s/:search', getDynastiesBySearch);
dynastiesRouter.get('/id/:id', getDynastiesById);
dynastiesRouter.get('/:slug', getDynastyBySlugName);

export default dynastiesRouter;
