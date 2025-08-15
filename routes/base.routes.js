const getBaseRouteLinks = require('@/controllers/base/getBaseRouteLinks.controller');
const express = require('express');

const router = express.Router();

router.get('/', getBaseRouteLinks);

module.exports = router;
