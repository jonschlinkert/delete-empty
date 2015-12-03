'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');
var glob = require('matched');

/**
 * ```js
 * copyFixtures('fixtures', 'temp', function(err) {
 *   if (err) return console.log(err);
 *   console.log('done!');
 * });
 * ``` 
 * @param {String} cwd
 * @param {String} dest
 * @param {Function} cb
 */

function copyFixtures(cwd, dest, cb) {
  var opts = {cwd: cwd, dot: true, ignore: ['**/.gitkeep']};
  glob('**/*', opts, function(err, files) {
    if (err) {
      err.code = 'glob';
      return cb(err);
    }

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    async.each(files, function(filename, next) {
      var destPath = path.join(dest, filename);
      if (fs.existsSync(destPath)) {
        return next();
      }

      var fp = path.join(cwd, filename);

      if (fs.statSync(fp).isDirectory()) {
        return fs.mkdir(destPath, next);
      }

      fs.readFile(fp, 'utf8', function(err, str) {
        if (err) {
          err.code = 'read';
          return next(err);
        }

        fs.writeFile(destPath, str, function(err) {
          if (err) {
            err.code = 'write';
            return next(err);
          }
          next();
        });
      });
    }, cb);
  });
}

/**
 * Expose `copyFixtures`
 */

module.exports = copyFixtures;