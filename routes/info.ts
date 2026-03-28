import getApiInfo from '@/controllers/info/getApiInfo';
import express from 'express';

const apiInfoRouter = express.Router();

apiInfoRouter.get('/', getApiInfo);

export default apiInfoRouter;
