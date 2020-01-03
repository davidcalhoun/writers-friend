const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const package = require("./package.json");

const config = {
  entry: ["./src/index.js"],
  output: {
    path: path.resolve(__dirname, "dist/writers-friend"),
    filename: "[name].[hash].js",
    publicPath: "/writers-friend/"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: true
            }
          },
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              plugins: () => [require("autoprefixer")]
            }
          }
        ]
      },
      {
        test: /\.(txt|ico|svg)$/i,
        use: [
          {
            loader: "file-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {}
  },
  devServer: {
    contentBase: "./dist/writers-friend",
    open: true,
    historyApiFallback: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
      filename: "index.html", // output
      inject: true,
      appMountId: "app",
      templateParameters: {
        title: "Writer's Friend"
      },
      minify: false,
      chunks: ["vendors", "runtime", "main"],
      chunksSortMode: "manual" // manual: sort in the order of the chunks array
    })
  ],
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  }
};

module.exports = (env, argv) => {
  if (argv.mode === "development") {
    config.output.publicPath = "/";
  }

  return config;
};
