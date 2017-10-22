#!/usr/bin/env node

require('yargs')
  .commandDir('lib/cmds')
  .demandCommand()
  .help()
  .parse();
