const DatabaseService = require('../services/database.service');
const tryMiddlewareDecorator = require('../utils/try-middleware-decorator');
const Validator = require('../utils/precondition-validator');
const constants = require('../constants/');

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

module.exports = exports = {
  subscribe: tryMiddlewareDecorator(subscribe),
};
