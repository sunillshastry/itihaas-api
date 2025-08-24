// Package imports
const apiRegistration = require('@/controllers/users/apiRegistration.controller');
const apiVerify = require('@/controllers/users/apiVerify.controller');
const express = require('express');

const router = express.Router({ strict: false });

router.post('/verify', apiVerify);
router.post('/register', apiRegistration);
router.post('/recover');

module.exports = router;
