const { username, password, database, host } = require('../../src/data/databaseConfig')

module.exports = {
  "development": {
    "username": username,
    "password": password,
    "database": database,
    "host": host || "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": username,
    "password": password,
    "database": database,
    "host": host || "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": username,
    "password": password,
    "database": database,
    "host": host || "127.0.0.1",
    "dialect": "mysql"
  }
}
