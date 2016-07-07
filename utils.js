'use strict';

var fs = require('fs');
var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Module dependencies
 */

require('async');
require('delete', 'del');
require('matched', 'glob');
require = fn;

function tryReaddir(dir) {
  try {
    return fs.readdirSync(dir);
  } catch (err) {}
  return [];
}

utils.empty = function(dir, cb) {
  fs.readdir(dir, function(err, files) {
    // Ignore .DS_Store on MacOS
    files.splice(files.indexOf('.DS_Store'), 1);
    if (err) {
      // if it doesn't exist, we don't
      // need to do anything
      if (err.code === 'ENOENT') {
        return cb(null, false);
      }
      return cb(err);
    }
    cb(null, files.length === 0);
  });
};

utils.emptySync = function(dir) {
  try {
    var files = tryReaddir(dir);
    return files.length === 0;
  } catch (err) {
    if (err & err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
