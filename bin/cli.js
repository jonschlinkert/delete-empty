#!/usr/bin/env node

'use strict';

const path = require('path');
const { cyan, bold, green, symbols } = require('ansi-colors');
const deleteEmpty = require('..');

const argv = require('minimist')(process.argv.slice(2), {
  boolean: true,
  number: true,
  alias: {
    c: 'cwd',
    d: ['dry-run', 'dryRun'],
    h: 'help',
    r: ['delete-root', 'deleteRoot'],
    v: 'version'
  }
});

const version = () => `delete-empty ${cyan(`v${require('../package').version}`)}`;

const help = () => `
  Path: <${path.dirname(__dirname)}>

  Usage: ${cyan('$ delete-empty <directory> [options]')}

  Example: ${cyan('$ delete-empty . [options]')}

  Directory: (optional) Initial directory to begin the search for empty
             directories. Default is process.cwd().

  [Options]:
    -d, --dry-run       Do a dry run without deleting any files
    -r, --delete-root   Also delete the starting dir if it's empty
    -h, --help          Display this help menu
    -V, --version       Display the current version
`;

if (argv.help) {
  console.log(help());
  process.exit();
}

if (argv.version) {
  console.log(version());
  process.exit();
}

console.log(bold(version()));
const ok = green(symbols.check);
const dir = argv._[0] || argv.cwd;
const cwd = dir ? path.resolve(dir) : process.cwd();

deleteEmpty(cwd, argv)
  .then(({ deleted }) => {
    console.log(ok, 'Deleted', deleted.length, 'empty directories');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
