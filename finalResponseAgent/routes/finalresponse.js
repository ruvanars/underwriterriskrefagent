const express = require('express');
const router = express.Router();
const { handleFinalResponse } = require('../controller/finalResponse');

router.post('/', handleFinalResponse);

module.exports = router;
