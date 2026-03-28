import express from 'express';
import apiRecovery from '@/controllers/users/apiRecovery';
import apiRegistration from '@/controllers/users/apiRegistration';
import apiResend from '@/controllers/users/apiResend';
import apiVerify from '@/controllers/users/apiVerify';

const usersRouter = express.Router({ strict: false });

usersRouter.post('/verify', apiVerify);
usersRouter.post('/register', apiRegistration);
usersRouter.post('/recover', apiRecovery);
usersRouter.post('/resend', apiResend);

export default usersRouter;
