import typescript from '@rollup/plugin-typescript';
import externals from 'rollup-plugin-node-externals';

export default {
  input: './src/index.ts',
  output: {
    dir: 'dist',
  },
  plugins: [typescript(), externals()],
  external: [/node_modules/],
};
