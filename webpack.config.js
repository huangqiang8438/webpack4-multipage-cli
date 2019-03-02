const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 更改1
 const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const extractTextPlugin = require("extract-text-webpack-plugin");
const cleanWebpackPlugin = require("clean-webpack-plugin");
var glob = require("glob")
function getPages(globalPath){//动态读取目录
     let entiers={}
    glob.sync(globalPath).forEach(entry=>{
      let pathArr=entry.split('/')
      let entryName=pathArr[pathArr.length-2]
      entiers[entryName]=entry
  })
  return entiers
}
function getHtmlPlugins(entiers) {
  //entiers 需要打包的页面数组
  let pages=[]
 Object.keys(entiers).forEach(n=>{
     let config={
       chunks: ['vendor',n],
       filename: n+'.html',
       template: entiers[n].replace('.js','.html')
     }
     pages.push(new HtmlWebpackPlugin(config))
 })
 return pages
}
const entiers=getPages('./src/pages/*/index.js')
const htmlPlugins=getHtmlPlugins(entiers)
module.exports = {
  entry: entiers,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/js/[name].js',
    chunkFilename: "assets/js/[name].js"
  },
  optimization:{
    splitChunks:{
      cacheGroups: {
        // 首先: 打包node_modules中的文件
        vendor: {
          name: "vendor",
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
          priority: 10
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
    },
    {
      test: /\.css$/,
      // 不分离的写法
      // use: ["style-loader", "css-loader"]
      // 使用postcss不分离的写法
      // use: ["style-loader", "css-loader", "postcss-loader"]
      // 此处为分离css的写法
      /*use: extractTextPlugin.extract({
        fallback: "style-loader",
        use: "css-loader",
        // css中的基础路径
        publicPath: "../"

      })*/
      // 此处为使用postcss分离css的写法
      use: extractTextPlugin.extract({
        fallback: "style-loader",
        use: ["css-loader"],
        // css中的基础路径
        publicPath: "../"

      })
    },
    
    {
      test: /\.(png|jpg|gif)$/,
      use: [{
          // 需要下载file-loader和url-loader
          loader: "url-loader",
          options: {
            limit: 50,
            name:"[name].[ext]",
            // 图片文件输出的文件夹
            outputPath: "assets/images"
          }
        }
      ]
    },
    {
      test: /\.html$/,
      // html中的img标签
      use: ["html-withimg-loader"]
    },
    {
      test: /\.(scss|sass)$/,
      // sass不分离的写法，顺序不能变
      // use: ["style-loader", "css-loader", "sass-loader"]
      // 分离的写法
      use: extractTextPlugin.extract({
        fallback:"style-loader",
        use: ["css-loader", "sass-loader"]
      })
    }
  ]
  },
  plugins:[
    new cleanWebpackPlugin(["dist"]),
    new extractTextPlugin('assets/css/[name].css'), //此处也可以根据splitChunkPlugin的chunk名字做对应
    ...htmlPlugins
    
  ]
}