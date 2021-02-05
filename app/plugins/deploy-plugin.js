/* eslint-disable no-process-env, no-sync */
const fs = require('fs');

module.exports = {
  name: 'gasket-plugin-threat-ui-tenet-deploy',
  hooks: {
    configure: {
      timing: {
        before: ['core']
      },
      handler: async function (gasket, config) {
        const newConfig = {
          ...config
        };

        // If running locally with or without docker with "npm run local"
        // The default gasket certs are good enough and no need to change them.
        // when running on AWS Fargate, the connection from load balancer to the fargate endpoint
        // is using https using a self-signed cert that gets generated in the Dockerfile.
        if (config.env !== 'local') {
          console.log('APPLYING SERVER.crt');
          newConfig.https = {
            port: 8443,
            // root: process.cwd(),
            cert: fs.readFileSync(`${process.cwd()}/cert/server.crt`, { encoding: 'utf8' }),
            key: fs.readFileSync(`${process.cwd()}/cert/server.key`, { encoding: 'utf8' })
            // cert: './cert/server.crt',
            // key: './cert/server.key'
          };
          console.log(newConfig.https);
        }

        return newConfig;
      }
    }
  }
};
