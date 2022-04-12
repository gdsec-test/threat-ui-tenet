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
let developmentConfig = baseDevConfig;
if (process.env.LOCAL_TENET_CONFIG === "true") {
  developmentConfig = {
    ...baseDevConfig,
    hostname: 'local.ui.threat.int.dev-gdcorp.tools',
    https: {
      root: './cert',
      key: 'ui.threat.int.dev-gdcorp.tools.key',
      cert: ['ui.threat.int.dev-gdcorp.tools.crt']
    }
  }
}
module.exports = {
  plugins: {
    presets: ['@godaddy/webapp'],
    add: ['@godaddy/gasket-plugin-auth', '@godaddy/gasket-plugin-proxy', '@gasket/mocha', '@gasket/plugin-redux']
  },
  rigor: {
    serviceId: 'tenet'
  },
  environments: {
    development: developmentConfig,
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
    productionBrowserSourceMaps: true,
    future: {
      webpack5: true
    }
  },
  intl: {
    localesDir: './locales',
    serveStatic: true
  }
};
