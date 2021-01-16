module.exports = {
  http: 8080,
  plugins: {
    presets: [
      '@godaddy/webapp'
    ],
    add: [
      '@godaddy/gasket-plugin-auth',
      '@godaddy/gasket-plugin-proxy',
      '@gasket/mocha'
    ]
  },
  rigor: {
    serviceId: 'tenet'
  },
  environments: {
    local: {
      hostname: 'ui.threat.int.dev-gdcorp.tools',
      rootDomain: 'gdcorp.tools',
      https: {
        root: './cert',
        key: 'ui.threat.int.dev-gdcorp.tools.key',
        cert: ['ui.threat.int.dev-gdcorp.tools.crt']
      },
    },
    production: {
      hostname: 'ui.threat.int.gdcorp.tools',
      rootDomain: 'gdcorp.tools',
      https: {
        root: './cert',
        key: 'ui.threat.int.gdcorp.tools.key',
        cert: ['ui.threat.int.gdcorp.tools.crt']
      },
    }
  },
  presentationCentral: {
    params: {
      app: 'threat-ui-tenet',
      header: 'no-header'
    }
  }
};
