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

        assert.deepEqual(deleted.sort(), [
          'test/temp/a/aa/aaa/aaaa',
          'test/temp/a/aa/aaa',
          'test/temp/b',
          'test/temp/c'
        ].sort());
        cb();
      });
    });
  });

  describe('sync', function(cb) {
    it('should delete the given cwd if empty', function(cb) {
      deleteEmpty.sync('test/temp');
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
      assert.deepEqual(deleted.sort(), [
        'test/temp/a/aa/aaa/aaaa',
        'test/temp/a/aa/aaa',
        'test/temp/b',
        'test/temp/c'
      ].sort());
      cb();
    });
  });
});
