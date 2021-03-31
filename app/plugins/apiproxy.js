const fetch = require('@gasket/fetch');
const { getLoginUrlFromRequest } = require('@gasket/auth/lib/utils');
const express = require('express');

const PROXY_ENDPOINTS = [
  {
    url: 'jobs'
  },
  {
    url: 'jobs/:jobId'
  },
  {
    url: 'jobs',
    method: 'post'
  },
  {
    url: 'classifications',
    method: 'post'
  },
  {
    url: 'modules'
  }
];

function getApiProxy(apiBaseUrl) {
  return async function (req, originalResponse) {
    const url = apiBaseUrl + req.path.replace('/api', '/v1');
    const payload = {
      method: req.method,
      headers: {
        cookie: req.get('cookie')
      }
    };
    if (req.method !== 'GET') {
      payload.body = JSON.stringify(req.body);
    }
    console.log('REQUEST ' + url);
    const response = await fetch(url, payload);

    if (response.status === 401) {
      const ssoLogin = getLoginUrlFromRequest(req);
      if (ssoLogin) {
        console.log('REDIRECT TO LOGIN  ' + ssoLogin);
        originalResponse.status(401).send({ error: 'Unauthorized', ssoLogin });
      }
    } else {
      // we proxy all parts of original response
      originalResponse.status(response.status);
      const headers = Object.fromEntries(response.headers);
      originalResponse.set({ ...headers });
      const body = await response.buffer();
      originalResponse.send(body);
    }
  };
}

module.exports = {
  name: 'threatpi',
  hooks: {
    middleware: function (gasket) {
      return function (req, res, next) {
        let apiBaseUrl = gasket.config.apiBaseUrl;
        apiBaseUrl = 'https://api.threat.int.dev-gdcorp.tools';
        if (process.env === 'production') {
          apiBaseUrl = 'https://api.threat.int.gdcorp.tools';
        }
        console.log('process.env.NODE_ENV: ' + process.env.NODE_ENV);
        console.log(apiBaseUrl);
        req.getApiProxy = getApiProxy(apiBaseUrl);
        next();
      };
    },

    express: function (gasket, app) {
      app.use(express.json()); // for parsing application/json
      app.use(express.urlencoded({ extended: true }));
      PROXY_ENDPOINTS.forEach(({ url, method }) => {
        const func = method || 'get';
        app[func](`/api/${url}`, async function (req, res) {
          await req.getApiProxy(req, res);
        });
      });
    }
  }
};
