import express from 'express';
import getAllRulers from '@/controllers/rulers/getAllRulers';
import getRandomRuler from '@/controllers/rulers/getRandomRuler';
import getRulerById from '@/controllers/rulers/getRulerById';
import getRulerBySlugName from '@/controllers/rulers/getRulerBySlugName';
import getRulersBySearch from '@/controllers/rulers/getRulersBySearch';
import getRulerTitles from '@/controllers/rulers/getRulerTitles';

const rulerRouter = express.Router();

// Routes
// GET routes
rulerRouter.get('/', getAllRulers);
rulerRouter.get('/search/titles', getRulerTitles);
rulerRouter.get('/random', getRandomRuler);

// GET routes (with params)
rulerRouter.get('/s/:search', getRulersBySearch);
rulerRouter.get('/id/:id', getRulerById);
rulerRouter.get('/:slug', getRulerBySlugName);

export default rulerRouter;
