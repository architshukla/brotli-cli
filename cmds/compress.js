'use strict';

const compress = require('brotli/compress');
const fs = require('fs');
const path = require('path');

exports.command = 'compress <paths..>';

exports.aliases = ['c'];

exports.description = 'compress files';

exports.builder = (yargs) => {
  yargs.option('outdir', {
    alias: ['o'],
    describe: 'Output directory for compressed files',
    type: 'string'
  });
};

exports.handler = function (argv) {
  if (argv.outdir && !(fs.existsSync(argv.outdir) && fs.lstatSync(argv.outdir).isDirectory())) {
    console.error(`ERROR: ${argv.outdir} is not a directory.`);
    process.exit(1);
  }

  argv.paths.map(filePath => {
    fs.exists(filePath, (exists) => {
      if (!exists) {
        console.warn(`WARN: could not find file ${filePath}`);
        return;
      }
      fs.readFile(filePath, (err, fileBuffer) => {
        const compressedFileBuffer = compress(fileBuffer);
        if (compressedFileBuffer === null) {
          console.warn(`WARN: file ${filePath} could not be compressed`);
          return;
        }
        let outdir = argv.outdir ? argv.outdir : path.dirname(filePath);
        fs.writeFile(path.join(outdir, path.basename(filePath) + '.br'), compressedFileBuffer, (err) => {
          if (err) {
            throw err;
          } else {
            console.log(`INFO: file ${path.basename(filePath)} was compressed successfully and written to ${path.join(outdir, path.basename(filePath) + '.br')}`)
          }
        });
      });
    });
  });
}
