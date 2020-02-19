const Controller = require('../../controllers/reports.controller');
const { Router } = require('express');

const router = Router();

router.get('/studios/:studio', Controller.getStudio);

module.exports = exports = router;
