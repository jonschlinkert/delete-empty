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
var extend = require('extend-shallow');
var series = require('async-each-series');
var rimraf = require('rimraf');
var ok = require('log-ok');

function deleteEmpty(cwd, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (typeof callback !== 'function') {
    throw new TypeError('expected callback to be a function');
  }

  var dirname = path.resolve(cwd);
  var opts = extend({}, options);
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

    if(opts.dryRun && isIgnored(acc, relative(dir))) {
      cb();
      return;
    }

    fs.readdir(dir, function(err, files) {
      if (err) {
        cb(err);
        return;
      }

      var ignoreProcessed = opts.dryRun ? isIgnored.bind(null, acc) : null;
      if (isEmpty(files, opts.filter, ignoreProcessed, dir)) {
        // display relative path for readability
        var rel = relative(dir);

        if (opts.dryRun) {
          acc.push(rel);
          remove(path.dirname(dir), cb);
        } else {
          rimraf(dir, function(err) {
            if (err) {
              cb(err);
              return;
            }

            if (opts.verbose !== false) {
              ok('deleted:', rel);
            }

            acc.push(rel);
            remove(path.dirname(dir), cb);
          });
        }
      } else {
        series(files, function(file, next) {
          remove(path.resolve(dir, file), next);
        }, cb);
      }
    });
  }

  remove(dirname, function(err) {
    callback(err, acc);
  });
}

deleteEmpty.sync = function(cwd, options) {
  var dirname = path.resolve(cwd);
  var opts = extend({}, options);
  var acc = [];

  function remove(filepath) {
    var dir = path.resolve(filepath);

    if (dir.indexOf(dirname) !== 0) {
      return;
    }

    if(opts.dryRun && isIgnored(acc, relative(dir))) {
      return;
    }

    if (isDirectory(dir)) {
      var files = fs.readdirSync(dir);
      var ignoreProcessed = opts.dryRun ? isIgnored.bind(null, acc) : null;
      var rel = relative(dir);

      if (isEmpty(files, opts.filter, ignoreProcessed, dir)) {
        if (opts.dryRun) {
          acc.push(rel);
          remove(path.dirname(dir));
          return;
        }

        rimraf.sync(dir);

        if (opts.verbose !== false) {
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

/**
 * Returns true if the file is a garbage file that can be deleted
 */

function isGarbageFile(filename) {
  return /(?:Thumbs\.db|\.DS_Store)$/i.test(filename);
}


/**
 * Returns true if the file is ignored (for the dry run)
 */

function isIgnored(ignoredList, filename) {
  for (var i in ignoredList) {
    if (ignoredList[i] === filename) {
      return true;
    }
  }
  return false;
}

/**
 * Return true if the given `files` array has zero length or only
 * includes unwanted files.
 */

function isEmpty(files, filterFn, inIgnoreListFn, dir) {
  var filter = filterFn || isGarbageFile;
  for (var i = 0; i < files.length; ++i) {
    if (!filter(files[i])) {
      // no ignoring function, so it's not empty
      if(!inIgnoreListFn) {
        return false;
      }

      // if file is not in ignore list, then it's not empty too
      if (!inIgnoreListFn(relative(path.join(dir, files[i])))) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Expose deleteEmpty
 */

module.exports = deleteEmpty;
