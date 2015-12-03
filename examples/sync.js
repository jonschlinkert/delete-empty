'use strict';

var copy = require('../test/support/copy');
var deleteEmpty = require('..');

copy('test/fixtures', 'test/temp', function(err) {
  if (err) return console.log(err);
  console.log('copied fixtures');

  var deleted = deleteEmpty.sync('test/temp');
  console.log('deleted', deleted);
});
