const {
  describe, it, beforeEach, afterEach,
} = require('mocha');
const sinon = require('sinon');
const assert = require('assert');
const logger = require('../../lib/util/logger');
const pkg = require('../../package.json');

describe('logger', () => {
  let sandbox;
  const testMessage = 'test message';
  const infoLogLevel = 'INFO';
  const warnLogLevel = 'WARN';
  const errorLogLevel = 'ERR';

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#info()', () => {
    it('should log an info message with package name and log level', () => {
      const consoleInfoSpy = sinon.stub(console, 'info');

      logger.info(testMessage);

      assert.ok(consoleInfoSpy.calledOnce, 'console.info() was not called once');
      [pkg.name, infoLogLevel, testMessage]
        .forEach(m => assert.ok(consoleInfoSpy.args[0][0].indexOf(m) !== -1, `'${m}' was expected to be logged`));
    });
  });

  describe('#warn()', () => {
    it('should log a warning with package name and log level', () => {
      const consoleWarnSpy = sinon.stub(console, 'warn');

      logger.warn(testMessage);

      assert.ok(consoleWarnSpy.calledOnce, 'console.warn() was not called once');
      [pkg.name, warnLogLevel, testMessage]
        .forEach(m => assert.ok(consoleWarnSpy.args[0][0].indexOf(m) !== -1, `'${m}' was expected to be logged`));
    });
  });

  describe('#error()', () => {
    it('should log an error with package name and log level', () => {
      const consoleErrorSpy = sinon.stub(console, 'error');

      logger.error(testMessage);

      assert.ok(consoleErrorSpy.calledOnce, 'console.error() was not called once');
      [pkg.name, errorLogLevel, testMessage]
        .forEach(m => assert.ok(consoleErrorSpy.args[0][0].indexOf(m) !== -1, `'${m}' was expected to be logged`));
    });
  });
});
