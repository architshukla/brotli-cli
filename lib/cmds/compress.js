const compress = require('brotli/compress');
const fs = require('fs');
const path = require('path');
const logger = require('../util/logger');

exports.command = 'compress <paths..>';

exports.aliases = ['c'];

exports.description = 'compress files';

exports.builder = (yargs) => {
  yargs.option('outdir', {
    alias: ['o'],
    describe: 'Output directory for compressed files',
    type: 'string',
  });
};

exports.handler = (argv) => {
  if (argv.outdir && !(fs.existsSync(argv.outdir) && fs.lstatSync(argv.outdir).isDirectory())) {
    logger.error(`${argv.outdir} is not a directory.`);
    process.exit(1);
  }

  argv.paths.forEach((filePath) => {
    fs.exists(filePath, (exists) => {
      if (!exists) {
        logger.warn(`could not find file ${filePath}`);
        return;
      }
      fs.readFile(filePath, (readFileErr, fileBuffer) => {
        const compressedFileBuffer = compress(fileBuffer);
        if (compressedFileBuffer === null) {
          logger.warn(`file ${filePath} could not be compressed`);
          return;
        }
        const outdir = argv.outdir ? argv.outdir : path.dirname(filePath);
        fs.writeFile(path.join(outdir, `${path.basename(filePath)}.br`), compressedFileBuffer, (writeFileErr) => {
          if (writeFileErr) {
            throw writeFileErr;
          } else {
            logger.info(`file ${path.basename(filePath)} was compressed successfully and written to ${path.join(outdir, `${path.basename(filePath)}.br`)}`);
          }
        });
      });
    });
  });
};
