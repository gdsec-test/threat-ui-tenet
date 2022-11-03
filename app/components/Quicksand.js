/* eslint-disable max-len */
import '@ux/file-upload/dist/styles.css';
import CloudUpload from '@ux/icon/cloud-upload';
import '@ux/icon/cloud-upload/index.css';
import '@ux/icon/x/index.css';
import '@ux/text-input/dist/styles.css';
import { Form, Tooltip } from '@ux/uxcore2/lib';
import { withRouter } from 'next/router';
import 'rc-tree/assets/index.css';
import React, { useEffect, useState } from 'react';
// This page used the react-fine-uploader: https://github.com/FineUploader/react-fine-uploader
import 'react-fine-uploader/gallery/gallery.css';
import RenderError from './common/RenderError';

const acceptedFileTypes =
  'image/*,video/*,audio/*,.exe,.dll,.pif,.cmd,.bat,.com,.scr,.cpl,.pdf,.doc,.docx,.docm,.xls,.xlsx,.xlsm,.xlsb,.ppt,.pptx,.pptm,.hwp,.jtd,.rft,.xpi,.crx,.eml,.msg,.chm,.js,.vbs,.vbe,,.lnk,.jar,.ps1,.zip,.7z,.rar,.zlib,.asp,.aspx,.apk,.mach-o,.dmg,.app,.xar,.pkg';
const getTooltip = (caption, message) => (
  <Tooltip openOnHover={true} autoHideTimeout={300} message={message}>
    {caption}
  </Tooltip>
);

let createUploader;
let Gallery;
if (process.browser) {
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
          endpoint: '/api/quicksand/upload'
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
  };
}

export const ForensicStorage = () => {
  const [refresh, setRefresh] = useState(null);
  const [uploader, setUploader] = useState(null);

  useEffect(() => {
    if (createUploader) {
      setUploader(
        createUploader({
          onComplete: () => {
            setRefresh(!refresh);
          }
        })
      );
    }
  }, [refresh]);

  return (
    <Form className={'InputForm'}>
      <h6>
        Submit Files
        {getTooltip('', 'File types supported by Joe Sandbox: ' + acceptedFileTypes)}
      </h6>

      <div>
        {process.browser && uploader && (
          <Gallery
            uploader={uploader}
            fileInput-children={`Upload`}
            dropzone-content={
              <span className={'react-fine-uploader-gallery-dropzone-content'}>
                <CloudUpload />
                {` Upload your files to S3`}
              </span>
            }
          />
        )}
      </div>

      <p></p>
      {getTooltip('Add Tags', 'Add comma-separated tags to your job (optional)')}
      <input type='text' label='Add Tags' name='addtag' />
    </Form>
  );
};

export default withRouter(RenderError(ForensicStorage));
