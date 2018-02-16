#!/usr/bin/env node

var ok = require('log-ok');
var deleteEmpty = require('..');
var argv = process.argv.slice(2);
var args = argv.filter(arg => (arg !== '-d' && arg !== '--dry-run'));
var cwd = args[0] || process.cwd();
var dryRun = argv.length !== args.length;

deleteEmpty(cwd, { dryRun: dryRun }, function(err, files) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  if (dryRun) {
    console.log('Dry run. Empty directories (not deleted):');
    for (var file in files) ok(files[file]);
    console.log('Total: ', files.length);
  }

  console.log('Done');
  process.exit();
});
