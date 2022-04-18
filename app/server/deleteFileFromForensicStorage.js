const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const { BUCKET } = require('./const');

module.exports = (s3Client, req, res) => {
  let filePath = req.body.filePath;
  s3Client
    .send(new DeleteObjectCommand({ Bucket: BUCKET['dev-private'], Key: filePath }))
    .then(data => {
      res.send(data);
    })
    .catch(data => {
      res.send(data);
    });
};
