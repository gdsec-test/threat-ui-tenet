module.exports = {
  plugins: {
    presets: ['@godaddy/webapp'],
    add: ['@godaddy/gasket-plugin-auth', '@godaddy/gasket-plugin-proxy', '@gasket/mocha']
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
      apiBaseUrl: 'https://api-private.threat.int.dev-gdcorp.tools'
    },
    production: {
      hostname: 'ui.threat.int.gdcorp.tools',
      rootDomain: 'gdcorp.tools',
      apiBaseUrl: 'https://api-private.threat.int.gdcorp.tools'
    }
  },
  presentationCentral: {
    params: {
      app: 'threat-ui-tenet',
      header: 'internal-header'
    }
  }
};
