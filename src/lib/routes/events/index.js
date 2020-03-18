const Controller = require('../../controllers/events.controller');
const { Router } = require('express');

const router = Router();

router.get('/', Controller.getAllEvents);
router.post('/', Controller.createEvent);

module.exports = exports = router;
