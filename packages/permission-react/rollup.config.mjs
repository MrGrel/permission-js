import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import dts from 'rollup-plugin-dts'
import typescript from '@rollup/plugin-typescript'

export default [
  {
    input: 'src/index.tsx',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
      },
      {
        file: 'dist/index.es.mjs',
        format: 'esm',
      },
    ],
    plugins: [
      resolve({ extensions: ['.ts', '.js', '.jsx', '.tsx'] }),
      typescript({ tsconfig: './tsconfig.build.json' }),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.ts', '.js', '.jsx', '.tsx'],
        presets: ['@babel/preset-react'],
      }),
    ],
  },
  {
    input: 'src/index.tsx',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
]
