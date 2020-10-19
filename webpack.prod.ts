const webpack = require("webpack");
const path = require("path");

module.exports = {
  entry: {
    main: "./lib/index.ts",
  },
  module: {
    rules: [
      {
        test: /\.worker\.ts$/,
        use: [{ loader: "worker-loader" }],
      },
      {
        test: /\.ts?$/,
        exclude: [/node_modules/],
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
};
