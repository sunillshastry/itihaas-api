import getAllWars from '@/controllers/wars/getAllWars';
import { Router } from 'express';

const warsRouter = Router();

// Routes
// GET Routes
warsRouter.get('/', getAllWars);

export default warsRouter;
