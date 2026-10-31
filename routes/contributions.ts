import newDynastyContribution from '@/controllers/contributions/new/newDynastyContribution';
import newEntityContribution from '@/controllers/contributions/new/newEntityContribution';
import newRulerContribution from '@/controllers/contributions/new/newRulerContribution';
import { Router } from 'express';

const contributionsRouter = Router();

// New contributions endpoints
contributionsRouter.post('/new/entity', newEntityContribution);
contributionsRouter.post('/new/dynasty', newDynastyContribution);
contributionsRouter.post('/new/ruler', newRulerContribution);

export default contributionsRouter;
