import React, { Fragment } from 'react';
import getIOCTypesByInput from '../api/getIOCTypesByInput';
import getModulesListByIOCType from '../api/getModulesListByIOCType';
import createJob from '../api/createJob';
import { IOC_TYPE } from '../utils/const';
import Loader from './common/Loader';
import FileUpload from '@ux/file-upload';
import { withRouter } from 'next/router';
import { FormElement, Form, Dropdown, Tooltip, Button } from '@ux/uxcore2';
import Cross from '@ux/icon/x';
import '@ux/file-upload/dist/styles.css';
import '@ux/icon/x/index.css';

const { DropdownItem } = Dropdown;

const getKeys = (map) => [...map.keys()];

class InputForm extends React.Component {
  constructor() {
    super(...arguments);
    this.state = this.resetForm();
    this.state.isLoading = true;
    this.onIOCModuleChange = this.onIOCModuleChange.bind(this);
    this.detectIOCType = this.detectIOCType.bind(this);
    this.createJob = this.createJob.bind(this);
    this.readFromFile = this.readFromFile.bind(this);
    this.addTag = this.addTag.bind(this);
  }

  componentDidMount() {
    getModulesListByIOCType().then((allIOCModules) => {
      this.setState({
        isLoading: false,
        allIOCModules
      });
    });
  }

  async detectIOCType(value) {
    const { allIOCModules } = this.state;
    const IOCValues = this.getIOCValues(value);
    const detectedIOCTypes = await getIOCTypesByInput(IOCValues);
    const detectedIOCModules = new Map();
    const IOCTypeNames = Object.keys(detectedIOCTypes);
    /* eslint-disable-next-line */
    Object.entries(allIOCModules).forEach(([module, { supportedIOCTypes = [] }]) => {
      const typesPerModule = supportedIOCTypes.filter((type) => IOCTypeNames.indexOf(type) >= 0);
      if (typesPerModule.length) {
        // only modules for IOC Types found in input values
        detectedIOCModules.set(
          module,
          typesPerModule.map((ioctype) => ({
            type: ioctype,
            inputs: detectedIOCTypes[ioctype]
          }))
        );
      }
    });
    this.setState({
      detectedIOCModules,
      selectedIOCModules: getKeys(detectedIOCModules).map((_, i) => i),
      isNoIOCTypesDetected: !IOCTypeNames.find((type) => type !== 'unknown')
    });
  }

  getIOCValues(rawText) {
    return rawText
      .replaceAll('\n', ',')
      .replaceAll(' ', ',')
      .split(',')
      .reduce((acc, text) => {
        if (text && text.trim()) {
          acc.push(text);
        }
        return acc;
      }, []);
  }

  readFromFile(fileList) {
    let fullText = '';
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        fullText += text + '\n';
        this.setState({ IOCValueFromFile: fullText });
        this.detectIOCType(text);
      };
      reader.readAsText(file);
    });
  }

  resetForm() {
    return {
      detectedIOCModules: new Map(),
      selectedIOCModules: [IOC_TYPE.UNKNOWN],
      showSubmitPopup: false,
      submittedJobs: [],
      isLoading: false,
      isNoIOCTypesDetected: true.valueOf,
      tags: []
    };
  }

  onIOCModuleChange({ value }) {
    let { detectedIOCModules, selectedIOCModules } = this.state;

    const newIndex = getKeys(detectedIOCModules).indexOf(value);
    selectedIOCModules = [...selectedIOCModules];

    const foundIOCIndex = selectedIOCModules.indexOf(newIndex);
    if (foundIOCIndex >= 0) {
      selectedIOCModules.splice(foundIOCIndex, 1);
    } else {
      selectedIOCModules.push(newIndex);
    }
    this.setState({ selectedIOCModules });
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

  async createJob() {
    this.setState({
      showSubmitPopup: true,
      submitIsInProgress: true,
      submittedJobs: []
    });
    const { detectedIOCModules, tags } = this.state;
    const jobs = new Map();
    [...detectedIOCModules.entries()].forEach(([module, IOCTypes = []]) => {
      IOCTypes.forEach(({ inputs = [], type }) => {
        if (type === 'unknown') {
          return; // do not submit job for unknown ioc types
        }
        if (!jobs.has(type)) {
          jobs.set(type, {
            modules: [],
            inputs: []
          });
        }
        const job = jobs.get(type);
        if (job.modules.indexOf(module) < 0) {
          job.modules.push(module);
        }
        inputs.forEach((inp) => {
          if (job.inputs.indexOf(inp) < 0) {
            job.inputs.push(inp);
          }
        });
      });
    }, {});
    await Promise.all(
      [...jobs.entries()].map(([IOCType, item]) =>
        createJob({
          inputType: IOCType,
          inputs: item.inputs,
          modules: item.modules,
          metadata: {
            tags: [...tags, IOCType]
          }
        }).then((res) => {
          const { submittedJobs } = this.state;
          this.setState({ submittedJobs: submittedJobs.slice().concat([res.jobId]) });
          return res;
        })
      )
    );
    this.setState({ submitIsInProgress: false });
  }

  render() {
    const {
      detectedIOCModules,
      showSubmitPopup,
      submittedJobs,
      submitIsInProgress,
      isLoading,
      isNoIOCTypesDetected,
      IOCValueFromFile,
      tags
    } = this.state;
    const { router } = this.props;
    if (isLoading) {
      return <Loader inline size='lg' />;
    }
    if (showSubmitPopup) {
      return (
        <Form
          className={'InputForm'}
          action=''
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div>
            {submitIsInProgress && (
              <Fragment>
                <div>Jobs are submitting...</div>
                <Loader inline size='lg' />
              </Fragment>
            )}
            {submittedJobs.map((id) => (
              <div key={id}>{`Job ${id} submitted successfully`}</div>
            ))}
            <Button design='secondary' onClick={() => router.push(`/jobs?jobIds=${submittedJobs.join(',')}`)}>
              See created jobs
            </Button>
          </div>
        </Form>
      );
    }
    return (
      <Form
        className={'InputForm'}
        action=''
        onSubmit={(e) => {
          e.preventDefault();
          this.createJob();
        }}
      >
        <div className='InputForm_FileUpload'>
          <FileUpload onChange={this.readFromFile} label='Parse file' buttonLabel='sasdf' showFiles={false} />
        </div>
        <FormElement
          key={`textIOCinput${IOCValueFromFile ? 'fromFile' : ''}`}
          label='IOC (Indicator Of Compromise)'
          name='IOC'
          type='textarea'
          className='InputForm_IOCType'
          autoComplete='off'
          placeholder='Start typing IOC'
          onChange={({ target: { value } }) => this.detectIOCType(value)}
          {...(IOCValueFromFile ? { defaultValue: IOCValueFromFile } : {})}
        />

        <p>
          Your detected IOC Types are:{' '}
          {[...detectedIOCModules.entries()].map(([module, arrInputs = []]) => {
            return (
              <Fragment key={module}>
                <h5>{`For module: ${module}`}</h5>
                {arrInputs.map(({ inputs, type }) => (
                  <Fragment key={inputs.join(',')}>
                    <b>{inputs.join(', ')}</b>:<span style={{ color: 'red' }}>{type.toUpperCase()}</span>
                    <br />
                  </Fragment>
                ))}
              </Fragment>
            );
          })}
        </p>
        <Dropdown
          type='multiselect'
          label={
            <span style={{ fontWeight: 'bold' }}>
              <Tooltip title='Modules List' message='Choose Modules supported for current IOC'>
                IOC Modules
              </Tooltip>
            </span>
          }
          name='IOC Types'
          onChange={this.onIOCModuleChange}
          selected={this.state.selectedIOCModules}
        >
          <div>
            <label htmlFor='addtag' className='form-control-label'>
              Add Tag{' '}
            </label>
          </div>
          <input type='text' label='Add Tag' onKeyDown={this.addTag} name='addtag' />
          {tags.length ? (
            <div className='InputForm_Tags_List'>
              <div>Tags:</div>
              <div>
                {tags.map((tag) => {
                  return (
                    <span className='InputForm_Tag' key={tag}>
                      {`${tag}`}
                      <Cross
                        onClick={() => {
                          const newTags = this.state.tags.slice();
                          newTags.splice(newTags.indexOf(tag), 1);
                          this.setState({ tags: newTags });
                        }}
                        width={'1em'}
                        height={'1em'}
                      />
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div className='InputForm_IOCValue_Group'>
            <div className='InputForm_FileUpload'>
              <FileUpload
                accept='text/plain'
                onChange={this.readFromFile}
                label='Parse file'
                buttonLabel='sasdf'
                showFiles={false}
              />
            </div>
            <FormElement
              key={`textIOCinput${IOCValueFromFile ? 'fromFile' : ''}`}
              label='IOC (Indicator Of Compromise)'
              name='IOC'
              type='textarea'
              className='InputForm_IOCType'
              autoComplete='off'
              placeholder='Start typing IOC'
              onChange={({ target: { value } }) => this.detectIOCType(value)}
              {...(IOCValueFromFile ? { defaultValue: IOCValueFromFile } : {})}
            />
          </div>
          <p>
            Your detected IOC Types are:{' '}
            {[...detectedIOCModules.entries()].map(([module, arrInputs = []]) => {
              return (
                <Fragment key={module}>
                  <h5>{`For module: ${module}`}</h5>
                  {arrInputs.map(({ inputs, type }) => (
                    <Fragment key={inputs.join(',')}>
                      <b>{inputs.join(', ')}</b>:<span style={{ color: 'red' }}>{type.toUpperCase()}</span>
                      <br />
                    </Fragment>
                  ))}
                </Fragment>
              );
            })}
          </p>
          <Dropdown
            type='multiselect'
            label={
              <span style={{ fontWeight: 'bold' }}>
                <Tooltip title='Modules List' message='Choose Modules supported for current IOC'>
                  IOC Modules
                </Tooltip>
              </span>
            }
            name='IOC Types'
            onChange={this.onIOCModuleChange}
            selected={this.state.selectedIOCModules}
          >
            {[...detectedIOCModules.entries()].map(([module]) => {
              return <DropdownItem key={module} value={module}>{`${module}`}</DropdownItem>;
            })}
          </Dropdown>
          {isNoIOCTypesDetected && (
            <div style={{ color: 'red' }} className='m-3'>
              No IOC Types recognized. Cannot submit jobs
            </div>
          )}
          <Button disabled={isNoIOCTypesDetected} design='primary' title='Submit' type='submit'>
            Submit
          </Button>
        </Form>
      </Fragment>
    );
  }
}

export default withRouter(InputForm);
