/*!
 * delete-empty <https://github.com/jonschlinkert/delete-empty>
 *
 * Copyright (c) 2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var relative = require('relative');
var series = require('async-each-series');
var rimraf = require('rimraf');
var ok = require('log-ok');

function deleteEmpty(cwd, options, done) {
  if (typeof options === 'function') {
    done = options;
    options = {};
  }

  if (typeof done !== 'function') {
    throw new TypeError('expected callback to be a function');
  }

  var dirname = path.resolve(cwd);
  var opts = Object.assign({filter: keep}, options);
  var acc = [];

  function remove(filepath, cb) {
    var dir = path.resolve(filepath);

    if (dir.indexOf(dirname) !== 0) {
      cb();
      return;
    }

    if (!isDirectory(dir)) {
      cb();
      return;
    }

    fs.readdir(dir, function(err, files) {
      if (err) {
        cb(err);
        return;
      }

      if (isEmpty(files, opts.filter)) {
        rimraf(dir, function(err) {
          if (err) {
            cb(err);
            return;
          }

          // display relative path for readability
          var rel = relative(dir);
          if (opts.silent !== true) {
            ok('deleted:', rel);
          }

          acc.push(rel);
          remove(path.dirname(dir), cb);
        });

      } else {
        series(files, function(file, next) {
          remove(path.resolve(dir, file), next);
        }, cb);
      }
    });
  }

  remove(dirname, function(err) {
    done(err, acc);
  });
}

deleteEmpty.sync = function(cwd, options) {
  var dirname = path.resolve(cwd);
  var opts = Object.assign({filter: keep}, options);
  var acc = [];

  function remove(filepath) {
    var dir = path.resolve(filepath);
    if (dir.indexOf(dirname) !== 0) return;

    if (isDirectory(dir)) {
      var files = fs.readdirSync(dir);

      if (isEmpty(files, opts.filter)) {
        rimraf.sync(dir);

        var rel = relative(dir);
        if (opts.silent !== true) {
          ok('deleted:', rel);
        }

        acc.push(rel);
        remove(path.dirname(dir));

      } else {
        for (var i = 0; i < files.length; i++) {
          remove(path.resolve(dir, files[i]));
        }
      }
    }
  }

  remove(dirname);
  return acc;
};

function isDirectory(filepath) {
  var stat = tryStat(filepath);
  if (stat) {
    return stat.isDirectory();
  }
}

function tryStat(filepath) {
  try {
    return fs.statSync(filepath);
  } catch (err) {}
}

function isEmpty(files, fn) {
  try {
    return files.filter(fn).length === 0;
  } catch (err) {
    if (err & err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

function keep(filename) {
  return !/(?:Thumbs\.db|\.DS_Store)$/i.test(filename);
}

/**
 * Expose deleteEmpty
 */

module.exports = deleteEmpty;
