'use strict';

const fs = require('fs');
const path = require('path');
const readdir = require('@folder/readdir');
const write = require('write');

module.exports = async (cwd, destDir) => {
  const filter = file => file.name !== '.gitkeep';
  const files = await readdir(cwd, { recursive: true, objects: true, absolute: true, filter });

  for (let file of files) {
    let destPath = path.resolve(destDir, path.relative(cwd, file.path));
    if (fs.existsSync(destPath)) continue;

    if (file.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
    } else {
      write.sync(destPath, fs.readFileSync(file.path));
    }
  }

  return files;
};
