// @ts-check
import path from 'path';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import ts from 'rollup-plugin-typescript2';
import consola from 'consola';

const pkg = require(path.resolve(__dirname, `../package.json`));

consola.info(`Building ${pkg.name}`);

const name = pkg.name;

let hasTSChecked = false;

const outputConfigs = {
  mjs: {
    file: (pkg.buildDir || 'dist/') + pkg.module,
    format: `es`,
  },
  cjs: {
    file: (pkg.buildDir || 'dist/') + pkg.module.replace('mjs', 'cjs'),
    format: `cjs`,
  },
  browser: {
    file: 'dist/index.esm-browser.js',
    format: `es`,
  },
};

const packageBuilds = Object.keys(outputConfigs);

const packageConfigs = packageBuilds.map((format) =>
  createConfig(format, outputConfigs[format])
);

packageBuilds.forEach((buildName) => {
  if (buildName === 'cjs') {
    packageConfigs.push(createProductionConfig(buildName));
  } else if (buildName === 'global') {
    packageConfigs.push(createMinifiedConfig(buildName));
  }
});

export default packageConfigs;

function createConfig(buildName, output, plugins = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${buildName}"`));
    process.exit(1);
  }

  output.sourcemap = !!process.env.SOURCE_MAP;
  output.externalLiveBindings = false;
  output.globals = {
    vue: 'Vue',
  };

  const isProductionBuild = true;
  const isNodeBuild = buildName === 'cjs';
  const isBundlerESMBuild = buildName === 'browser' || buildName === 'mjs';

  const external = ['vue'];

  const nodePlugins = [resolve(), commonjs()];

  const shouldEmitDeclarations = !hasTSChecked;

  const tsPlugin = ts({
    check: !hasTSChecked,
    tsconfig: path.resolve(__dirname, '../tsconfig.json'),
    cacheRoot: path.resolve(__dirname, '../node_modules/.rts2_cache'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: shouldEmitDeclarations,
        declarationMap: shouldEmitDeclarations,
      },
      exclude: ['packages/*/__tests__', 'packages/*/test-dts'],
    },
  });

  hasTSChecked = true;

  return {
    input: path.resolve(__dirname, '../src/index.ts'),
    external,
    plugins: [
      tsPlugin,
      createReplacePlugin(isProductionBuild, isBundlerESMBuild, isNodeBuild),
      ...nodePlugins,
      ...plugins,
    ],
    output,
  };
}

function createReplacePlugin(
  isProduction,
  isBundlerESMBuild,
  isBrowserBuild,
  isGlobalBuild,
  isNodeBuild
) {
  const replacements = {
    __COMMIT__: `"${process.env.COMMIT}"`,
    __VERSION__: `"${pkg.version}"`,
    __DEV__:
      isBundlerESMBuild || (isNodeBuild && !isProduction)
        ? `(process.env.NODE_ENV !== 'production')`
        : JSON.stringify(!isProduction),
    __TEST__:
      isBundlerESMBuild || isNodeBuild
        ? `(process.env.NODE_ENV === 'test')`
        : 'false',
    __BROWSER__: JSON.stringify(isBrowserBuild),
    __BUNDLER__: JSON.stringify(isBundlerESMBuild),
    __GLOBAL__: JSON.stringify(isGlobalBuild),
    __NODE_JS__: JSON.stringify(isNodeBuild),
  };
  Object.keys(replacements).forEach((key) => {
    if (key in process.env) {
      replacements[key] = process.env[key];
    }
  });
  return replace({
    preventAssignment: true,
    values: replacements,
  });
}

function createProductionConfig(format) {
  const extension = format === 'cjs' ? 'cjs' : 'js';
  const descriptor = format === 'cjs' ? '' : `.${format}`;
  return createConfig(format, {
    file: `dist/${name}${descriptor}.prod.${extension}`,
    format: outputConfigs[format].format,
  });
}

function createMinifiedConfig(format) {
  const { terser } = require('rollup-plugin-terser');
  return createConfig(
    format,
    {
      file: `dist/${name}.${format === 'global' ? 'iife' : format}.prod.js`,
      format: outputConfigs[format].format,
    },
    [
      terser({
        module: /^esm/.test(format),
        compress: {
          ecma: 2015,
          pure_getters: true,
        },
      }),
    ]
  );
}
