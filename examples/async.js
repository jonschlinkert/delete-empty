'use strict';

const path = require('path');
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const copy = require('../test/support/copy');
const deleteEmpty = require('..');

const temp = path.join(__dirname, 'temp');

copy('test/fixtures', temp)
  .then(() => deleteEmpty(temp))
  .then(deleted => {
    console.log('deleted', deleted);
    return rimraf(temp, { glob: false });
  })
  .catch(err => {
    console.log(err);
  });
