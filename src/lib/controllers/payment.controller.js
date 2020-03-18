const Validator = require('../utils/precondition-validator');
const constants = require('../constants/');
const tryMiddlewareDecorator = require('../utils/try-middleware-decorator');
const stripeApi = require('stripe');

const stripe = stripeApi(constants.CREDENTIAL.STRIPE.PRIVATE_KEY);

const proceed = async (req, res) => {
  const { token, userInfo, chargeAmount } = req.body;

  Validator.shouldNotBeEmpty(token, 'token');
  Validator.shouldNotBeEmpty(userInfo, 'userInfo');
  Validator.shouldNotBeEmpty(chargeAmount, 'chargeAmount');

  await stripe.charges.create({
    amount: chargeAmount,
    currency: 'usd',
    description: `Payment for Royalty Fee ${userInfo.studio && `from ${userInfo.studio}`}`,
    source: token,
    metadata: { ...userInfo },
    statement_descriptor_suffix: 'ROYALTYFEE',
  });

  return res.sendStatus(constants.SYSTEM.HTTP_STATUS_CODES.CREATED);
};

module.exports = exports = {
  proceed: tryMiddlewareDecorator(proceed),
};
