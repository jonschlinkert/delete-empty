'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var rimraf = require('rimraf');
var copy = require('./support/copy');
var deleteEmpty = require('..');

var tests = path.join.bind(path, __dirname);
var fixtures = path.join.bind(path, tests('fixtures'));

function getResultArray() {
  return [
    path.normalize('test/temp/a/aa/aaa/aaaa'),
    path.normalize('test/temp/a/aa/aaa'),
    path.normalize('test/temp/b'),
    path.normalize('test/temp/c')
  ].sort();
}

describe('deleteEmpty', function() {
  beforeEach(function(cb) {
    copy('test/fixtures', 'test/temp', cb);
  });

  afterEach(function(cb) {
    rimraf('test/temp', cb);
  });

  describe('async', function(cb) {
    it('should delete the given cwd if empty', function(cb) {

      deleteEmpty('test/temp/b', function(err, deleted) {
        if (err) {
          cb(err);
          return;
        }
        fs.exists('test/temp/b', function(exists) {
          assert(!exists);
          cb();
        });
      });
    });

    it('should delete nested directories', function(cb) {
      deleteEmpty('test/temp', function(err, deleted) {
        if (err) {
          cb(err);
          return;
        }
        assert(!fs.existsSync('test/temp/a/aa/aaa'));
        assert(!fs.existsSync('test/temp/b'));
        assert(!fs.existsSync('test/temp/c'));
        cb();
      });
    });

    it('should return the array of deleted directories', function(cb) {
      deleteEmpty('test/temp', function(err, deleted) {
        if (err) {
          cb(err);
          return;
        }

        assert.deepEqual(deleted.sort(), getResultArray());
        cb();
      });
    });
  });

  describe('async dry run', function(cb) {
    it('should not delete the given cwd if empty', function(cb) {

      deleteEmpty('test/temp/b', {dryRun: true}, function(err, deleted) {
        if (err) {
          cb(err);
          return;
        }
        fs.exists('test/temp/b', function(exists) {
          assert(exists);
          cb();
        });
      });
    });

    it('should not delete nested directories', function(cb) {
      deleteEmpty('test/temp',  {dryRun: true}, function(err, deleted) {
        if (err) {
          cb(err);
          return;
        }
        assert(fs.existsSync('test/temp/a/aa/aaa'));
        assert(fs.existsSync('test/temp/b'));
        assert(fs.existsSync('test/temp/c'));
        cb();
      });
    });

    it('should return the array of empty directories', function(cb) {
      deleteEmpty('test/temp',  {dryRun: true}, function(err, deleted) {
        if (err) {
          cb(err);
          return;
        }

        assert.deepEqual(deleted.sort(), getResultArray());
        cb();
      });
    });
  });

  describe('sync', function(cb) {
    it('should delete the given cwd if empty', function(cb) {
      deleteEmpty.sync('test/temp/b');
      assert(!fs.existsSync('test/temp/b'));
      cb();
    });

    it('should delete nested directories', function(cb) {
      deleteEmpty.sync('test/temp');
      assert(!fs.existsSync('test/temp/a/aa/aaa/aaaa'));
      assert(!fs.existsSync('test/temp/a/aa/aaa'));
      assert(!fs.existsSync('test/temp/b'));
      assert(!fs.existsSync('test/temp/c'));
      cb();
    });

    it('should return the array of deleted directories', function(cb) {
      var deleted = deleteEmpty.sync('test/temp');
      assert.deepEqual(deleted.sort(), getResultArray());
      cb();
    });
  });

  describe('sync dry run', function(cb) {
    it('should not delete the given cwd if empty', function(cb) {
      deleteEmpty.sync('test/temp/b', {dryRun: true});
      assert(fs.existsSync('test/temp/b'));
      cb();
    });

    it('should not delete nested directories', function(cb) {
      deleteEmpty.sync('test/temp', {dryRun: true});
      assert(fs.existsSync('test/temp/a/aa/aaa/aaaa'));
      assert(fs.existsSync('test/temp/a/aa/aaa'));
      assert(fs.existsSync('test/temp/b'));
      assert(fs.existsSync('test/temp/c'));
      cb();
    });

    it('should return the array of empty directories', function(cb) {
      var deleted = deleteEmpty.sync('test/temp', {dryRun: true});
      assert.deepEqual(deleted.sort(), getResultArray());
      cb();
    });
  });
});
