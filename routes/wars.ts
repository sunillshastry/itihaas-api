import getAllWars from '@/controllers/wars/getAllWars';
import getWarById from '@/controllers/wars/getWarById';
import { Router } from 'express';

const warsRouter = Router();

// Routes
// GET Routes
warsRouter.get('/', getAllWars);

// GET routes (with params)
warsRouter.get('/id/:id', getWarById);

export default warsRouter;
