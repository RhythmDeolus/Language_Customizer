const { VueLoaderPlugin } = require('vue-loader')
const path = require('path');

module.exports = {
    entry: './website/main.js',
    output: {
        path: path.join(__dirname, '/website/dist'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader'
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
          },
          {
            test: /\.(png|jpg|gif|svg)$/,
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: '[name].[ext]?[hash]'
            }
          },
          {
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            loader: 'file-loader',
            options: {
              name: '[name].[ext]?[hash]'
            }
          }
        ]
      },
      plugins: [
        new VueLoaderPlugin()
      ],
      devServer: {
        contentBase: path.join(__dirname, 'dist'),
        historyApiFallback: true,
        noInfo: true,
        overlay: true
      },
}