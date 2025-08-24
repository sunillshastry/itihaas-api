// Package imports
const apiRecovery = require('@/controllers/users/apiRecovery.controller');
const apiRegistration = require('@/controllers/users/apiRegistration.controller');
const apiResend = require('@/controllers/users/apiResend.controller');
const apiVerify = require('@/controllers/users/apiVerify.controller');
const express = require('express');

const router = express.Router({ strict: false });

router.post('/verify', apiVerify);
router.post('/register', apiRegistration);
router.post('/recover', apiRecovery);
router.post('/resend', apiResend);

module.exports = router;
