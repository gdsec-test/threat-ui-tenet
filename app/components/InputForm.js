import FileUpload from '@ux/file-upload';
import '@ux/file-upload/dist/styles.css';
import { Button, Checkbox, Dropdown, Form, Tooltip } from '@ux/uxcore2';
import { withRouter } from 'next/router';
import React, { Fragment } from 'react';
import { HighlightWithinTextarea } from 'react-highlight-within-textarea';
import createJob from '../api/createJob';
import getIOCTypesByInput from '../api/getIOCTypesByInput';
import getModulesListByIOCType from '../api/getModulesListByIOCType';
import Loader from './common/Loader';
import Tags from './common/Tags';
import RenderError from './common/RenderError';
import InputFormSubmitPopup from './InputFormSubmitPopup';

const { DropdownItem } = Dropdown;

const getKeys = (map) => [...map.keys()];

const getTooltip = (caption, message) => (
  <Tooltip openOnHover={true} autoHideTimeout={300} message={message}>
    {caption}
  </Tooltip>
);

class InputForm extends React.Component {
  isNoIOCTypesDetected;
  constructor() {
    super(...arguments);
    this.state = this.resetForm();
    this.state.isLoading = true;
    this.fileUpload = React.createRef();
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
    let highlightWithinTextarea = [];
    try {
      highlightWithinTextarea = Object.keys(detectedIOCTypes || {}).map((type) => {
        return {
          highlight: new RegExp(detectedIOCTypes[type].join('|').replaceAll('\\', '\\\\'), 'img'),
          className: `InputForm_Hightlight_${type.toLowerCase()}`
        };
      });
    } catch (err) { this.resetForm(); }
    this.setState({
      detectedIOCTypes,
      detectedIOCModules,
      selectedIOCModules: getKeys(detectedIOCModules).map((_, i) => i),
      isNoIOCTypesDetected: !IOCTypeNames.find((type) => type.toLowerCase() !== 'unknown'),
      highlightWithinTextarea
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
        this.fileUpload.current.resetFiles();
      };
      reader.readAsText(file);
    });
  }

  resetForm() {
    return {
      textAreaValue: '',
      detectedIOCModules: new Map(),
      selectedIOCModules: [],
      showSubmitPopup: false,
      submittedJobs: [],
      isLoading: false,
      isNoIOCTypesDetected: true.valueOf,
      tags: [],
      files: [],
      highlightWithinTextarea: []
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
    const { detectedIOCModules, tags, selectedIOCModules } = this.state;
    const jobs = new Map();
    const detectedIOCModulesKeys = getKeys(detectedIOCModules);
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
        const foundIOCModule = selectedIOCModules.indexOf(detectedIOCModulesKeys.indexOf(module)) >= 0;
        if (job.modules.indexOf(module) < 0 && foundIOCModule) {
          job.modules.push(module);
        }
        inputs.forEach((inp) => {
          if (job.inputs.indexOf(inp) < 0) {
            job.inputs.push(inp);
          }
        });
      });
    }, {});
    jobs.forEach((item, IOCType) => {
      if (item.modules.length === 0) {
        jobs.delete(IOCType);
      }
    });
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

  get isAllModulesChecked() {
    const {
      selectedIOCModules
    } = this.state;
    return selectedIOCModules.length > 0;
  }

  get isAllModulesIndeterminate() {
    const {
      detectedIOCModules,
      selectedIOCModules
    } = this.state;
    return selectedIOCModules.length < getKeys(detectedIOCModules).length && selectedIOCModules.length > 0;
  }

  onToggleAllChange = (e) => {
    const { checked } = e.target;
    const {
      detectedIOCModules,
    } = this.state;
    const selectedIOCModules = checked ? getKeys(detectedIOCModules).map((_, i) => i) : [];
    this.setState({ selectedIOCModules });
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
      textAreaValue,
      highlightWithinTextarea,
      selectedIOCModules
    } = this.state;
    if (isLoading) {
      return <Loader inline size='lg' text='Loading Input Form...' />;
    }
    if (showSubmitPopup) {
      return <InputFormSubmitPopup submitIsInProgress={submitIsInProgress} submittedJobs={submittedJobs} />;
    }
    const detectedIOCModulesCount = getKeys(detectedIOCModules).length
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
              ref={this.fileUpload}
              accept='text/plain'
              multiple={false}
              maxSizeError={true}
              duplicateError={true}
              onChange={this.readFromFile}
              label={
                <Fragment>
                  {/* eslint-disable-next-line max-len */}
                  Parse file{getTooltip('', 'You can upload a text file with IOC values to be checked. IOCs can be comma-separated, space-separated or each IOC can be on a new line. Types found will be updated in 1-2 seconds')}
                </Fragment>
              }
              buttonLabel='Parse File'
              showFiles={false}
            />
          </div>
          <div className='InputForm_IOCValue'>
            <HighlightWithinTextarea
              key={`textIOCinput`}
              name='IOC'
              value={textAreaValue}
              placeholder='Start typing IOC'
              highlight={highlightWithinTextarea}
              onChange={(value) => this.detectIOCType(value)}
            />
          </div>
          <p className='InputForm_IOC_Types_Legend'>
            Types found:{' '}
            {
              Object.keys(detectedIOCTypes || {}).map((type) => {
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
        <div className={`InputForm_Dropdown`}>
          <Dropdown
            type='multiselect'
            label={
              <span style={{ fontWeight: 'bold' }}>
                {getTooltip('IOC Modules', 'Choose Modules supported for current IOC')}
              </span>
            }
            name='IOC Types'
            onChange={this.onIOCModuleChange}
            selected={selectedIOCModules}
          >
            {[...detectedIOCModules.entries()].map(([module]) => {
              return <DropdownItem key={module} value={module}>{`${module}`}</DropdownItem>;
            })}
          </Dropdown>
          <div className={`InputForm_Dropdown_ToggleAll`}>
            <Checkbox
              label={`${ selectedIOCModules.length === 0 ? 'no' :
                ( selectedIOCModules.length < detectedIOCModulesCount ? 'some' : 'all') } modules selected`}
              indeterminate={ this.isAllModulesIndeterminate }
              checked={ this.isAllModulesChecked }
              onChange={ this.onToggleAllChange }
              disabled={!detectedIOCModulesCount}
            />
          </div>
        </div>
        {isNoIOCTypesDetected && (
          <div style={{ color: 'red' }} className='mt-3'>
            {getTooltip('No IOC Types recognized. Cannot submit jobs.', 'All IOCs are Unknown')}
          </div>
        )}
        <Button disabled={isNoIOCTypesDetected} design='primary' title='Submit' type='submit'>
          Submit
        </Button>
      </Form>
    );
  }
}

export default withRouter(RenderError(InputForm));
