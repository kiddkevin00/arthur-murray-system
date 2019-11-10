const DatabaseService = require('../services/database.service');
const tryMiddlewareDecorator = require('../utils/try-middleware-decorator');
const Validator = require('../utils/precondition-validator');
const constants = require('../constants/');
const storage = require('../storage/');

const { ConnectionPool, RepoFactory } = storage;
const conn = new ConnectionPool(constants.STORE.TYPES.MONGO_DB);
const repo = RepoFactory.manufacture(constants.STORE.TYPES.MONGO_DB);

repo.on(conn, 'connect').then(() => {
  console.log('Connection established successfully.');
});

repo.on(conn, 'error').then(err => console.log(err));

const subscribe = async (req, res) => {
  const email = req.body.email && req.body.email.trim();

  Validator.shouldNotBeEmpty(email, 'email');

  const subscribeStrategy = {
    storeType: constants.STORE.TYPES.MONGO_DB,
    operation: {
      type: constants.STORE.OPERATIONS.UPSERT,
      data: [
        { email },
        {
          email,
          isUnsubscribed: false,
          systemData: {
            dateCreated: new Date(),
            createdBy: 'N/A',
            dateLastModified: null,
            lastModifiedBy: 'N/A',
          },
        },
      ],
    },
    tableName: constants.STORE.TABLE_NAMES.REPORT,
  };

  const result = await DatabaseService.execute(subscribeStrategy);

  return res.status(constants.SYSTEM.HTTP_STATUS_CODES.CREATED).json(result);
};

const getStudio = async (req, res) => {
  const studio = req.params.studio && req.params.studio.trim();

  Validator.shouldNotBeEmpty(studio, 'studio');

  const getStudioStrategy = {
    storeType: constants.STORE.TYPES.MONGO_DB,
    operation: {
      type: constants.STORE.OPERATIONS.SELECT,
      data: [{ name: studio }],
    },
    tableName: constants.STORE.TABLE_NAMES.FINANCEREPORT,
  };

  const result = await DatabaseService.execute(getStudioStrategy);

  return res.status(constants.SYSTEM.HTTP_STATUS_CODES.CREATED).json(result);
};

module.exports = exports = {
  subscribe: tryMiddlewareDecorator(subscribe),
  getStudio: tryMiddlewareDecorator(getStudio),
};
