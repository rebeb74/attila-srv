const login = require('./login');
const users = require('./users');
const events = require('./events');
const tasks = require('./tasks');
const register = require('./register');

/**
 * Routes.
 * @module routes
 */
module.exports = [login, users, events, tasks, register];