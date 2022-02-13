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
              postcssOptions: {
                plugins: () => [require("autoprefixer")]
              }
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
    static: {
      directory: path.resolve(__dirname, 'dist', 'writers-friend'),
    },
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
      chunks: ["vendor", "react", "runtime", "main"],
      chunksSortMode: "manual" // manual: sort in the order of the chunks array
    })
  ],
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all'
        },
        vendor: {
          test(mod) {
            // exclude anything outside node modules
            if (!mod.context.includes('node_modules')) {
              return false;
            }

            // exclude react and react-dom
            if (/[\\/]node_modules[\\/](react|react-dom)[\\/]/.test(mod.context)) {
              return false;
            }

            // return all other node modules
            return true;
          },
          name: 'vendor',
          chunks: 'all'
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
