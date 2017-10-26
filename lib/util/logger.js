const chalk = require('chalk');
const pkg = require('../../package.json');

/* eslint-disable no-console */
module.exports = {
  info: msg => console.info(`${pkg.name} ${chalk.cyan('INFO')} ${msg}`),
  warn: msg => console.warn(`${pkg.name} ${chalk.yellow('WARN')} ${msg}`),
  error: msg => console.error(`${pkg.name} ${chalk.red('ERR')} ${msg}`),
};
/* eslint-enable no-console */
