const constants = require('../constants/index');
const jwt = require('jsonwebtoken');

const jwtSecret = constants.CREDENTIAL.JWT.SECRET;
const jwtIssuer = constants.CREDENTIAL.JWT.ISSUER;
const jwtAudience = constants.CREDENTIAL.JWT.AUDIENCE;

function authCheckMiddleware(req, res, next) {
  const jwtToken = req.cookies.jwt;

  try {
    const decodedJwt = jwt.verify(jwtToken, jwtSecret, { jwtIssuer, jwtAudience });

    delete decodedJwt.iat;
    delete decodedJwt.nbf;
    delete decodedJwt.exp;
    delete decodedJwt.aud;
    delete decodedJwt.iss;
    delete decodedJwt.sub;

    req.user = decodedJwt; // eslint-disable-line no-param-reassign

    return next();
  } catch (err) {
    return res
      .status(constants.SYSTEM.HTTP_STATUS_CODES.UNAUTHENTICATED)
      .send((err && err.message) || constants.AUTH.ERROR_MSG.JWT_INVALID);
  }
}

module.exports = exports = authCheckMiddleware;
