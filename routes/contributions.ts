import newEntityContribution from '@/controllers/contributions/new/newEntityContribution';
import { Router } from 'express';

const contributionsRouter = Router();

// New contributions endpoints
contributionsRouter.post('/new/entity', newEntityContribution);

export default contributionsRouter;
