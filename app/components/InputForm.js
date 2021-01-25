import React, { Fragment } from 'react';
import getIOCTypesByInput from '../api/getIOCTypesByInput';
import getModulesListByIOCType from '../api/getModulesListByIOCType';
import createJob from '../api/createJob';
import { IOC_TYPE } from '../utils/const';

import { FormElement, Form, Dropdown, Tooltip, Button, Spinner } from '@ux/uxcore2';

const { DropdownItem } = Dropdown;

const getKeys = (map) => [...map.keys()];

export default class InputForm extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      detectedIOCTypes: [],
      detectedIOCModules: new Map(),
      selectedIOCModules: [IOC_TYPE.UNKNOWN],
      isSubmitJobs: false,
      submittedJobs: []
    };
    this.onIOCModuleChange = this.onIOCModuleChange.bind(this);
    this.detectIOCType = this.detectIOCType.bind(this);
    this.createJob = this.createJob.bind(this);
  }

  async detectIOCType({ target: { value } }) {
    const detectedIOCTypes = await getIOCTypesByInput(this.getIOCValues(value));
    const detectedIOCModules = await getModulesListByIOCType(detectedIOCTypes);
    this.setState({
      detectedIOCTypes,
      detectedIOCModules,
      selectedIOCModules: getKeys(detectedIOCModules).map((_, i) => i)
    });
  }

  getIOCValues(rawText) {
    return rawText.split(',');
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

  async createJob() {
    this.setState({
      isSubmitJobs: true,
      submittedJobs: []
    });
    const { detectedIOCModules } = this.state;
    const jobs = new Map();
    [...detectedIOCModules.entries()].forEach(([module, item]) => {
      const IOCTypes = item.values;
      IOCTypes.forEach(({ input = [], type }) => {
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
        input.forEach((inp) => {
          if (job.inputs.indexOf(inp) < 0) {
            job.inputs.push(inp);
          }
        });
      });
    }, {});
    await Promise.all(
      [...jobs.entries()].map(([IOCType, item]) =>
        createJob({ inputType: IOCType, inputs: item.inputs, modules: item.modules }).then((res) => {
          const { submittedJobs } = this.state;
          this.setState({ submittedJobs: submittedJobs.slice().concat([res.job_id]) });
          return res;
        })
      )
    );
    this.setState({
      isSubmitJobs: false
    });
  }

  render() {
    const { detectedIOCModules, isSubmitJobs, submittedJobs } = this.state;
    if (isSubmitJobs) {
      return (
        <div>
          <div>Jobs are submitting...</div>
          <Spinner inline size='lg' />
          {submittedJobs.map((id) => (
            <div key={id}>{`Job ${id} submitted successfully`}</div>
          ))}
        </div>
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
        <FormElement
          label='IOC (Indicator Of Compromise)'
          name='IOC'
          className='InputForm_IOCType'
          autoComplete='off'
          placeholder='Start typing IOC'
          onChange={this.detectIOCType}
        />
        <p>
          Your detected IOC Types are:{' '}
          {this.state.detectedIOCTypes.map(({ input = [], type = '' }) => (
            <Fragment key={input.join(',')}>
              <b>{input.join(',')}</b>:<span style={{ color: 'red' }}>{type.toUpperCase()}</span>,{' '}
            </Fragment>
          ))}
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
            // const desc = `${item.values.map(({ type, input }) => `${type}:${input}`).join(', ')}`;
            return <DropdownItem key={module} value={module}>{`${module}`}</DropdownItem>;
          })}
        </Dropdown>
        <Button design='primary' disabled='' title='Submit' type='submit'>
          Submit
        </Button>
      </Form>
    );
  }
}
