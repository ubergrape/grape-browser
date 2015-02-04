var webpack = require('webpack')

var plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  })
]

if (process.env.COMPRESS) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  )
}

module.exports = {

  output: {
    library: 'Smartcomplete',
    libraryTarget: 'var'
  },
/*
  externals: {
    react: 'React'
  },
*/
  node: {
    Buffer: false
  },

  plugins: plugins,

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: '6to5-loader'}
    ]
  }
}
