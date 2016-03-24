/*!
 * delete-empty <https://github.com/jonschlinkert/delete-empty>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var utils = require('./utils');

function deleteEmpty(cwd, options, cb) {
  if(cb === undefined) {
    cb = options;
    options = {};
  }

  if (utils.emptySync(cwd)) {
    utils.del(cwd, options, function(err) {
      if (err) return cb(err);
      return cb(null, [cwd]);
    });
    return;
  }

  utils.glob('**/', {cwd: cwd}, function(err, files) {
    if (err) {
      err.code = 'glob';
      return cb(err);
    }
    utils.async.reduce(files, [], function(acc, filename, next) {
      var dir = path.join(cwd, filename);

      utils.empty(dir, function(err, isEmpty) {
        if (err) return next(err);
        if (!isEmpty) {
          return next(null, acc);
        }

        utils.del(dir, options, function(err) {
          if (err) return next(err);

          acc.push(dir);
          next(null, acc);
        });
      });
    }, cb);
  });
}

deleteEmpty.sync = function(cwd, options) {
  if (utils.emptySync(cwd)) {
    utils.del.sync(cwd, options);
    return [cwd];
  }

  var dirs = utils.glob.sync('**/', {cwd: cwd});
  var len = dirs.length;
  var res = [];

  while (len--) {
    var dir = path.join(cwd, dirs[len]);
    if (utils.emptySync(dir)) {
      utils.del.sync(dir, options);
      res.push(dir);
    }
  }
  return res;
};

/**
 * Expose deleteEmpty
 */

module.exports = deleteEmpty;
