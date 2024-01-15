module.exports = {
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('postcss-pxtorem')({
      rootValue: 100,
      unitPrecision: 4,
      propList: ['*'],
      selectorBlackList: ['*'],
      mediaQuery: true,
      minPixelValue: 0,
    }),
  ],
};
