#!/usr/bin/env node

var deleteEmpty = require('..');
var argv = process.argv.slice(2);
var cwd = argv[0] || process.cwd();

deleteEmpty(cwd, function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('done');
  process.exit();
});
