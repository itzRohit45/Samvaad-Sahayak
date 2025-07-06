const express = require('express');
const apiController = require('../controllers/apiController');
const router = express.Router();

// Process query route
router.post('/query', apiController.processQuery);

// Get schemes route
router.get('/schemes', apiController.getSchemes);

module.exports = router;
