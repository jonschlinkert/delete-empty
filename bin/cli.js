#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import minimist from 'minimist';
import colors from 'ansi-colors';
import deleteEmpty from '../index.js';

const pkg = JSON.parse(fs.readFileSync(path.join('../package.json')));
const { cyan, bold } = colors;

const argv = minimist(process.argv.slice(2), {
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

const version = () => `delete-empty ${cyan(`v${pkg.version}`)}`;

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
const dir = argv._[0] || argv.cwd;
const cwd = dir ? path.resolve(dir) : process.cwd();

deleteEmpty(cwd, argv)
  .then(({ deleted }) => {
    console.log('deleted', deleted.length, 'empty directories');

    const usage = process.memoryUsage();
    console.log('memory usage:');

    for (const [key, value] of Object.entries(usage)) {
      console.log(`  ${key} ${Math.round(value / 1024 / 1024 * 100) / 100} MB`);
    }

    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
