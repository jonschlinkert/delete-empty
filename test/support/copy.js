'use strict';

var fs = require('fs');
var path = require('path');
var series = require('async-each-series');
var glob = require('matched');

/**
 * ```js
 * copy('fixtures', 'temp', cb);
 * ```
 * @param {String} cwd
 * @param {String} destDir
 * @param {Function} cb
 */

module.exports = function(cwd, destDir, cb) {
  var opts = {cwd: cwd, dot: true, ignore: ['**/.gitkeep']};

  glob('**/*', opts, function(err, files) {
    if (err) {
      err.code = 'glob';
      cb(err);
      return;
    }

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir);
    }

    series(files, function(basename, next) {
      var destPath = path.join(destDir, basename);

      if (fs.existsSync(destPath)) {
        next();
        return;
      }

      var fp = path.join(cwd, basename);

      if (fs.statSync(fp).isDirectory()) {
        fs.mkdir(destPath, next);
        return;
      }

      fs.readFile(fp, function(err, buffer) {
        if (err) {
          err.code = 'readFile';
          return next(err);
        }

        fs.writeFile(destPath, buffer, function(err) {
          if (err) {
            err.code = 'writeFile';
            return next(err);
          }

          next();
        });
      });
    }, cb);
  });
};
