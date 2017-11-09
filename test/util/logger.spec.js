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

  function loggerTestHelper(methodName, logLevel) {
    const consoleMethodSpy = sandbox.stub(console, methodName);

    logger[methodName](testMessage);

    assert.ok(consoleMethodSpy.calledOnce, `console.${methodName}() was not called once`);
    [pkg.name, logLevel, testMessage]
      .forEach(m => assert.ok(consoleMethodSpy.args[0][0].indexOf(m) !== -1, `'${m}' was expected to be logged`));
  }

  describe('#info()', () => {
    it('should log an info message with package name and log level', () => {
      loggerTestHelper('info', infoLogLevel);
    });
  });

  describe('#warn()', () => {
    it('should log a warning with package name and log level', () => {
      loggerTestHelper('warn', warnLogLevel);
    });
  });

  describe('#error()', () => {
    it('should log an error with package name and log level', () => {
      loggerTestHelper('error', errorLogLevel);
    });
  });
});
