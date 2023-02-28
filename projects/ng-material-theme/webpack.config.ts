import CopyPlugin from "copy-webpack-plugin";
import path from "path";
import nodeExternals from "webpack-node-externals";
//import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const config = {
  mode: "production",
  entry: "./src/ts/index.ts",
  target: "web",
  externals: [nodeExternals()],
  externalsPresets: {
    node: true,
  },
  // devtool: 'sourcemaps',

  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: [
          {
            loader: require.resolve("ts-loader"),
            options: {
              transpileOnly: false,
            },
          },
        ],
        exclude: [path.resolve("node_modules")],
      },
      {
        test: /\.scss$/i,
        loader: require.resolve("raw-loader"),
        options: {
          esModule: false,
        },
      },
    ],
  },

  plugins: [
    //new NodePolyfillPlugin(),

    new CopyPlugin({
      patterns: [
        { from: "**/*.scss", to: path.resolve("./dist/scss/theming"), context: "../ng-material-theme-converter/dist/scss" },
        { from: "**/*.scss", to: path.resolve("./dist/scss/theming"), context: "../shared/scss" },
        { from: "**/*.scss", to: path.resolve("./dist/theme_base"), context: "../ng-material-theme-converter/dist/base" },
      ],
    }),
  ],
  output: {
    filename: "main.js",
    library: {
      type: "umd",
      name: "MyLib",
    },
    //libraryTarget: 'umd',
    path: path.resolve(__dirname, "dist/lib"),
    globalObject: "this",
  },
};

//console.log(fs.realpathSync(path.resolve("node_modules/webpack")).split('/webpack@')[0])

export default () => {
  return config;
};
