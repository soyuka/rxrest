import ts from 'rollup-plugin-typescript'
import nodeResolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'

const plugins = [
  ts(),
];

const prod = process.env.NODE_ENV === 'production' || ~process.argv.indexOf('--prod')
const full = prod || ~process.argv.indexOf('--full')

if (prod) {
  plugins.push(uglify())
}

if (full) {
  plugins.push(nodeResolve({
    jsnext: true,
    browser: true
  }))
}

export default {
  entry: 'src/index.ts',
  format: 'cjs',
  plugins: plugins,
  dest: `build/rxrest${full ? '.bundle' : ''}${prod ? '.min' : ''}.js`,
  sourceMap: true
}
