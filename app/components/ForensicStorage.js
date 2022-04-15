import '@ux/file-upload/dist/styles.css';
import '@ux/icon/x/index.css';
import { withRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
// import Gallery from 'react-fine-uploader';
import 'react-fine-uploader/gallery/gallery.css';
import { JSONTree } from 'react-json-tree';
import getForensicStorage from '../api/getForensicStorage';
import { expandData, formatData } from '../utils/dataFormatters';
import Loader from './common/Loader';
import RenderError from './common/RenderError';


const formatS3Folder = (s3Data) => {
  const { Contents = []} = s3Data;
  const root = {};
  Contents.forEach(({ Key, Size, LastModified }) => {
    const path = Key.split('/');
    path.reduce((acc, pathPart, i) => {
      if (i === path.length - 1) {
        acc[pathPart] = `size: ${Size}, lastModified: ${LastModified}`
      } else {
        acc[pathPart] = acc[pathPart] || {};
      }
      return acc[pathPart];
    }, root);
  });
  return root;
}

let createUploader;
let Gallery;
if (process.browser) { // fine=uploader deosn't work on server-side where NextJS renders React components as well
  const FineUploaderTraditional = require('fine-uploader-wrappers').default;
  Gallery = require('react-fine-uploader').default;
  createUploader = ({ onComplete }) => {
    const uploader = new FineUploaderTraditional({
      options: {
          chunking: {
              enabled: true
          },
          deleteFile: {
              enabled: false,
              endpoint: '/api/forensic/delete'
          },
          request: {
              endpoint: '/api/forensic/upload'
          },
          retry: {
              enableAuto: true
          },
          callbacks: {
            onComplete: onComplete
        }
      }
    });
    return uploader;
  }
}

export const ForensicStorage = () => {
  const [s3Data, setS3Data] = useState(null);
  const [refresh, setRefresh] = useState(null);
  const [uploader, setUploader] = useState(null);
  const fileUpload = React.createRef();
  function readFromFile(fileList) {
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        //fileUpload.current.resetFiles();
      };
      reader.readAsBinaryString(file);
    });
  }
  useEffect(() => {
    if (createUploader) {
      setUploader(createUploader({ onComplete: ()=> {
        setRefresh(!refresh);
      }}));
    }
    getForensicStorage()
    .then(s3DataResponse => {
      setS3Data(formatS3Folder(s3DataResponse));
    })
    .catch(err => {
      setS3Data(err);
    });
  }, [refresh]);
  return (
    <div style={{
      margin: 20
    }}>
      {/* <FileUpload
        ref={fileUpload}
        multiple={false}
        maxSize={268435456}
        duplicateError={true}
        onChange={readFromFile}
        label='Upload File To S3'
        buttonLabel='Upload File To S3'
      /> */}
      {process.browser && uploader &&
        <Gallery uploader={ uploader } />
      }
      {s3Data ? (
        <JSONTree
          data={s3Data}
          theme={'monokai'}
          labelRenderer={keyPath => <b>{keyPath[0]}</b>}
          valueRenderer={formatData}
          shouldExpandNode={expandData}
        />
      ) : (
        <Loader inline size='lg' text='Loading report...' />
      )}
    </div>
  );
};

export default withRouter(RenderError(ForensicStorage));
