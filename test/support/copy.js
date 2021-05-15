import fs from 'fs';
import path from 'path';
import readdir from '@folder/readdir';
import write from 'write';

const copy = async (cwd, destDir) => {
  const files = [];

  const createDest = file => path.join(destDir, path.relative(cwd, file.path));
  const onDirectory = file => {
    file.dest = createDest(file);
    fs.mkdirSync(file.dest, { recursive: true });
    files.push(file);
  };

  const onFile = file => {
    if (file.name === '.DS_Store' || file.name === '.gitkeep') return;

    file.dest = createDest(file);

    if (!fs.existsSync(file.dest)) {
      files.push(file);
      write.sync(file.dest, fs.readFileSync(file.path));
    }
  };

  await readdir(cwd, { recursive: true, absolute: true, onDirectory, onFile });
  return files;
};

export default copy;
