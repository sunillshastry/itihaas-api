import getApiVersion from '@/controllers/version/getApiVersion';
import express from 'express';

const versionRouter = express.Router();

// Routes
versionRouter.get('/', getApiVersion);

// Router export
export default versionRouter;
