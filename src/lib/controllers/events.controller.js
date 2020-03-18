const Validator = require('../utils/precondition-validator');
const DatabaseService = require('../services/database.service');
const tryMiddlewareDecorator = require('../utils/try-middleware-decorator');
const constants = require('../constants/');

const getAllEvents = async (req, res) => {
  const getAllEventsStrategy = {
    storeType: constants.STORE.TYPES.MONGO_DB,
    operation: {
      type: constants.STORE.OPERATIONS.SELECT,
      data: [],
    },
    tableName: constants.STORE.TABLE_NAMES.EVENT,
  };

  const result = await DatabaseService.execute(getAllEventsStrategy);

  return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK).json(result);
};

const createEvent = async (req, res) => {
  const name = req.body.name && req.body.name.trim();
  const description = req.body.description && req.body.description.trim();
  const { date } = req.body;

  Validator.shouldNotBeEmpty(name, 'name');
  Validator.shouldNotBeEmpty(description, 'description');
  Validator.shouldNotBeEmpty(date, 'date');

  const createEventsStrategy = {
    storeType: constants.STORE.TYPES.MONGO_DB,
    operation: {
      type: constants.STORE.OPERATIONS.INSERT,
      data: [{ name, description, date }],
    },
    tableName: constants.STORE.TABLE_NAMES.EVENT,
  };

  const result = await DatabaseService.execute(createEventsStrategy);

  return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK).json(result);
};

module.exports = exports = {
  createEvent: tryMiddlewareDecorator(createEvent),
  getAllEvents: tryMiddlewareDecorator(getAllEvents),
};
