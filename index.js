/*!
 * delete-empty <https://github.com/jonschlinkert/delete-empty>
 * Copyright (c) 2015-present, Jon Schlinkert
 * Released under the MIT License.
 */

'use strict';

const kDirname = Symbol('dirname');
const kIgnored = Symbol('ignored');

const fs = require('fs');
const path = require('path');
const util = require('util');
const rimraf = require('rimraf');
const startsWith = require('path-starts-with');
const systemPathRegex = require('./lib/system-path-regex');

const GARBAGE_REGEX = /(?:Thumbs\.db|\.DS_Store)$/i;
const isGarbage = name => GARBAGE_REGEX.test(name);
const normalize = filepath => path.normalize(filepath.split(/[\\/]/).join(path.sep));

const isIgnored = (dirname, options = {}) => {
  const dir = normalize(dirname);
  const parent = path.dirname(dir);

  if (parent === dir) {
    return true;
  }

  if (typeof options.ignore === 'function') {
    return options.ignore(dir);
  }

  if (options.ignore === false) {
    return false;
  }

  const cache = deleteEmpty.cache;
  const key = options.ignore ? [].concat(options.ignore).flat().join(',') : kIgnored;
  const regex = cache[key] || (cache[key] = systemPathRegex(parent, options.ignore, options));
  return regex.test(dir);
};

const deleteEmpty = async (dirname, options = {}, cb) => {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof cb === 'function') {
    deleteEmpty(dirname, options).then(state => cb(null, state)).catch(cb);
    return;
  }

  if (!path.isAbsolute(dirname)) {
    dirname = path.resolve(dirname);
  }

  const opts = { ...options };
  if (!opts[kDirname]) opts[kDirname] = dirname;

  const { isJunk = isGarbage } = options;
  const del = options.dryRun ? async () => undefined : util.promisify(rimraf);
  const state = { deleted: [], children: 0 };
  const queue = [];

  const push = promise => {
    const p = promise.then(file => {
      queue.splice(queue.indexOf(p), 1);
    });

    queue.push(p);
  };

  return new Promise((resolve, reject) => {
    fs.readdir(dirname, { withFileTypes: true }, async (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      if (isIgnored(dirname, options)) {
        resolve(state);
        return;
      }

      for (const file of files) {
        file.path = path.resolve(dirname, file.name);

        if (isIgnored(file.path)) {
          continue;
        }

        if (isJunk(file.name)) {
          if (options.dryRun !== true) push(del(file.path, { ...options, glob: false }));
          continue;
        }

        if (file.isFile() || file.isSymbolicLink()) {
          state.children++;
          continue;
        }

        if (file.isDirectory()) {
          state.children++;

          const promise = deleteEmpty(file.path, opts).then(s => {
            state.deleted.push(...s.deleted);

            if (s.children === 0) {
              state.children--;
            }

            return file;
          });

          push(promise);
        }
      }

      await Promise.all(queue);

      const isRoot = () => normalize(opts[kDirname]) === normalize(dirname);
      const isInsideRoot = () => startsWith(dirname, opts[kDirname]) && dirname !== opts[kDirname];

      if (state.children === 0) {
        if (((isRoot() && options.force === true || options.deleteRoot === true) || isInsideRoot())) {
          const promise = del(dirname, { ...options, glob: false })
            .then(() => {
              state.deleted.push(dirname);
            });

          push(promise);
        }
      }

      Promise.all(queue).then(() => resolve(state)).catch(reject);
    });
  });
};

deleteEmpty.sync = (dirname, options = {}) => {
  if (!path.isAbsolute(dirname)) {
    dirname = path.resolve(dirname);
  }

  const opts = { ...options };
  if (!opts[kDirname]) opts[kDirname] = dirname;

  const del = options.dryRun ? () => {} : rimraf.sync;
  const files = fs.readdirSync(dirname, { withFileTypes: true });
  const state = { deleted: [], children: 0 };
  const { isJunk = isGarbage } = options;

  if (isIgnored(dirname, options)) {
    return state;
  }

  for (const file of files) {
    file.path = path.resolve(dirname, file.name);

    if (isIgnored(file.path)) {
      continue;
    }

    if (isJunk(file.name)) {
      if (options.dryRun !== true) del(file.path, { ...options, glob: false });
      continue;
    }

    if (file.isFile() || file.isSymbolicLink()) {
      state.children++;
      continue;
    }

    if (file.isDirectory()) {
      state.children++;

      const s = deleteEmpty.sync(file.path, opts);
      state.deleted.push(...s.deleted);

      if (s.children === 0) {
        state.children--;
      }
    }
  }

  const isRoot = () => opts[kDirname] === dirname;
  const isInsideRoot = () => startsWith(dirname, opts[kDirname]) && dirname !== opts[kDirname];

  if (state.children === 0) {
    if ((isRoot() && (options.force === true || options.deleteRoot === true)) || isInsideRoot()) {
      del(dirname, { ...options, glob: false });
      state.deleted.push(dirname);
    }
  }

  return state;
};

deleteEmpty.cache = {};
module.exports = deleteEmpty;
