const path = require('path');

const baseDevConfig = {
  redux: {
    initState: {
      urls: {
        apiBaseUrl: 'https://api.threat.int.dev-gdcorp.tools'
      }
    }
  },
  hostname: 'ui.threat.int.dev-gdcorp.tools',
  rootDomain: 'dev-gdcorp.tools',
  apiBaseUrl: 'https://api.threat.int.dev-gdcorp.tools'
};
module.exports = {
  plugins: {
    presets: ['@godaddy/webapp'],
    add: ['@godaddy/gasket-plugin-auth', '@godaddy/gasket-plugin-proxy', '@gasket/mocha', '@gasket/plugin-redux']
  },
  rigor: {
    serviceId: 'tenet'
  },
  environments: {
    local: { ...baseDevConfig,
      hostname: 'local.ui.threat.int.dev-gdcorp.tools',
      https: {
        root: './cert',
        key: 'local.ui.threat.int.dev-gdcorp.tools.key',
        cert: ['local.ui.threat.int.dev-gdcorp.tools.crt']
      }
    },
    development: baseDevConfig,
    production: {
      redux: {
        initState: {
          urls: {
            apiBaseUrl: 'https://api.threat.int.gdcorp.tools'
          }
        }
      },
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
  },
  nextConfig: {
    future: {
      webpack5: true
    }
  },
  intl: {
    localesDir: './locales',
    serveStatic: true
  }
};
