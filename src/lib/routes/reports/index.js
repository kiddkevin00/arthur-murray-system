const Controller = require('../../controllers/reports.controller');
const { Router } = require('express');

const router = Router();

router.post('/subscribe', Controller.subscribe);

module.exports = exports = router;
