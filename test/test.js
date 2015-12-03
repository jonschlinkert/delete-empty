'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var copy = require('./support/copy');
var del = require('delete');
var deleteEmpty = require('..');

describe('deleteEmpty', function() {
  beforeEach(function(cb) {
    copy('test/fixtures', 'test/temp', cb);
  });

  afterEach(function(cb) {
    del('test/temp', cb);
  });

  describe('async', function(cb) {
    it('should delete the given cwd if empty', function(cb) {
      deleteEmpty('test/temp/b', function(err, deleted) {
        if (err) return cb(err);
        fs.exists('test/temp/b', function(exists) {
          assert(!exists);
          cb();
        });
      });
    });

    it('should delete nested directories', function(cb) {
      deleteEmpty('test/temp', function(err, deleted) {
        if (err) return cb(err);
        assert(!fs.existsSync('test/temp/a/aa/aaa'));
        assert(!fs.existsSync('test/temp/b'));
        assert(!fs.existsSync('test/temp/c'));
        cb();
      });
    });

    it('should return the array of deleted directories', function(cb) {
      deleteEmpty('test/temp', function(err, deleted) {
        if (err) return cb(err);
        assert.deepEqual(deleted, ['test/temp/a/aa/aaa/', 'test/temp/b/', 'test/temp/c/']);
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
      assert(!fs.existsSync('test/temp/a/aa/aaa'));
      assert(!fs.existsSync('test/temp/b'));
      assert(!fs.existsSync('test/temp/c'));
      cb();
    });

    it('should return the array of deleted directories', function(cb) {
      var deleted = deleteEmpty.sync('test/temp');
      assert.deepEqual(deleted.sort(), ['test/temp/a/aa/aaa/', 'test/temp/b/', 'test/temp/c/'].sort());
      cb();
    });
  });
});