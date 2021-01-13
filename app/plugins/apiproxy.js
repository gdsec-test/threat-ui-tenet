const fetch = require('@gasket/fetch');

module.exports = {
  name: 'threatpi',
  hooks: {

    middleware: function (gasket) {
      function getJobsProxy(uri, req) {
        return async function (params) {
          const url = 'https://api-private.threat.int.gdcorp.tools' + uri;
          const response = await fetch(url, {
            headers: {
              cookie: req.get('cookie')
            }
          });
          console.log(response.ok);
          console.log(response.status);
          console.log(response.headers);
          
          const json = response.json();
          console.log(json);
          
          return json;
        };
      }

      return function (req, res, next) {
        req.getJobs = getJobsProxy('/jobs', req);
        next();
      };
    },

    express: function (gasket, app) {
      app.get('/jobs', async function (req, res) {
        const { query, params } = req;
        const data = await req.getJobs({ query, params });
        res.send(data);
      });
    }
  }
};