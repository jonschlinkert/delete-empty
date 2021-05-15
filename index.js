/*!
 * delete-empty <https://github.com/jonschlinkert/delete-empty>
 * Copyright (c) Jon Schlinkert (jonschlinkert.dev)
 * Released under the MIT License.
 */

import fs from 'fs';
import path from 'path';
import util from 'util';
import rimraf from 'rimraf';
import startsWith from 'path-starts-with';
import junk from 'junk';
import systemPathRegex from './lib/system-path-regex.js';

const kIgnored = Symbol('ignored');
const kDirname = Symbol('dirname');

const normalize = filepath => path.normalize(filepath.split(/[\\/]/).join(path.sep));

const isIgnored = (dirname, options = {}) => {
  const basedir = normalize(dirname);
  const parent = path.dirname(basedir);

  if (parent === basedir) {
    return true;
  }

  if (typeof options.ignore === 'function') {
    return options.ignore(basedir);
  }

  if (options.ignore === false) {
    return false;
  }

  const cache = deleteEmpty.cache;
  const key = options.ignore ? [].concat(options.ignore).flat().join(',') : kIgnored;
  const regex = cache[key] || (cache[key] = systemPathRegex(parent, options.ignore, options));
  return regex.test(basedir);
};

const deleteEmpty = async (basedir, options = {}) => {
  if (!path.isAbsolute(basedir)) {
    basedir = path.resolve(basedir);
  }

  const opts = { [kDirname]: basedir, ...options, glob: false };
  const isGarbage = options.isJunk || junk.is;
  const del = options.dryRun ? async () => undefined : util.promisify(rimraf);
  const state = { deleted: [], children: 0 };
  const pending = new Set();

  const push = promise => {
    const p = promise.then(() => pending.delete(p));
    pending.add(p);
  };

  const isRoot = () => normalize(opts[kDirname]) === normalize(basedir);
  const isInsideRoot = () => !isRoot() && startsWith(basedir, opts[kDirname]) && basedir !== opts[kDirname];

  if (isIgnored(basedir, options)) {
    return state;
  }

  if (fs.existsSync(path.join(basedir, '.gitkeep'))) {
    return state;
  }

  return new Promise((resolve, reject) => {
    fs.readdir(basedir, { withFileTypes: true }, async (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      for (const file of files) {
        file.path = path.resolve(basedir, file.name);

        if (isIgnored(file.path)) {
          continue;
        }

        if (isGarbage(file.name)) {
          if (options.dryRun !== true) push(del(file.path, opts));
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

          push(promise);
        }
      }

      await Promise.all(pending);

      if (state.children === 0) {
        if (((isRoot() && options.force === true || options.deleteRoot === true) || isInsideRoot())) {
          const promise = del(basedir, opts).then(() => {
            state.deleted.push(basedir);
          });

          push(promise);
        }
      }

      Promise.all(pending).then(() => resolve(state)).catch(reject);
    });
  });
};

export const deleteEmptySync = (basedir, options = {}) => {
  if (!path.isAbsolute(basedir)) {
    basedir = path.resolve(basedir);
  }

  const opts = { [kDirname]: basedir, ...options, glob: false };
  const delSync = options.dryRun ? () => {} : rimraf.sync;
  const state = { deleted: [], children: 0 };
  const isGarbage = options.isJunk || junk.is;

  const isRoot = () => opts[kDirname] === basedir;
  const isInsideRoot = () => !isRoot() && startsWith(basedir, opts[kDirname]) && basedir !== opts[kDirname];

  if (isIgnored(basedir, options)) {
    return state;
  }

  if (fs.existsSync(path.join(basedir, '.gitkeep'))) {
    return state;
  }

  for (const file of fs.readdirSync(basedir, { withFileTypes: true })) {
    file.path = path.resolve(basedir, file.name);

    if (isIgnored(file.path)) {
      continue;
    }

    if (isGarbage(file.name)) {
      if (options.dryRun !== true) delSync(file.path, opts);
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
      delSync(basedir, opts);
      state.deleted.push(basedir);
    }
  }

  return state;
};

deleteEmpty.cache = {};
deleteEmpty.sync = deleteEmptySync;
export default deleteEmpty;
