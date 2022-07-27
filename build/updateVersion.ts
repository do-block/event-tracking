import fs from 'fs';
import path from 'path';

export function updateVersion() {
  const pkgPath = path.resolve(__dirname, '../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  const oldVersion: {
    version: {
      major: number;
      minor: number;
      patch: number;
    };
  } = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../version.json'), 'utf8')
  );

  oldVersion.version.patch = oldVersion.version.patch + 1;

  if (oldVersion.version.patch === 99) {
    oldVersion.version.minor = oldVersion.version.minor + 1;
    oldVersion.version.patch = 0;
    if (oldVersion.version.minor === 99) {
      oldVersion.version.major = oldVersion.version.major + 1;
      oldVersion.version.minor = 0;
      oldVersion.version.patch = 0;
    }
  }

  const newVersion =
    oldVersion.version.major +
    '.' +
    oldVersion.version.minor +
    '.' +
    oldVersion.version.patch;

  fs.writeFileSync(
    path.resolve(__dirname, '../version.json'),
    JSON.stringify(oldVersion, null, 2)
  );

  fs.writeFileSync(
    path.resolve(pkgPath),
    JSON.stringify(
      {
        ...pkg,
        version: newVersion,
      },
      null,
      2
    )
  );

  return newVersion;
}
