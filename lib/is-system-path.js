import path from 'path';
import systemPathRegex from './system-path-regex.js';

export default (dirname, options = {}) => {
  const regex = systemPathRegex(path.dirname(dirname), options.systemPaths);
  return regex.test(dirname);
};
