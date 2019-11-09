const Controller = require('../../controllers/reports.controller');
const { Router } = require('express');

const router = Router();

router.post('/subscribe', Controller.subscribe);

router.get('/studio/:studio', Controller.getStudio);

module.exports = exports = router;
