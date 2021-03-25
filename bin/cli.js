#!/usr/bin/env node

'use strict';

const path = require('path');
const { cyan, bold, green, symbols } = require('ansi-colors');
const deleteEmpty = require('..');
const argv = require('minimist')(process.argv.slice(2), {
  boolean: true,
  number: true,
  alias: { d: 'dryRun' }
});

const help = () => `
  Path: <${path.dirname(__dirname)}>

  Usage: ${cyan('$ delete-empty <directory> [options]')}

  Directory: (optional) Initial directory to begin the search for empty
             directories. Otherwise, cwd is used.

  [Options]:
    -c, --cwd           Set the current working directory for folders to search.
    -d, --dryRun        Do a dry run without deleting any files.
    -h, --help          Display this help menu
    -V, --version       Display the current version of rename
    -v, --verbose       Display all verbose logging messages (currently not used)
`;

if (argv.help) {
  console.log(help());
  process.exit();
}

const ok = green(symbols.check);
const cwd = path.resolve(argv._[0] || argv.cwd || process.cwd());

console.log(bold(`delete-empty v${require('../package').version}`));

deleteEmpty(cwd, argv)
  .then(({ deleted }) => {
    console.log(ok, 'Deleted', deleted.length, 'empty directories');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
