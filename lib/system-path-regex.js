import path from 'path';
import picomatch from 'picomatch';
import systemPaths from './system-paths.js';

const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

export default (dir, ignore = [], options) => {
  if (isObject(ignore)) {
    options = ignore;
    ignore = null;
  }

  if (!ignore) {
    ignore = options.ignore || options.systemPaths || [];
  }

  const opts = { flags: 'i', basename: true, platform: process.platform, ...options };
  const { names = [], paths = [] } = systemPaths[opts.platform] || {};
  const globs = [...new Set([...paths].concat(ignore || []))].sort();

  if (names instanceof Set && names.size > 0) {
    for (const name of names) {
      if (!globs.includes(path.join(dir, name))) {
        globs.push(path.resolve(dir, name));
        globs.push(path.join('/', name));
      }
    }
  }

  const glob = (opts.basename ? '**' : '') + `{${globs.join(',')}}`;
  return picomatch.makeRe(glob, opts);
};
