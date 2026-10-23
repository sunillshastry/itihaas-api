import apiKeyRegistration from '@/controllers/users/apiKeyRegistration';
import apiKeyVerification from '@/controllers/users/apiKeyVerification';
import express from 'express';

const usersRouter = express.Router({ strict: false });

// usersRouter.post('/verify', apiVerify);
// usersRouter.post('/register', apiRegistration);
// usersRouter.post('/recover', apiRecovery);
// usersRouter.post('/resend', apiResend);

usersRouter.post('/register', apiKeyRegistration);
usersRouter.post('/verify', apiKeyVerification);

export default usersRouter;
