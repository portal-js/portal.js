module.exports = {
  resolve: {
    extensions: ["", ".coffee", ".js"]
  },
  entry: {
    app: ['./src/portal.js']
  },
  output: {
    path: './dist/',
    filename: 'Portal.js',
    library: 'Portal',
    libraryTarget: 'umd'
  }
}