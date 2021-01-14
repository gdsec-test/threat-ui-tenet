const fetch = require('@gasket/fetch');
const { getLoginUrlFromRequest } = require('@gasket/auth/lib/utils');
const express = require('express');


function getApiProxy() {
  return async function (req, originalResponse) {
    const url = 'https://api-private.threat.int.gdcorp.tools' + req.path;
    const payload = {
      method: req.method,
      headers: {
        // 'Accept': 'application/json',
        // 'Content-Type': 'application/json',
        cookie: req.get('cookie')
      }
    };
    if (req.method !== 'GET') {
      payload.body = JSON.stringify(req.body);
    }
    const response = await fetch(url, payload);

    if (response.status === 401) {
    const ssoLogin = getLoginUrlFromRequest(req);
    if (ssoLogin) {
      originalResponse.redirect(ssoLogin);
    }
    } else {
      return response.json();
    }
  };
}


module.exports = {
  name: 'threatpi',
  hooks: {

    middleware: function (gasket) {

      return function (req, res, next) {
        req.getApiProxy = getApiProxy();
        next();
      };
    },

    express: function (gasket, app) {
      app.use(express.json()) // for parsing application/json
      app.use(express.urlencoded({ extended: true })) 
      app.get('/jobs', async function (req, res) {
        const data = await req.getApiProxy(req, res);
        res.json(data);
      });
      app.get('/job/:jobId', async function (req, res) {
        const data = await req.getApiProxy(req, res);
        res.json(data);
      });
      app.post('/job', async function (req, res) {
        const data = await req.getApiProxy(req, res);
        res.json(data);
      });
    }
  }
};