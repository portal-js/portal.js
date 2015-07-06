var webpack = require('webpack');

module.exports = {
  resolve: {
    extensions: ["", ".coffee", ".js"]
  },
  entry: {
    app: ['./src/portal.js']
  },
  output: {
    path: './dist/',
    library: 'Portal',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader?stage=0&optional=runtime'
      }
    ]
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ]
}
