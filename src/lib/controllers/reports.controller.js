const DatabaseService = require('../services/database.service');
const tryMiddlewareDecorator = require('../utils/try-middleware-decorator');
const Validator = require('../utils/precondition-validator');
const constants = require('../constants/');
const storage = require('../storage/');

const { ConnectionPool, RepoFactory } = storage;
const conn = new ConnectionPool(constants.STORE.TYPES.MONGO_DB);
const repo = RepoFactory.manufacture(constants.STORE.TYPES.MONGO_DB);
const tableName = 'financeReport';

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
  const studioName = req.params.studio;

  const data = await repo.select(conn, tableName, { name: studioName });

  return res.status(constants.SYSTEM.HTTP_STATUS_CODES.CREATED).json(data);
};

module.exports = exports = {
  subscribe: tryMiddlewareDecorator(subscribe),
  getStudio: tryMiddlewareDecorator(getStudio),
};
