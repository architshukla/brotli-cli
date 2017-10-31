#!/usr/bin/env node

require('yargs')
  .commandDir('lib/commands')
  .demandCommand()
  .help()
  .parse();
