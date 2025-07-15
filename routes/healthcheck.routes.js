// Package imports
const getHealthCheck = require('@/controllers/healthcheck/getHealthCheck.controller');
const express = require('express');

const router = express.Router();

// Routes
router.get('/', getHealthCheck);

// Router export
module.exports = router;
