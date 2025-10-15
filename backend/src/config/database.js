require('ts-node/register');
const config = require('./dbconfig.ts');

module.exports = config.default || config;