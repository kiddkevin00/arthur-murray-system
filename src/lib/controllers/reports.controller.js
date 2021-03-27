const DatabaseService = require('../services/database.service');
const tryMiddlewareDecorator = require('../utils/try-middleware-decorator');
const Validator = require('../utils/precondition-validator');
const constants = require('../constants');

const getStudioReports = async (req, res) => {
  const studio = req.params.studio && req.params.studio.trim();

  Validator.shouldNotBeEmpty(studio, 'studio');

  const getStudioReportsStrategy = {
    storeType: constants.STORE.TYPES.MONGO_DB,
    operation: {
      type: constants.STORE.OPERATIONS.SELECT,
      data: [{ name: studio }, { submitted_weeks: -1 }],
    },
    tableName: constants.STORE.TABLE_NAMES.FINANCE_REPORT,
  };

  const result = await DatabaseService.execute(getStudioReportsStrategy);

  return res.status(constants.SYSTEM.HTTP_STATUS_CODES.OK).json(result);
};

module.exports = exports = {
  getStudioReports: tryMiddlewareDecorator(getStudioReports),
};
