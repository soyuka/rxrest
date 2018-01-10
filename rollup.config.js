import ts from 'rollup-plugin-typescript'
import nodeResolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'
import cjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'

const plugins = [
  ts(),
  babel({exclude: 'node_modules/**'})
]

const prod = process.env.NODE_ENV === 'production' || ~process.argv.indexOf('--prod')
const full = prod || ~process.argv.indexOf('--full')

if (prod) {
  plugins.push(uglify())
}

if (full) {
  plugins.push(
    nodeResolve({
      main: true,
      jsnext: true,
      browser: true
    }),
    cjs({
      include: 'node_modules/**',
      ignore: ['most', 'symbol-observable']
    })
  )
}

export default {
  input: 'src/index.ts',
  output: {
    name: 'rxrest',
    sourcemap: true,
    format: 'cjs',
    file: `build/rxrest${full ? '.bundle' : ''}${prod ? '.min' : ''}.js`
  },
  plugins: plugins
}
