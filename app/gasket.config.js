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
      hostname: 'local.ui.threat.int.dev-gdcorp.tools',
      rootDomain: 'dev-gdcorp.tools',
      https: {
        root: './cert',
        key: 'local.ui.threat.int.dev-gdcorp.tools.key',
        cert: ['local.ui.threat.int.dev-gdcorp.tools.crt']
      },
      apiBaseUrl: 'https://api-private.threat.int.dev-gdcorp.tools'
    },
    development: {
      hostname: 'ui.threat.int.dev-gdcorp.tools',
      rootDomain: 'dev-gdcorp.tools',
      apiBaseUrl: 'https://api-private.threat.int.dev-gdcorp.tools'
    },
    production: {
      hostname: 'ui.threat.int.gdcorp.tools',
      rootDomain: 'gdcorp.tools',
      apiBaseUrl: 'https://api.threat.int.gdcorp.tools'
    }
  },
  presentationCentral: {
    params: {
      app: 'threat-ui-tenet',
      header: 'internal-header'
    }
  }
};
