// Global imports
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
dotenv.config();

// Router imports
import dynastiesRouter from '@/routes/dynasties';
import rulersRouter from '@/routes/rulers';
import healthCheckRouter from '@/routes/healthcheck';
import versionRouter from '@/routes/version';
import apiInfoRouter from '@/routes/info';
import baseRouter from '@/routes/base';
import usersRouter from '@/routes/users';

const app = express();

// Third-party middlewares
if (process.env?.['NODE_ENV'] === 'development') {
  app.use(morgan('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Routing
app.use('/', baseRouter);
app.use('/api/v1/dynasties', dynastiesRouter);
app.use('/api/v1/rulers', rulersRouter);
app.use('/api/v1/users', usersRouter);

app.use('/api/health', healthCheckRouter);
app.use('/api/version', versionRouter);
app.use('/api/info', apiInfoRouter);

export default app;
