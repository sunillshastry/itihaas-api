import getAllWars from '@/controllers/wars/getAllWars';
import getRandomWar from '@/controllers/wars/getRandomWar';
import getWarById from '@/controllers/wars/getWarById';
import getWarBySlugName from '@/controllers/wars/getWarBySlugName';
import { Router } from 'express';

const warsRouter = Router();

// Routes
// GET Routes
warsRouter.get('/', getAllWars);
warsRouter.get('/random', getRandomWar);

// GET routes (with params)
warsRouter.get('/id/:id', getWarById);
warsRouter.get('/:slug', getWarBySlugName);

export default warsRouter;
