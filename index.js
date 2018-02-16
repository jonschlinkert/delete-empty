/*!
 * delete-empty <https://github.com/jonschlinkert/delete-empty>
 *
 * Copyright (c) 2015, 2017-2018, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

const fs = require('fs');
const util = require('util');
const path = require('path');
const ok = require('log-ok');
const relative = require('relative');
const rimraf = require('rimraf');
const readdir = util.promisify(fs.readdir);
const del = util.promisify(rimraf);

function deleteEmpty(cwd, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const promise = deleteEmpty.promise(cwd, options);
  if (typeof callback === 'function') {
    promise.then(acc => callback(null, acc)).catch(callback);
    return;
  }
  return promise;
}

deleteEmpty.promise = function(cwd, options) {
  const opts = Object.assign({}, options);
  const dirname = path.resolve(cwd);
  const acc = [];

  if (typeof cwd !== 'string') {
    return Promise.reject(new TypeError('expected the first argument to be a string'));
  }

  async function remove(filepath) {
    const dir = path.resolve(filepath);

    if (dir.indexOf(dirname) !== 0 || acc.indexOf(dir) !== -1 || !isDirectory(dir)) {
      return Promise.resolve(acc);
    }

    return await readdir(dir)
      .then(async files => {
        if (isEmpty(files, dir, acc, opts)) {
          acc.push(dir);

          if (opts.dryRun === true) {
            return remove(path.dirname(dir));
          }

          return del(dir)
            .then(() => {
              if (opts.verbose === true) {
                ok('deleted:', relative(dir));
              }
              return remove(path.dirname(dir));
            });

        } else {
          for (const file of files) {
            await remove(path.join(dir, file));
          }
          return Promise.resolve(acc);
        }
      });
  }

  return remove(dirname).then(acc);
};

deleteEmpty.sync = function(cwd, options) {
  const opts = Object.assign({}, options);
  const dirname = path.resolve(cwd);
  const acc = [];

  if (typeof cwd !== 'string') {
    throw new TypeError('expected the first argument to be a string');
  }

  function remove(filepath) {
    const dir = path.resolve(filepath);

    if (dir.indexOf(dirname) !== 0 || acc.indexOf(dir) !== -1 || !isDirectory(dir)) {
      return acc;
    }

    const files = fs.readdirSync(dir);

    if (isEmpty(files, dir, acc, opts)) {
      acc.push(dir);

      if (opts.dryRun === true) {
        return remove(path.dirname(dir));
      }

      rimraf.sync(dir);
      if (opts.verbose === true) {
        ok('deleted:', relative(dir));
      }
      return remove(path.dirname(dir));

    } else {
      for (const file of files) {
        remove(path.join(dir, file));
      }
      return acc;
    }
  }

  remove(dirname);
  return acc;
};

/**
 * Return true if the given `files` array has zero length or only
 * includes unwanted files.
 */

function isEmpty(files, dir, acc, opts) {
  var filter = opts.filter || isGarbageFile;
  for (const file of files) {
    const fp = path.join(dir, file);

    if (opts.dryRun && acc.indexOf(fp) !== -1) {
      continue;
    }
    if (filter(fp) === false) {
      return false;
    }
  }
  return true;
}

/**
 * Returns true if the given filepath exists and is a directory
 */

function isDirectory(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch (err) {
    return false;
  }
}

/**
 * Returns true if the file is a garbage file that can be deleted
 */

function isGarbageFile(filename) {
  return /(?:Thumbs\.db|\.DS_Store)$/i.test(filename);
}

/**
 * Expose deleteEmpty
 */

module.exports = deleteEmpty;
