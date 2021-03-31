module.exports = {
  timing: { last: true },
  handler(gasket, config) {
    console.log('Gasket config', JSON.stringify(config));
    return config;
  }
};
