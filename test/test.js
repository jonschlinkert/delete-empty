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
var expected = [
  tests('temp/a/aa/aaa'),
  tests('temp/a/aa/aaa/aaaa'),
  tests('temp/b'),
  tests('temp/c')
];

describe('deleteEmpty', function() {
  beforeEach(cb => copy(tests('fixtures'), tests('temp'), cb));
  afterEach(cb => rimraf(tests('temp'), cb));

  describe('promise', function(cb) {
    it('should delete the given cwd if empty', function() {
      return deleteEmpty(tests('temp/b'))
        .then(deleted => {
          assert(!fs.existsSync(tests('temp/b')))
        });
    });

    it('should delete nested directories', function() {
      return deleteEmpty(tests('temp'))
        .then(deleted => {
          assert(!fs.existsSync(tests('temp/a/aa/aaa')));
          assert(!fs.existsSync(tests('temp/b')));
          assert(!fs.existsSync(tests('temp/c')));
        });
    });

    it('should return the array of deleted directories', function() {
      return deleteEmpty(tests('temp'))
        .then(deleted => {
          assert.deepEqual(deleted.sort(), expected.sort());
        })
    });
  });

  describe('promise dry run', function() {
    it('should not delete the given cwd if empty', function() {
      return deleteEmpty(tests('temp/b'), { dryRun: true })
        .then(() => assert(fs.existsSync(tests('temp/b'))))
    });

    it('should not delete nested directories', function() {
      return deleteEmpty(tests('temp'), { dryRun: true })
        .then(() => {
          assert(fs.existsSync(tests('temp/a/aa/aaa')));
          assert(fs.existsSync(tests('temp/b')));
          assert(fs.existsSync(tests('temp/c')));
        });
    });

    it('should return the array of empty directories', function() {
      return deleteEmpty(tests('temp'), { dryRun: true })
        .then(deleted => assert.deepEqual(deleted.sort(), expected.sort()))
    });
  });

  describe('async', function() {
    it('should delete the given cwd if empty', function(cb) {
      deleteEmpty(tests('temp/b'), function(err, deleted) {
        if (err) {
          cb(err);
          return;
        }
        assert(!fs.existsSync(tests('temp/b')));
        cb();
      });
    });

    it('should delete nested directories', function(cb) {
      deleteEmpty(tests('temp'), function(err, deleted) {
        if (err) {
          cb(err);
          return;
        }
        assert(!fs.existsSync(tests('temp/a/aa/aaa')));
        assert(!fs.existsSync(tests('temp/b')));
        assert(!fs.existsSync(tests('temp/c')));
        cb();
      });
    });

    it('should return the array of deleted directories', function(cb) {
      deleteEmpty(tests('temp'), function(err, deleted) {
        if (err) {
          cb(err);
          return;
        }
        assert.deepEqual(deleted.sort(), expected.sort());
        cb();
      });
    });
  });

  describe('async dry run', function() {
    it('should not delete the given cwd if empty', function(cb) {
      deleteEmpty(tests('temp/b'), { dryRun: true }, function(err, deleted) {
        if (err) {
          cb(err);
          return;
        }
        assert(fs.existsSync(tests('temp/b')));
        cb();
      });
    });

    it('should not delete nested directories', function(cb) {
      deleteEmpty(tests('temp'),  { dryRun: true }, function(err, deleted) {
        if (err) {
          cb(err);
          return;
        }
        assert(fs.existsSync(tests('temp/a/aa/aaa')));
        assert(fs.existsSync(tests('temp/b')));
        assert(fs.existsSync(tests('temp/c')));
        cb();
      });
    });

    it('should return the array of empty directories', function(cb) {
      deleteEmpty(tests('temp'), { dryRun: true }, function(err, deleted) {
        if (err) {
          cb(err);
          return;
        }

        assert.deepEqual(deleted.sort(), expected.sort());
        cb();
      });
    });
  });

  describe('sync', function() {
    it('should delete the given cwd if empty', function(cb) {
      deleteEmpty.sync(tests('temp/b'));
      assert(!fs.existsSync(tests('temp/b')));
      cb();
    });

    it('should delete nested directories', function(cb) {
      deleteEmpty.sync(tests('temp'));
      assert(!fs.existsSync(tests('temp/a/aa/aaa/aaaa')));
      assert(!fs.existsSync(tests('temp/a/aa/aaa')));
      assert(!fs.existsSync(tests('temp/b')));
      assert(!fs.existsSync(tests('temp/c')));
      cb();
    });

    it('should return the array of deleted directories', function(cb) {
      var deleted = deleteEmpty.sync(tests('temp'));
      assert.deepEqual(deleted.sort(), expected.sort());
      cb();
    });
  });

  describe('sync dry run', function() {
    it('should not delete the given cwd if empty', function() {
      deleteEmpty.sync(tests('temp/b'), { dryRun: true });
      assert(fs.existsSync(tests('temp/b')));
    });

    it('should not delete nested directories', function() {
      deleteEmpty.sync(tests('temp'), { dryRun: true });
      assert(fs.existsSync(tests('temp/a/aa/aaa/aaaa')));
      assert(fs.existsSync(tests('temp/a/aa/aaa')));
      assert(fs.existsSync(tests('temp/b')));
      assert(fs.existsSync(tests('temp/c')));
    });

    it('should return the array of empty directories', function(cb) {
      var deleted = deleteEmpty.sync(tests('temp'), { dryRun: true });
      assert.deepEqual(deleted.sort(), expected.sort());
      cb();
    });
  });
});
