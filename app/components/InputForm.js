import React, { Fragment } from 'react';
import getIOCTypesByInput from '../api/getIOCTypesByInput';
import getModulesListByIOCType from '../api/getModulesListByIOCType';
import createJob from '../api/createJob';
import { IOC_TYPE } from '../utils/const';
import Loader from './common/Loader';
import Tags from './common/Tags';
import InputFormSubmitPopup from './InputFormSubmitPopup';
import { HighlightWithinTextarea } from 'react-highlight-within-textarea';
import FileUpload from '@ux/file-upload';
import { withRouter } from 'next/router';
import { Form, Dropdown, Tooltip, Button } from '@ux/uxcore2';
import '@ux/file-upload/dist/styles.css';

const { DropdownItem } = Dropdown;

const getKeys = (map) => [...map.keys()];

const getTooltip = (caption, message) => (
  <Tooltip openOnHover={true} autoHideTimeout={300} message={message}>
    {caption}
  </Tooltip>
);

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
    this.setState({
      textAreaValue: value
    });
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
      detectedIOCTypes,
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
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        this.detectIOCType(text);
      };
      reader.readAsText(file);
    });
  }

  resetForm() {
    return {
      textAreaValue: '',
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
        if (type.toLowerCase() === 'unknown') {
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
            tags: [...tags, IOCType],
            modules: item.modules
          }
        }).then((res) => {
          const { submittedJobs } = this.state;
          this.setState({ submittedJobs: submittedJobs.slice().concat([{ id: res.jobId, tags: [...tags, IOCType] }]) });
          return res;
        })
      )
    );
    this.setState({ submitIsInProgress: false });
  }

  render() {
    const {
      detectedIOCTypes,
      detectedIOCModules,
      showSubmitPopup,
      submittedJobs,
      submitIsInProgress,
      isLoading,
      isNoIOCTypesDetected,
      tags,
      textAreaValue
    } = this.state;
    if (isLoading) {
      return <Loader inline size='lg' text='Loading Input Form...' />;
    }
    if (showSubmitPopup) {
      return <InputFormSubmitPopup submitIsInProgress={submitIsInProgress} submittedJobs={submittedJobs} />;
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
        {tags.length ? (
          <div className='InputForm_Tags_List'>
            <div>Tags:</div>
            <Tags
              tags={tags}
              onClick={(tag) => {
                const newTags = this.state.tags.slice();
                newTags.splice(newTags.indexOf(tag), 1);
                this.setState({ tags: newTags });
              }}
            />
          </div>
        ) : null}
        {getTooltip('Add Tag', 'Tags are used to find job among others')}
        <p>
          <input type='text' label='Add Tag' onKeyDown={this.addTag} name='addtag' />
        </p>
        <div className='InputForm_IOCValue_Group'>
          <div className='InputForm_FileUpload'>
            <FileUpload
              accept='text/plain'
              onChange={this.readFromFile}
              label={
                <Fragment>Parse file{getTooltip('', 'You can upload file with IOC values to be checked')}</Fragment>
              }
              buttonLabel='sasdf'
              showFiles={false}
            />
          </div>
          <HighlightWithinTextarea
            key={`textIOCinput`}
            name='IOC'
            value={textAreaValue}
            containerClassName='InputForm_IOCValue'
            placeholder='Start typing IOC'
            autoComplete='off'
            highlight={() => {
              return Object.keys(detectedIOCTypes || {}).map((type) => {
                return {
                  highlight: new RegExp(detectedIOCTypes[type].join('|').replaceAll('\\', '\\\\'), 'img'),
                  className: `InputForm_Hightlight_${type.toLowerCase()}`
                };
              });
            }}
            onChange={({ target: { value } }) => this.detectIOCType(value)}
          />
          <p className='InputForm_IOC_Types_Legend'>
            Types found:{' '}
            {Object.keys(detectedIOCTypes || {}).map((type) => {
              return (
                <span
                  key={type}
                  className={`mr-3 InputForm_IOC_Types_Legend_Value InputForm_Hightlight_${type.toLowerCase()}`}
                >
                  {type}
                </span>
              );
            })}
          </p>
        </div>
        {/* <p>
        <h5>Your detected IOC Types are:{' '}</h5>
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
        </p> */}
        <Dropdown
          type='multiselect'
          label={
            <span style={{ fontWeight: 'bold' }}>
              {getTooltip('IOC Modules', 'Choose Modules supported for current IOC')}
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
          <div style={{ color: 'red' }} className='mt-3'>
            {getTooltip('No IOC Types recognized. Cannot submit jobs', 'All IOCs are Unkown to be analized')}
          </div>
        )}
        <Button disabled={isNoIOCTypesDetected} design='primary' title='Submit' type='submit'>
          Submit
        </Button>
      </Form>
    );
  }
}

export default withRouter(InputForm);
