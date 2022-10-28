/* eslint-disable max-params */
const fetch = require('@gasket/fetch');
const fs = require('fs');
const rimraf = require('rimraf'),
  multiparty = require('multiparty'),
  fileInputName = process.env.FILE_INPUT_NAME || 'qqfile',
  uploadedFilesPath = '.next/forensic/',
  chunkDirName = 'chunks',
  maxFileSize = process.env.MAX_FILE_SIZE || 1024 * 1024 * 1024; // 1Gb in bytes, 0 for unlimited
const { getBucket } = require('./const');
const { getEventListeners, EventEmitter } = require('events');
const uploadEmitter = new EventEmitter();

const { PutObjectCommand } = require('@aws-sdk/client-s3');

const UPLOAD_FINISHED_EVENT = 'uploadFinished';

function uploadFileToQuicksand(s3Client, req, res) {
  var form = new multiparty.Form();
  var host = req.headers['host'];

  form.parse(req, function (err, fields, files) {
    const partIndex = fields.qqpartindex;
    const S3Path = fields.folder && fields.folder.length ? fields.folder[0] : '';

    res.set('Content-Type', 'text/plain');
    const eventName = UPLOAD_FINISHED_EVENT + fields.qqfilename;
    if (!getEventListeners(uploadEmitter, eventName).length) {
      uploadEmitter.once(eventName, function ({ fileName, fileDestination, destinationDir, success, failure }) {
        uploadEmitter.removeAllListeners(eventName);
        let s3FilePath = saveFileInS3({
          s3Client,
          S3Path,
          fileName,
          filePath: fileDestination,
          destinationDir,
          success: success,
          error: failure,
          host
        });
        createJobForFile(req, s3FilePath);
        // TODO: Pass job ID to results page
      });
    }
    if (partIndex == null) {
      onSimpleUpload(fields, files[fileInputName][0], res);
    } else {
      onChunkedUpload(fields, files[fileInputName][0], res);
    }
  });
}

function onSimpleUpload(fields, file, res) {
  var uuid = fields.qquuid,
    responseData = {
      success: false
    };

  file.name = fields.qqfilename;
  if (isValid(file.size)) {
    moveUploadedFile(
      file,
      uuid,
      function () {
        responseData.success = true;
        res.send(responseData);
      },
      function () {
        responseData.error = 'Problem copying the file!';
        res.send(responseData);
      }
    );
  } else {
    failWithTooBigFile(responseData, res);
  }
}

function onChunkedUpload(fields, file, res) {
  var size = parseInt(fields.qqtotalfilesize),
    uuid = fields.qquuid,
    index = fields.qqpartindex,
    totalParts = parseInt(fields.qqtotalparts),
    responseData = {
      success: false
    };

  file.name = fields.qqfilename;
  if (isValid(size)) {
    storeChunk(
      file,
      uuid,
      index,
      totalParts,
      function () {
        if (index < totalParts - 1) {
          responseData.success = true;
          res.send(responseData);
        } else {
          combineChunks(
            file,
            uuid,
            function () {
              responseData.success = true;
              res.send(responseData);
            },
            function () {
              responseData.error = 'Problem conbining the chunks!';
              res.send(responseData);
            }
          );
        }
      },
      function (reset) {
        responseData.error = 'Problem storing the chunk!';
        res.send(responseData);
      }
    );
  } else {
    failWithTooBigFile(responseData, res);
  }
}

function failWithTooBigFile(responseData, res) {
  responseData.error = 'Too big!';
  responseData.preventRetry = true;
  res.send(responseData);
}

function isValid(size) {
  return maxFileSize === 0 || size < maxFileSize;
}

function moveFile({ destinationDir, sourceFile, destinationFile, success, failure }) {
  fs.mkdir(destinationDir, { recursive: true }, (error) => {
    var sourceStream, destStream;

    if (error) {
      console.error('Problem creating directory ' + destinationDir + ': ' + error);
      failure();
    } else {
      sourceStream = fs.createReadStream(sourceFile);
      destStream = fs.createWriteStream(destinationFile);

      sourceStream
        .on('error', function (error) {
          console.error('Problem copying file: ' + error.stack);
          destStream.end();
          failure();
        })
        .on('end', function () {
          destStream.end();
          success();
        })
        .pipe(destStream);
    }
  });
}

function moveUploadedFile(file, uuid, success, failure) {
  var destinationDir = uploadedFilesPath + uuid + '/',
    fileDestination = destinationDir + file.name;
  const fileName = file.name;
  moveFile({
    destinationDir,
    sourceFile: file.path,
    destinationFile: fileDestination,
    success: () => {
      const eventName = UPLOAD_FINISHED_EVENT + file.name;
      uploadEmitter.emit(eventName, { fileName, fileDestination, destinationDir, success, failure });
    },
    failure
  });
}

function storeChunk(file, uuid, index, numChunks, success, failure) {
  var destinationDir = uploadedFilesPath + uuid + '/' + chunkDirName + '/',
    chunkFilename = getChunkFilename(index, numChunks),
    fileDestination = destinationDir + chunkFilename;
  moveFile({ destinationDir, sourceFile: file.path, destinationFile: fileDestination, success, failure });
}

function combineChunks(file, uuid, success, failure) {
  var chunksDir = uploadedFilesPath + uuid + '/' + chunkDirName + '/',
    destinationDir = uploadedFilesPath + uuid + '/',
    fileDestination = destinationDir + file.name;
  const fileName = file.name;
  fs.readdir(chunksDir, function (err, fileNames) {
    var destFileStream;

    if (err) {
      console.error('Problem listing chunks! ' + err);
      failure();
    } else {
      fileNames.sort();
      destFileStream = fs.createWriteStream(fileDestination, { flags: 'a' });

      appendToStream(
        destFileStream,
        chunksDir,
        fileNames,
        0,
        function () {
          rimraf(chunksDir, function (rimrafError) {
            if (rimrafError) {
              console.log('Problem deleting chunks dir! ' + rimrafError);
            }
          });
          const eventName = UPLOAD_FINISHED_EVENT + fileName;
          uploadEmitter.emit(eventName, { fileName, fileDestination, destinationDir, success, failure });
        },
        failure
      );
    }
  });
}

function appendToStream(destStream, srcDir, srcFilesnames, index, success, failure) {
  if (index < srcFilesnames.length) {
    fs.createReadStream(srcDir + srcFilesnames[index])
      .on('end', function () {
        appendToStream(destStream, srcDir, srcFilesnames, index + 1, success, failure);
      })
      .on('error', function (error) {
        console.error('Problem appending chunk! ' + error);
        destStream.end();
        failure();
      })
      .pipe(destStream, { end: false });
  } else {
    destStream.end();
    success();
  }
}

function getChunkFilename(index, count) {
  var digits = new String(count).length,
    zeros = new Array(digits + 1).join('0');

  return (zeros + index).slice(-digits);
}

async function createJobForFile(req, ioc) {
  const uri = req.apiBaseUrl + '/v1/jobs';
  const method = 'POST';
  const job = {
    iocType: 'FILE_REF',
    iocs: [ioc],
    modules: ['joesandbox'],
    metadata: {
      name: 'My Test Run'
    }
  };
  const payload = {
    method,
    body: JSON.stringify(job),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'sso-jwt ' + req.cookies['auth_jomax']
    }
  };
  let jobId;
  await fetch(uri, payload)
    .then((resp) => resp.json())
    .then((json) => {
      jobId = json;
    });
  return jobId;
}

function saveFileInS3({ s3Client, S3Path, fileName, filePath, destinationDir, success, error, host }) {
  let formattedFileName = fileName.join('');
  S3Path = 'quicksand/' + formattedFileName.replace('.', '-');
  if (S3Path && S3Path[S3Path.length - 1] === '/') {
    S3Path = S3Path.slice(0, S3Path.length - 1);
  }
  formattedFileName = S3Path ? S3Path + '/' + formattedFileName : formattedFileName;
  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err;
    }
    const params = {
      Bucket: getBucket(host),
      // Specify the name of the new object. For example, 'index.html'.
      // To create a directory for the object, use '/'. For example, 'myApp/package.json'.
      Key: formattedFileName,
      // Content of the new object.
      Body: data
    };
    s3Client
      .send(new PutObjectCommand(params))
      .then((data) => {
        rimraf(destinationDir, function (rimrafError) {
          if (rimrafError) {
            console.log('Problem deleting file after sending it to S3' + rimrafError);
          }
        });
        success();
      })
      .catch((data) => {
        rimraf(destinationDir, function (rimrafError) {
          if (rimrafError) {
            console.log('Problem deleting file after sending it to S3' + rimrafError);
          }
        });
        error();
      });
  });
  // Return full S3 file path after saving file
  return 's3://' + S3Path + '/' + formattedFileName;
}

module.exports = uploadFileToQuicksand;
