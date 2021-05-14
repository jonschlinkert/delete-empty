'use strict';

const path = require('path');
const rimraf = require('rimraf');
const copy = require('../test/support/copy');
const deleteEmpty = require('..');

const temp = path.join(__dirname, 'temp');

copy('test/fixtures', temp)
  .then(() => {
    const deleted = deleteEmpty.sync(temp);
    console.log('deleted', deleted);
    rimraf.sync(temp, { glob: false });
  })
  .catch(err => {
    console.log(err);
  });
