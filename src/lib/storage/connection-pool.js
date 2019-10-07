const constants = require('../constants/');
const packageJson = require('../../../package.json');
const Promise = require('bluebird');
const mongojs = require('mongojs');
const Sequelize = require('sequelize');

Promise.promisifyAll([
  require('mongojs/lib/collection'), // eslint-disable-line global-require
  require('mongojs/lib/database'), // eslint-disable-line global-require
  require('mongojs/lib/cursor'), // eslint-disable-line global-require
]);

/**
 * This is the only class that is stateful for storage component.
 *
 * [Note] Don't cache the connection for the reason of separation concern. DB Connector (Driver)
 * should be the one handling that itself.
 */
class ConnectionPool {
  constructor(storeType = constants.STORE.TYPES.MONGO_DB, host, port, dbName, dbUser, dbPassword) {
    const packageJsonDbConfig = packageJson.config.databases[storeType];
    const mongoUrl = process.env.MONGO_URL;

    this.client = null;
    this.host = process.env.HOST || host || packageJsonDbConfig.host;
    this.port = process.env.PORT || port || packageJsonDbConfig.port;
    this.dbName = process.env.DBNAME || dbName || packageJsonDbConfig.dbName;
    this.dbUser = process.env.USER || dbUser;
    this.dbPassword = process.env.PASSWORD || dbPassword;

    switch (storeType) {
      case constants.STORE.TYPES.MONGO_DB:
        if (this.dbUser && this.dbPassword) {
          this.client = mongojs(mongoUrl ||
            (`mongodb://${this.dbUser}:${this.dbPassword}@${this.host}:` +
              `${this.port}/${this.dbName}`),
            [],
            packageJsonDbConfig.options
          );
        } else {
          this.client = mongojs(
            `mongodb://${this.host}:${this.port}/${this.dbName}`,
            [],
            packageJsonDbConfig.options
          );
        }
        break;
      case constants.STORE.TYPES.POSTGRES:
        if (this.dbUser && this.dbPassword) {
          this.client = new Sequelize(
            `postgres://${this.dbUser}:${this.dbPassword}@${this.host}:` +
            `${this.port}/${this.dbName}`,
            packageJsonDbConfig.options
          );
        } else {
          this.client = new Sequelize(
            `postgres://${this.host}:${this.port}/${this.dbName}`,
            packageJsonDbConfig.options
          );
        }
        break;
      default:
        throw new Error(constants.STORE.ERROR_MSG.STORAGE_TYPE_NOT_FOUND);
    }
  }
}

module.exports = exports = ConnectionPool;