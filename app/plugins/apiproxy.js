const fetch = require('@gasket/fetch');
const { getLoginUrlFromRequest } = require('@gasket/auth/lib/utils');
const express = require('express');
const { S3Client } = require('@aws-sdk/client-s3');
const listForensicStorage = require('../server/listForensicStorage');
const uploadFile = require('../server/uploadFile');
const deleteFileFromForensicStorage = require('../server/deleteFileFromForensicStorage');
const { REGION } = require('../server/const');

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
  },
  {
    url: 'vulnerability',
    method: 'post'
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
    const response = await fetch(url, payload);
    if (response.status === 401) {
      const ssoLogin = getLoginUrlFromRequest(req);
      if (ssoLogin) {
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
  name: 'threatapi',
  hooks: {
    middleware: {
      timing: {
        after: ['@gasket/redux']
      },
      handler: function (gasket) {
        return function (req, res, next) {
          const apiBaseUrl = gasket.config.apiBaseUrl;
          req.apiBaseUrl = apiBaseUrl;
          req.getApiProxy = getApiProxy(apiBaseUrl);
          next();
        };
      }
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
      let s3Client;
      if (!process.env.FORENSIC_USER_CREDS) {
        console.warn('Credentials for forensic storage are not found in env variables');
      } else {
        const { AccessKeyId, SecretAccessKey } = JSON.parse(process.env.FORENSIC_USER_CREDS);
        s3Client = new S3Client({
          region: REGION,
          credentials: {
            accessKeyId: AccessKeyId,
            secretAccessKey: SecretAccessKey
          }
        });
      }
      function apiListForensicStorage(req, res) {
        if (!process.env.FORENSIC_USER_CREDS) {
          res.send({ error: 'Forensic storage is not authorized. See logs' });
        } else {
          listForensicStorage.apply(this, [s3Client, ...arguments]);
        }
      }
      function apiUploadFile(req, res) {
        if (!process.env.FORENSIC_USER_CREDS) {
          res.send({ error: 'Forensic storage is not authorized. See logs' });
        } else {
          uploadFile.apply(this, [s3Client, ...arguments]);
        }
      }
      function apiDeleteFileFromForensicStorage(req, res) {
        if (!process.env.FORENSIC_USER_CREDS) {
          res.send({ error: 'Forensic storage is not authorized. See logs' });
        } else {
          deleteFileFromForensicStorage.apply(this, [s3Client, ...arguments]);
        }
      }
      app.get('/api/forensic', apiListForensicStorage);
      app.post('/api/forensic/upload', apiUploadFile);
      app.delete('/api/forensic/delete', apiDeleteFileFromForensicStorage);
    }
  }
};
