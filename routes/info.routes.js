const getApiInfo = require('@/controllers/info/getApiInfo.controller');
const express = require('express');

const router = express.Router();

router.get('/', getApiInfo);

module.exports = router;
