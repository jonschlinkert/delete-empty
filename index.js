/*!
 * delete-empty <https://github.com/jonschlinkert/delete-empty>
 * Copyright (c) Jon Schlinkert (jonschlinkert.dev)
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
const { is: isJunk } = require('junk');
const systemPathRegex = require('./lib/system-path-regex');

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

const deleteEmpty = async (dir, options = {}, cb) => {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof cb === 'function') {
    deleteEmpty(dir, options).then(state => cb(null, state)).catch(cb);
    return;
  }

  if (!path.isAbsolute(dir)) {
    dir = path.resolve(dir);
  }

  const opts = { [kDirname]: dir, ...options };
  const isGarbage = options.isJunk || isJunk;
  const del = options.dryRun ? async () => undefined : util.promisify(rimraf);
  const state = { deleted: [], children: 0 };
  const pending = [];

  const isRoot = () => normalize(opts[kDirname]) === normalize(dir);
  const isInsideRoot = () => !isRoot() && startsWith(dir, opts[kDirname]) && dir !== opts[kDirname];

  if (isIgnored(dir, options)) {
    return state;
  }

  if (fs.existsSync(path.join(dir, '.gitkeep'))) {
    return state;
  }

  return new Promise((resolve, reject) => {
    fs.readdir(dir, { withFileTypes: true }, async (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      for (const file of files) {
        file.path = path.resolve(dir, file.name);

        if (isIgnored(file.path)) {
          continue;
        }

        if (isGarbage(file.name)) {
          if (options.dryRun !== true) pending.push(del(file.path, { ...options, glob: false }));
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
            state.children += s.children === 0 ? -1 : s.children;
            return file;
          });

          pending.push(promise);
        }
      }

      await Promise.all(pending);

      if (state.children === 0) {
        if (((isRoot() && options.force === true || options.deleteRoot === true) || isInsideRoot())) {
          const promise = del(dir, { ...options, glob: false }).then(() => {
            state.deleted.push(dir);
          });

          pending.push(promise);
        }
      }

      Promise.all(pending).then(() => resolve(state)).catch(reject);
    });
  });
};

deleteEmpty.sync = (dir, options = {}) => {
  if (!path.isAbsolute(dir)) {
    dir = path.resolve(dir);
  }

  const opts = { ...options };
  if (!opts[kDirname]) opts[kDirname] = dir;

  const delSync = options.dryRun ? () => {} : rimraf.sync;
  const state = { deleted: [], children: 0 };
  const isGarbage = options.isJunk || isJunk;

  const isRoot = () => opts[kDirname] === dir;
  const isInsideRoot = () => !isRoot() && startsWith(dir, opts[kDirname]) && dir !== opts[kDirname];

  if (isIgnored(dir, options)) {
    return state;
  }

  if (fs.existsSync(path.join(dir, '.gitkeep'))) {
    return state;
  }

  for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
    file.path = path.resolve(dir, file.name);

    if (isIgnored(file.path)) {
      continue;
    }

    if (isGarbage(file.name)) {
      if (options.dryRun !== true) delSync(file.path, { ...options, glob: false });
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
      state.children += s.children === 0 ? -1 : s.children;
    }
  }

  if (state.children === 0) {
    if ((isRoot() && (options.force === true || options.deleteRoot === true)) || isInsideRoot()) {
      delSync(dir, { ...options, glob: false });
      state.deleted.push(dir);
    }
  }

  return state;
};

deleteEmpty.cache = {};
module.exports = deleteEmpty;
