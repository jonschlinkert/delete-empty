
import path from 'path';
import util from 'util';
import rimraf from 'rimraf';
import copy from '../test/support/copy.js';
import deleteEmpty from '../index.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);
const destroy = util.promisify(rimraf);
const fixtures = path.join(dirname, '../test/fixtures');
const temp = path.join(dirname, 'temp');

copy(fixtures, temp)
  .then(() => {
    const { deleted } = deleteEmpty.sync(temp);
    console.log('deleted', deleted);
    return destroy(temp, { glob: false });
  })
  .catch(err => {
    console.log(err);
  });
