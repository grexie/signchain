import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import define from 'rollup-plugin-define';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import { config as dotenv } from 'dotenv-flow';
dotenv({ path: '../..', default_node_env: 'development' });

const config = (externals = {}) => {
  return {
    external: id => {
      if (externals[id]) {
        return true;
      }

      return false;
    },
    output: {
      dir: './lib',
      entryFileNames: '[name].js',
      format: 'es',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      define({
        replacements: {
          'process.env.API_URL': JSON.stringify(
            process.env.API_URL
          ),
        },
      }),
      json(),
      nodeResolve({ externals }),
      commonjs(),
      typescript({ declaration: false }),
    ],
  };
};

export default [
  {
    input: {
      index: './src/index.ts',
    },
    ...config({ react: true, 'react/jsx-runtime': true, viem: true, abitype: true }),
    plugins: [...config().plugins],
  },
  {
    input: './src/index.ts',
    output: [{ file: './lib/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: {
      react: './src/react/index.ts',
    },
    ...config({ react: true, 'react/jsx-runtime': true, viem: true, abitype: true }),
    plugins: [...config().plugins],
  },
  {
    input: './src/react/index.ts',
    output: [{ file: './lib/react.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
