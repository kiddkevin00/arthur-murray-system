const Controller = require('../../controllers/reports.controller');
const { Router } = require('express');

const router = Router();

router.get('/studios/:studio', Controller.getStudioReports);

module.exports = exports = router;
