const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
  entry: `${__dirname}/src/index.ts`,
  devtool: 'source-map',
  output: {
    path: `${__dirname}/build`,
    filename: 'rxrest.bundle.js'
  },
  module: {
    loaders: [
      {test: /\.ts$/, loader: 'awesome-typescript-loader', exclude: /node_modules/}
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new CheckerPlugin()
  ]
}
