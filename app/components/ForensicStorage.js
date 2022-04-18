import '@ux/file-upload/dist/styles.css';
import CloudUpload from '@ux/icon/cloud-upload';
import '@ux/icon/cloud-upload/index.css';
import '@ux/icon/x/index.css';
import TextInput from '@ux/text-input';
import '@ux/text-input/dist/styles.css';
import { Button } from '@ux/uxcore2';
import { withRouter } from 'next/router';
import Tree from 'rc-tree';
import "rc-tree/assets/index.css";
import React, { useEffect, useState } from 'react';
// import Gallery from 'react-fine-uploader';
import 'react-fine-uploader/gallery/gallery.css';
import deleteForensicStorageFile from '../api/deleteForensicStorageFile';
import getForensicStorage from '../api/getForensicStorage';
import Loader from './common/Loader';
import RenderError from './common/RenderError';

const formatTreeDataFolder = (s3Data) => {
  const { Contents = []} = s3Data;
  const root = {
    key: 'root',
    title: 'root',
    children: []
  };
  Contents.forEach(({ Key, Size, LastModified }, i) => {
    const path = Key.split('/');
    let parent = root;
    let keyPath = '0';
    let formattedPath = '';
    path.forEach((pathPart, i) => {
      keyPath += '-' + pathPart;
      formattedPath += pathPart + '/';
      parent.children = parent.children || [];
      const currentLevel = parent.children.find(({key}) => (key === keyPath));
      if (!currentLevel) {
        const title = i === path.length - 1 ? `${pathPart} (size: ${Size}, modified: ${LastModified})` :pathPart;
        currentLevel = {
          value: formattedPath,
          key: keyPath,
          title,
          isLeaf: i === path.length - 1,
          children: []
        }
        parent.children.push(currentLevel);
      }
      parent = currentLevel;
    });
  });
  return root.children;
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
              enabled: false
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
  const [treeData, setTreeData] = useState(null);
  const [refresh, setRefresh] = useState(null);
  const [uploader, setUploader] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const isInvalid = /[^\w\d\/]/.test(selectedFolder);
  function onSelectFolder(folder) {
    setSelectedFolder(folder);
    uploader.methods.setParams({
      folder: folder
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
      setTreeData(formatTreeDataFolder(s3DataResponse));
    })
    .catch(err => {
      alert("Error during reading S3 forensice storage:" + err);
    });
  }, [refresh]);
  return (
    <div style={{
      margin: 20
    }}>
      {process.browser && uploader &&
        <Gallery uploader={ uploader } 
          fileInput-children={`Upload files into selected S3 path`}
          dropzone-content={<span className={ 'react-fine-uploader-gallery-dropzone-content' }>
                <CloudUpload/>
                {`Drop files into "${selectedFolder}" S3 path`}
            </span>}
        />
      }
      <TextInput
      label='Current folder for uploads'
      invalid={ isInvalid }
      helpMessage='Only letters and numbers in folder path, please'
      errorMessage={ isInvalid ? 'There is an invalid character in there!' : null }
      onChange={ (folder) => {
        onSelectFolder(folder);
      } }
      value={ selectedFolder }/>      
      { treeData ? (
          <div>
          <Button design="primary" text="Delete selected file in S3" onClick={() => {
            deleteForensicStorageFile(selectedFile).then(() => {
              setRefresh(!refresh);
            });
          }} />
          <span style={{
            fontSize: '1.2em',
            margin: 10,
            fontWeight: 'bold'
          }}>
          
            {`Selected file: ${selectedFile}`}
          </span>
          <p style={{
            padding: '10px 0',
            fontSize: '1.2em',
            margin: 0,
            fontWeight: 'bold'
          }}>
            Forensic storage file structure:
          </p>
          <Tree
          style={{
            border: '1px solid black'
          }}
          selectable={true}
          defaultExpandAll
          itemHeight={20}
          onSelect={(keys, { node: { isLeaf, value }}) => {
            if (!isLeaf) {
              onSelectFolder(value);
            } else {
              setSelectedFile(value.slice(0, value.length - 1));
            }
          }}
          treeData={treeData}
        />
        </div>
        
      ) : (        <Loader inline size='lg' text='Loading report...' />
      )}
    </div>
  );
};

export default withRouter(RenderError(ForensicStorage));
