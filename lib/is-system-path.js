'use strict';

const path = require('path');
const systemPathRegex = require('./system-path-regex');

module.exports = (dirname, options = {}) => {
  const regex = systemPathRegex(path.dirname(dirname), options.systemPaths);
  return regex.test(dirname);
};
