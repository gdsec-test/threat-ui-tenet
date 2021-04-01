module.exports = {
  timing: { last: true },
  handler(gasket, config) {
    console.log('GASKET CONFIG', JSON.stringify(config));
    return config;
  }
};
