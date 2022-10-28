const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const { getBucket } = require('./const');

module.exports = (s3Client, req, res) => {
  host = req.headers['host'];
  let filePath = req.body.filePath;
  s3Client
    .send(new DeleteObjectCommand({ Bucket: getBucket(host), Key: filePath }))
    .then((data) => {
      res.send(data);
    })
    .catch((data) => {
      res.send(data);
    });
};
