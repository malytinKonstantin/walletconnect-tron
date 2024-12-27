module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        // Add the new rule for .cjs files
        webpackConfig.module.rules.push({
          test: /\.cjs$/,
          type: 'javascript/auto',
        });
        return webpackConfig;
      },
    },
  };