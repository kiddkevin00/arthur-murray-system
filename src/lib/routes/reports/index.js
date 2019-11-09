const Controller = require('../../controllers/reports.controller');
const { Router } = require('express');

const router = Router();

router.post('/subscribe', Controller.subscribe);

router.get('/studios/:studio', Controller.getStudio);

module.exports = exports = router;
