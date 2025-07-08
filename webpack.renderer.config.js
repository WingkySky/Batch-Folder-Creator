// Webpack 配置文件（前端渲染进程），支持 JSX、Antd、热更新
const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production', // 根据环境切换模式
  entry: './renderer/index.jsx', // 入口文件
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出目录
    filename: 'bundle.js', // 输出文件名
    clean: true // 每次构建清理输出目录
  },
  devtool: 'inline-source-map', // 便于调试
  devServer: {
    static: path.join(__dirname, 'public'), // 静态资源目录
    port: 8080, // 开发服务器端口
    hot: true, // 启用热更新
    open: false // 不自动打开浏览器
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], // 支持 CSS 文件
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource', // 支持图片资源
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // 支持的文件扩展名
  },
  plugins: [], // 可扩展插件
}; 