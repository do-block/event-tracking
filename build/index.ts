import consola from 'consola';
import fs from 'fs';
import path from 'path';
// @ts-ignore
import { updateVersion } from './updateVersion';

const FILES_COPY_LOCAL = ['README.md', 'package.json'];

const DistDir = path.resolve(__dirname, '../dist');

updateVersion();

setTimeout(() => {
  FILES_COPY_LOCAL.forEach((file) => {
    fs.writeFileSync(
      path.resolve(DistDir, file),
      fs.readFileSync(path.resolve(path.resolve(__dirname, '..'), file))
    );
  });
  consola.info('Build done');
});
