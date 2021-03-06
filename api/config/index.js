const dotenv = require('dotenv');
const dotenvParseVariables = require('dotenv-parse-variables');
const token = require('./token');
const server = require('./server');

let env = dotenv.config({});
if (env.error) throw env.error;
env = dotenvParseVariables(env.parsed);

/**
 * Global configuration.
 * @module config
 */
module.exports = {
  token: token(env),
  server: server(env)
};
