const brotli = require('brotli');
const fs = require('fs');
const path = require('path');
const logger = require('../util/logger');

function validateOutputDirectory(outdirOption) {
  return outdirOption
    && !(fs.existsSync(outdirOption) && fs.lstatSync(outdirOption).isDirectory());
}

exports.command = 'compress <paths..>';

exports.aliases = ['c'];

exports.description = 'compress files';

exports.builder = (yargs) => {
  yargs
    .option('outdir', {
      alias: ['o'],
      describe: 'Output directory for compressed files',
      type: 'string',
    })
    .option('verbose', {
      alias: ['v'],
      describe: 'Display verbose output',
      type: 'boolean',
    })
    .option('quality', {
      alias: ['q'],
      describe: 'Compression quality (0-11)',
      type: 'number',
    });
};

exports.handler = (argv) => {
  if (validateOutputDirectory(argv.outdir)) {
    logger.error(`${argv.outdir} is not a directory.`);
    process.exit(1);
  }

  if (argv.paths && argv.paths.length > 0) {
    argv.paths.forEach((filePath) => {
      const exists = fs.existsSync(filePath);
      if (!exists) {
        logger.warn(`could not find file ${filePath}`);
        return;
      }

      fs.readFile(filePath, (readFileErr, fileBuffer) => {
        let compressionQuality = 11;
        if (typeof argv.quality === 'number') {
          if (argv.quality < 0 || argv.quality > 11) {
            logger.warn('Unexpected compression quality provided, defaulting to 11');
          } else {
            compressionQuality = argv.quality;
          }
        }

        const compressedFileBuffer = brotli.compress(fileBuffer, {
          quality: compressionQuality,
        });

        if (compressedFileBuffer === null) {
          logger.warn(`${filePath} could not be compressed`);
          return;
        }

        const outdir = argv.outdir ? argv.outdir : path.dirname(filePath);
        const outFilePath = path.join(outdir, `${path.basename(filePath)}.br`);

        fs.writeFile(outFilePath, compressedFileBuffer, (writeFileErr) => {
          if (writeFileErr) {
            logger.error(`an error occurred while writing to ${outFilePath}. ${writeFileErr}`);
          } else if (argv.verbose) {
            logger.info(`${path.basename(filePath)} was compressed successfully`);
            logger.info(`${path.basename(filePath)} was compressed to ${path.join(outdir, `${path.basename(filePath)}.br`)}`);
          }
        });
      });
    });
  }
};
