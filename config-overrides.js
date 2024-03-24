const path = require('path');

const babelLoader = {
  loader: 'babel-loader',
  options: {
    // Your babel options
    presets: ['@babel/preset-env', '@babel/preset-react'],
  },
};

module.exports = {
  // Your webpack configuration settings...
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // Pass the result from styled-jsx loader to babel-loader
          babelLoader,
          {
            loader: 'styled-jsx/webpack-loader',
            options: {
              type: 'global', // Choose your styled-jsx mode: 'global' or 'scoped'
            },
          },
        ],
      },
      {
        test: /\.m?[jt]sx?$/, // Corrected regex
        exclude: /node_modules/,
        use: babelLoader,
      },
      // Other rules...
    ],
  },
  // Other webpack configuration settings...
};
