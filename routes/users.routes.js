// Package imports
const apiRegistration = require('@/controllers/users/apiRegistration.controller');
const express = require('express');

const router = express.Router({ strict: false });

router.post('/register-api', apiRegistration);

module.exports = router;
