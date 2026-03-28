import getBaseRouteLinks from '@/controllers/base/getBaseRouteLinks';
import express from 'express';

const baseRouter = express.Router();

baseRouter.get('/', getBaseRouteLinks);

export default baseRouter;
