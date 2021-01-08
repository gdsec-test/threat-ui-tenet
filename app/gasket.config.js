module.exports = {
  plugins: {
    presets: [
      '@godaddy/webapp'
    ],
    add: [
      '@godaddy/gasket-plugin-auth',
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
