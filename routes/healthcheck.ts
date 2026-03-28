import express from 'express';
import getHealthCheck from '@/controllers/healthcheck/getHealthCheck';

const healthCheckRouter = express.Router();

// Routes
healthCheckRouter.get('/', getHealthCheck);

export default healthCheckRouter;
