import apiDocsContribution from '@/controllers/contributions/api/apiDocsContribution';
import editEntityContribution from '@/controllers/contributions/edit/editEntityContribution';
import generalContributionController from '@/controllers/contributions/general/generalContributionController';
import newDynastyContribution from '@/controllers/contributions/new/newDynastyContribution';
import newEntityContribution from '@/controllers/contributions/new/newEntityContribution';
import newRulerContribution from '@/controllers/contributions/new/newRulerContribution';
import newWarContribution from '@/controllers/contributions/new/newWarContribution';
import { Router } from 'express';

const contributionsRouter = Router();

// New contributions endpoints
contributionsRouter.post('/new/entity', newEntityContribution);
contributionsRouter.post('/new/dynasty', newDynastyContribution);
contributionsRouter.post('/new/ruler', newRulerContribution);
contributionsRouter.post('/new/war', newWarContribution);

// Edit contributions endpoints
contributionsRouter.post('/edit', editEntityContribution);

// API & Docs contributions endpoints
contributionsRouter.post('/api', apiDocsContribution);

// General contributions endpoints
contributionsRouter.post('/general', generalContributionController);

export default contributionsRouter;
