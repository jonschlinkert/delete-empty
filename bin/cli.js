#!/usr/bin/env node

var ok = require('log-ok');
var deleteEmpty = require('..');

var argv = process.argv.slice(2);
var args = argv.filter(function(key) {
  return key !== '-d' && key !== '--dry-run'
});
var cwd = args[0] || process.cwd();
var dryRun = argv.length !== args.length;

deleteEmpty(cwd, {dryRun: dryRun}, function(err, data) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('Done');
  if(dryRun) {
    console.log('Dry run. Empty directories:');
    for(var i in data) {
      ok(data[i]);
    }
    console.log('Total: ', data.length);
  }
  process.exit();
});
