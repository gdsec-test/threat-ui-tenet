const { ListObjectsCommand } = require('@aws-sdk/client-s3');

const { getBucket } = require('./const');

module.exports = (s3Client, req, res) => {
  host = req.headers['host'];
  s3Client
    .send(new ListObjectsCommand({ Bucket: getBucket(host) }))
    .then((data) => {
      if (data && data.Code === 'AccessDenied') {
        res.send({ error: data.Code });
      } else {
        res.send(data);
      }
    })
    .catch((data) => {
      res.send(data);
    });
};
