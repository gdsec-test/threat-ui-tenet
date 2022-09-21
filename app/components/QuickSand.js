/* eslint-disable max-len */
import React, { Component } from 'react';
import FileUpload from '@ux/file-upload';
import '@ux/file-upload/dist/styles.css';
import '@ux/text-input/dist/styles.css';
import { withRouter } from 'next/router';
import RenderError from './common/RenderError';
import { Form, Button, Tooltip } from '@ux/uxcore2/lib';

// File types accepted by Joe Sandbox
const acceptedFileTypes =
  'image/*,.exe,.dll,.pif,.cmd,.bat,.com,.scr,.cpl,.pdf,.doc,.docx,.dotm,.xls,.xlsx,.xlsm,.xlsb,.ppt,.pptx,.pptm,.hwp,.jtd,.rft,.xpi,.crx,.eml,.msg,.chm,.js,.vbs,.vbe,,.lnk,.jar,.ps1,.zip,.7z,.rar,.zlib,.asp,.aspx,.apk,.mach-o,.dmg,.app,.xar,.pkg';

const getTooltip = (caption, message) => (
  <Tooltip openOnHover={true} autoHideTimeout={300} message={message}>
    {caption}
  </Tooltip>
);

class QuickSand extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      files: []
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(fileList) {
    this.setState({
      files: fileList
    });
  }

  addTag(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.stopPropagation();
      e.preventDefault();
      const newTags = this.state.tags.slice();
      newTags.push(e.target.value);
      e.target.value = '';
      this.setState({ tags: newTags });
    }
  }

  render() {
    return (
      <Form className={'InputForm'} action=''>
        <h6>
          Submit Files
          {getTooltip(
            '',
            'File types supported by Joe Sandbox: image/*,.exe,.dll,.pif,.cmd,.bat,.com,.scr,.cpl,.pdf,.doc,.docx,.dotm,.xls,.xlsx,.xlsm,.xlsb,.ppt,.pptx,.pptm,.hwp,.jtd,.rft,.xpi,.crx,.eml,.msg,.chm,.js,.vbs,.vbe,,.lnk,.jar,.ps1,.zip,.7z,.rar,.zlib,.asp,.aspx,.apk,.mach-o,.dmg,.app,.xar,.pkg'
          )}
        </h6>

        <div>
          <FileUpload
            name='quicksand-file-upload'
            accept={acceptedFileTypes}
            maxSize={1073741824} // 1 GB
            multiple={true}
            onChange={this.onChange}
            acceptTypeError='We don not accept that file type'
            maxSizeError='The file exceeds our size limit'
            duplicateError='You have uploaded this file already!'
            label='Drag your files here'
            buttonLabel='Browse'
          />
        </div>

        <p></p>
        {getTooltip('Add Tags', 'Add comma-separated tags to your job (optional)')}
        <p>
          <input type='text' label='Add Tags' onKeyDown={this.addTag} name='addtag' />
        </p>
        <p></p>

        <Button design='primary' title='Submit' type='submit'>
          Submit
        </Button>
      </Form>
    );
  }
}

export default withRouter(RenderError(QuickSand));