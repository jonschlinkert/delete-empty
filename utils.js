'use strict';

var fs = require('fs');

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);

/**
 * Temporarily re-assign `require` to trick browserify and
 * webpack into reconizing lazy dependencies.
 *
 * This tiny bit of ugliness has the huge dual advantage of
 * only loading modules that are actually called at some
 * point in the lifecycle of the application, whilst also
 * allowing browserify and webpack to find modules that
 * are depended on but never actually called.
 */

var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('async');
require('delete', 'del');
require('matched', 'glob');

/**
 * Restore `require`
 */

require = fn;

function tryReaddir(dir) {
  try {
    return fs.readdirSync(dir);
  } catch (err) {}
  return [];
}

utils.empty = function(dir, cb) {
  fs.readdir(dir, function(err, files) {
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
