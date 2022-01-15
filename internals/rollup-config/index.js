const typescript = require('@rollup/plugin-typescript');
const externals = require('rollup-plugin-node-externals');

exports.createRollupConfig = () => {
  return {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
    },
    plugins: [
      typescript({
        paths: {},
      }),
      externals(),
    ],
    external: [/node_modules/],
  };
};
