module.exports = {
  plugins: {
    presets: [
      '@godaddy/webapp'
    ],
    add: [
      '@gasket/mocha'
    ]
  },
  rigor: {
    serviceId: 'tenet'
  },
  presentationCentral: {
    params: {
      app: 'threat-ui-tenet',
      header: 'internal-header'
    }
  }
};
