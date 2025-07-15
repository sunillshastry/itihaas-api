// Package imports
const getApiVersion = require('@/controllers/version/getApiVersion.controller');
const express = require('express');

const router = express.Router();

// Routes
router.get('/', getApiVersion);

// Router export
module.exports = router;
