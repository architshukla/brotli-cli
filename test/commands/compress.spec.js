const {
  afterEach, beforeEach, describe, it,
} = require('mocha');
const sinon = require('sinon');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const brotli = require('brotli');
const compressCmd = require('../../lib/commands/compress');
const logger = require('../../lib/util/logger');

describe('compress', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#builder()', () => {
    it('should set up options', () => {
      const expectedOptions = ['outdir', 'verbose', 'quality'];
      const optionSpy = sandbox.stub();
      optionSpy.callsFake(() => ({ option: optionSpy }));
      const mockYargs = { option: optionSpy };

      compressCmd.builder(mockYargs);

      expectedOptions.forEach(o => optionSpy.calledWith(o));
      assert.equal(optionSpy.callCount, expectedOptions.length, 'did not setup expected number of options');
    });
  });

  describe('#handler()', () => {
    const fakeFilePath = '/foo/bar';

    it('should validate if files exist', () => {
      const fileExistsStub = sandbox.stub(fs, 'existsSync').callsFake(() => false);
      const logWarnStub = sandbox.stub(logger, 'warn');

      compressCmd.handler({ paths: [fakeFilePath] });

      assert.ok(fileExistsStub.calledOnce, 'fs.existsSync() was not called once');
      assert.ok(fileExistsStub.calledWith(fakeFilePath), 'fs.existsSync() was not called with the expected path');
      assert.ok(logWarnStub.calledOnce, 'logger.warn() was not called once');
      assert.ok(logWarnStub.calledWithMatch(fakeFilePath), 'logger.warn() was not called with the expected path');
    });

    it('should log a warning if the file could not be compressed', () => {
      const fileBuffer = Buffer.from('fileContents', 'utf-8');
      const logWarnStub = sandbox.stub(logger, 'warn');
      const existsStub = sandbox.stub(fs, 'existsSync').callsFake(() => true);
      const readFileStub = sandbox.stub(fs, 'readFile').callsFake((filePath, cb) => cb(null, fileBuffer));
      const compressStub = sandbox.stub(brotli, 'compress').callsFake(() => null);

      compressCmd.handler({ paths: [fakeFilePath] });

      assert.ok(logWarnStub.calledOnce, 'logger.warn() was not called once');
      assert.ok(logWarnStub.calledWithMatch(fakeFilePath), 'logger.warn() was not called with the expected path');
      assert.ok(existsStub.calledOnce, 'fs.existsSync() was not called once');
      assert.ok(existsStub.calledWith(fakeFilePath), 'fs.existsSync() was not called with the expected path');
      assert.ok(readFileStub.calledOnce, 'fs.readFile() was not called once');
      assert.ok(readFileStub.calledWith(fakeFilePath), 'fs.readFile() was not called with the expected path');
      assert.ok(compressStub.calledOnce, 'brotli.compress() was not called once');
      assert.ok(compressStub.calledWith(fileBuffer), 'brotli.compress() was not called with the expected file buffer');
    });

    it('should log an error if writing the compressed file fails', () => {
      const writeError = 'write error message';
      const outputFilePath = path.join(path.dirname(fakeFilePath), `${path.basename(fakeFilePath)}.br`);
      const fileBuffer = Buffer.from('fileContents', 'utf-8');
      const compressedFileBuffer = Buffer.from('contents', 'utf-8');
      const logErrorStub = sandbox.stub(logger, 'error');
      const existsStub = sandbox.stub(fs, 'existsSync').callsFake(() => true);
      const readFileStub = sandbox.stub(fs, 'readFile').callsFake((filePath, cb) => cb(null, fileBuffer));
      const writeFileStub = sandbox.stub(fs, 'writeFile').callsFake((filePath, contents, cb) => cb(writeError));
      const compressStub = sandbox.stub(brotli, 'compress').callsFake(() => compressedFileBuffer);

      compressCmd.handler({ paths: [fakeFilePath] });

      assert.ok(logErrorStub.calledOnce, 'logger.error() was not called once');
      assert.ok(logErrorStub.calledWithMatch(writeError), 'logger.error() was not called with the expected error message');
      assert.ok(existsStub.calledOnce, 'fs.existsSync() was not called once');
      assert.ok(existsStub.calledWith(fakeFilePath), 'fs.existsSync() was not called with the expected path');
      assert.ok(readFileStub.calledOnce, 'fs.readFile() was not called once');
      assert.ok(readFileStub.calledWith(fakeFilePath), 'fs.readFile() was not called with the expected path');
      assert.ok(compressStub.calledOnce, 'brotli.compress() was not called once');
      assert.ok(compressStub.calledWith(fileBuffer), 'brotli.compress() was not called with the expected file buffer');
      assert.ok(writeFileStub.calledOnce, 'fs.writeFile() was not called once');
      assert.ok(writeFileStub.calledWith(outputFilePath, compressedFileBuffer), 'fs.writeFile() was not called with the expected parameters');
    });

    it('should succeed if no error occurs while writing the compressed file', () => {
      const outputFilePath = path.join(path.dirname(fakeFilePath), `${path.basename(fakeFilePath)}.br`);
      const fileBuffer = Buffer.from('fileContents', 'utf-8');
      const compressedFileBuffer = Buffer.from('contents', 'utf-8');
      const logErrorStub = sandbox.stub(logger, 'error');
      const existsStub = sandbox.stub(fs, 'existsSync').callsFake(() => true);
      const readFileStub = sandbox.stub(fs, 'readFile').callsFake((filePath, cb) => cb(null, fileBuffer));
      const writeFileStub = sandbox.stub(fs, 'writeFile').callsFake((filePath, contents, cb) => cb(null));
      const compressStub = sandbox.stub(brotli, 'compress').callsFake(() => compressedFileBuffer);

      compressCmd.handler({ paths: [fakeFilePath] });

      assert.ok(logErrorStub.notCalled, 'logger.error() was called at least once');
      assert.ok(existsStub.calledOnce, 'fs.existsSync() was not called once');
      assert.ok(existsStub.calledWith(fakeFilePath), 'fs.existsSync() was not called with the expected path');
      assert.ok(readFileStub.calledOnce, 'fs.readFile() was not called once');
      assert.ok(readFileStub.calledWith(fakeFilePath), 'fs.readFile() was not called with the expected path');
      assert.ok(compressStub.calledOnce, 'brotli.compress() was not called once');
      assert.ok(compressStub.calledWith(fileBuffer), 'brotli.compress() was not called with the expected file buffer');
      assert.ok(writeFileStub.calledOnce, 'fs.writeFile() was not called once');
      assert.ok(writeFileStub.calledWith(outputFilePath, compressedFileBuffer), 'fs.writeFile() was not called with the expected parameters');
    });

    describe('--outdir option', () => {
      let logErrorStub;
      let processExitStub;

      beforeEach(() => {
        logErrorStub = sandbox.stub(logger, 'error');
        processExitStub = sandbox.stub(process, 'exit');
      });

      it('should validate value was passed', () => {
        compressCmd.handler({ outdir: null });

        assert.ok(logErrorStub.notCalled);
        assert.ok(processExitStub.notCalled);
      });

      it('should log an error and exit if output directory does not exist', () => {
        const directoryName = 'foo';
        const fileExistsStub = sandbox.stub(fs, 'existsSync').callsFake(() => false);

        compressCmd.handler({ outdir: directoryName });

        assert.ok(fileExistsStub.calledOnce);
        assert.ok(fileExistsStub.calledWith(directoryName));
        assert.ok(logErrorStub.calledOnce);
        assert.ok(logErrorStub.calledWithMatch(directoryName));
        assert.ok(processExitStub.calledOnce);
        assert.ok(processExitStub.calledWith(1));
      });

      it('should log an error and exit if the value passed is not directory', () => {
        const directoryName = 'foo';
        const fileExistsStub = sandbox.stub(fs, 'existsSync').callsFake(() => true);
        const fileStatStub = sandbox.stub(fs, 'lstatSync').callsFake(() => ({
          isDirectory: () => false,
        }));

        compressCmd.handler({ outdir: directoryName });

        assert.ok(fileExistsStub.calledOnce);
        assert.ok(fileExistsStub.calledWith(directoryName));
        assert.ok(fileStatStub.calledOnce);
        assert.ok(fileStatStub.calledWith(directoryName));
        assert.ok(logErrorStub.calledOnce);
        assert.ok(processExitStub.calledOnce);
        assert.ok(processExitStub.calledWith(1));
      });

      it('should not log an error if a value is passed and is a valid directory', () => {
        const directoryName = 'foo';
        const fileExistsStub = sandbox.stub(fs, 'existsSync').callsFake(() => true);
        const fileStatStub = sandbox.stub(fs, 'lstatSync').callsFake(() => ({
          isDirectory: () => true,
        }));

        compressCmd.handler({ outdir: directoryName });

        assert.ok(fileExistsStub.calledOnce);
        assert.ok(fileExistsStub.calledWith(directoryName));
        assert.ok(fileStatStub.calledOnce);
        assert.ok(fileStatStub.calledWith(directoryName));
        assert.ok(logErrorStub.notCalled);
        assert.ok(processExitStub.notCalled);
      });
    });
  });
});
