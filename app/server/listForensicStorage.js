const { ListObjectsCommand } = require('@aws-sdk/client-s3');

const { BUCKET } = require('./const');

module.exports = (s3Client, req, res) => {
    s3Client
    .send(new ListObjectsCommand({ Bucket: BUCKET['dev-private'] }))
    .then(data => {
      res.send(data);
    })
    .catch(data => {
      res.send(data);
    });
};
