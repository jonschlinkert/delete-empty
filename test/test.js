import fs from 'fs';
import path from 'path';
import util from 'util';
import readdir from '@folder/readdir';
import assert from 'assert';
import _rimraf from 'rimraf';
import copy from './support/copy.js';
import dirs from './support/system-dirs.js';
import deleteEmpty from '../index.js';

const parsed = new URL(import.meta.url);
const dirname = path.dirname(parsed.pathname);

const rimraf = util.promisify(_rimraf);
const systemDirs = dirs[process.platform];

const sysFolders = { darwin: 'usr', linux: 'sbin', win32: 'System32' };
const sysFolder = sysFolders[process.platform] || sysFolders.linux;

const fixtures = path.join.bind(path, dirname, 'fixtures');
const expected = [
  fixtures('temp/a/aa/aaa'),
  fixtures('temp/a/aa/aaa/aaaa'),
  fixtures('temp/b'),
  fixtures('temp/c')
];

const addFixtures = destdir => copy(destdir, fixtures('temp'));
const addFakeSystemPaths = async () => {
  for (const dir of systemDirs) {
    await fs.promises.mkdir(fixtures('temp', sysFolder, dir), { recursive: true });
  }
};

const noNested = files => files.filter(file => !/nested/.test(file));
const filter = file => file.isDirectory();
let folders;

describe('deleteEmpty', () => {
  before(async () => await rimraf(fixtures('temp')));
  beforeEach(async () => {
    await addFixtures(fixtures('paths'));
    const nested = fixtures('temp/nested');
    folders = readdir.sync(nested, { filter, recursive: true, absolute: true });
    if (!folders.includes(nested)) folders.push(nested);
    folders.sort();
  });

  afterEach(async () => await rimraf(fixtures('temp')));

  describe('promise', cb => {
    it('should delete the given cwd if empty', () => {
      return deleteEmpty(fixtures('temp/b'), { force: true })
        .then(({ deleted }) => {
          assert(!fs.existsSync(fixtures('temp/b')));
        });
    });

    it('should ignore specified paths', () => {
      const ignore = dirname => dirname === fixtures('temp/b');

      return deleteEmpty(fixtures('temp'), { ignore })
        .then(() => {
          assert(fs.existsSync(fixtures('temp/b')));
          assert(!fs.existsSync(fixtures('temp/a/aa/aaa')));
        });
    });

    it('should delete nested directories', () => {
      return deleteEmpty(fixtures('temp'))
        .then(({ deleted }) => {
          assert(!fs.existsSync(fixtures('temp/a/aa/aaa')));
          assert(!fs.existsSync(fixtures('temp/b')));
          assert(!fs.existsSync(fixtures('temp/c')));
        });
    });

    it('should return the array of deleted directories', () => {
      return deleteEmpty(fixtures('temp'))
        .then(({ deleted }) => {
          assert.deepEqual(noNested(deleted).sort(), expected.sort());
        });
    });

    it('should ignore system paths', async () => {
      await addFakeSystemPaths();

      return deleteEmpty(fixtures('temp'))
        .then(async ({ deleted }) => {
          for (const dir of systemDirs) {
            assert(fs.existsSync(fixtures('temp', sysFolder, dir)));
          }

          await rimraf(fixtures('temp', sysFolder));
          assert.deepEqual(noNested(deleted).sort(), expected.sort());
        });
    });
  });

  describe('promise - options.dryRun', () => {
    it('should not delete the given cwd if empty when dryRun is true', () => {
      return deleteEmpty(fixtures('temp/b'), { dryRun: true })
        .then(() => assert(fs.existsSync(fixtures('temp/b'))));
    });

    it('should not delete nested directories when dryRun is true', () => {
      return deleteEmpty(fixtures('temp'), { dryRun: true })
        .then(() => {
          assert(fs.existsSync(fixtures('temp/a/aa/aaa')));
          assert(fs.existsSync(fixtures('temp/b')));
          assert(fs.existsSync(fixtures('temp/c')));
        });
    });

    it('should delete deeply nested directories', () => {
      return deleteEmpty(fixtures('temp/nested'), { deleteRoot: true })
        .then(state => {
          assert.equal(folders.length, state.deleted.length);
        });
    });

    it('should return the array of empty directories', () => {
      return deleteEmpty(fixtures('temp'))
        .then(({ deleted }) => {
          assert.deepEqual(noNested(deleted).sort(), expected.sort());
        });
    });

    it('should not delete directories when options.dryRun is true', () => {
      return deleteEmpty(fixtures('temp'), { dryRun: true })
        .then(({ deleted }) => {
          for (const folder of folders) {
            assert(fs.existsSync(folder));
          }
        });
    });
  });

  describe('sync', () => {
    it('should delete the given cwd if empty', () => {
      deleteEmpty.sync(fixtures('temp/b'), { force: true });
      assert(!fs.existsSync(fixtures('temp/b')));
    });

    it('should delete nested directories', () => {
      deleteEmpty.sync(fixtures('temp'));
      assert(!fs.existsSync(fixtures('temp/a/aa/aaa/aaaa')));
      assert(!fs.existsSync(fixtures('temp/a/aa/aaa')));
      assert(!fs.existsSync(fixtures('temp/b')));
      assert(!fs.existsSync(fixtures('temp/c')));
    });

    it('should return the array of deleted directories', () => {
      const { deleted } = deleteEmpty.sync(fixtures('temp'));
      assert.deepEqual(noNested(deleted).sort(), expected.sort());
    });
  });

  describe('sync - options.dryRun', () => {
    it('should not delete the given cwd if empty', () => {
      deleteEmpty.sync(fixtures('temp/b'), { dryRun: true, force: true });
      assert(fs.existsSync(fixtures('temp/b')));
    });

    it('should not delete nested directories', () => {
      deleteEmpty.sync(fixtures('temp'), { dryRun: true });
      assert(fs.existsSync(fixtures('temp/a/aa/aaa/aaaa')));
      assert(fs.existsSync(fixtures('temp/a/aa/aaa')));
      assert(fs.existsSync(fixtures('temp/b')));
      assert(fs.existsSync(fixtures('temp/c')));
    });

    it('should return the array of empty directories', () => {
      const { deleted } = deleteEmpty.sync(fixtures('temp'), { dryRun: true });
      assert.deepEqual(noNested(deleted).sort(), expected.sort());
    });
  });
});
