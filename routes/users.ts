import apiKeyEmailResend from '@/controllers/users/apiKeyEmailResend';
import apiKeyRecovery from '@/controllers/users/apiKeyRecovery';
import apiKeyRegistration from '@/controllers/users/apiKeyRegistration';
import apiKeyVerification from '@/controllers/users/apiKeyVerification';
import express from 'express';

const usersRouter = express.Router({ strict: false });

usersRouter.post('/register', apiKeyRegistration);
usersRouter.post('/verify', apiKeyVerification);
usersRouter.post('/resend', apiKeyEmailResend);
usersRouter.post('/recover', apiKeyRecovery);

export default usersRouter;
