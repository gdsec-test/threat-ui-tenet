import React, { Fragment } from 'react';
import getIOCTypeByInput from '../api/getIOCTypeByInput';
import getModulesListByIOCType from '../api/getModulesListByIOCType';
import createJob from "../api/createJob";
import getJobs from "../api/getJobs";
import {IOC_TYPE} from "../utils/const";

import {
  FormElement,
  Form,
  Criteria,
  Dropdown,
  Checkbox,
  Tooltip,
  RadioGroup,
  Button
} from '@ux/uxcore2';

const { DropdownItem } = Dropdown;

const getKeys = map => [...map.keys()];

export default class InputForm extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      detectedIOCTypes: [],
      detectedIOCModules: new Map(),
      selectedIOCModules: [IOC_TYPE.UNKNOWN],
    };
    this.onIOCModuleChange = this.onIOCModuleChange.bind(this);
    this.detectIOCType = this.detectIOCType.bind(this);
    this.createJob = this.createJob.bind(this);
  }

  async detectIOCType({ target: { value } }) {
    const detectedIOCTypes = await getIOCTypeByInput(value);
    const detectedIOCModules = await getModulesListByIOCType(detectedIOCTypes);
    this.setState({
      detectedIOCTypes, detectedIOCModules, selectedIOCModules: getKeys(detectedIOCModules).map((_,i) => i)
    })
  }

  onIOCModuleChange({ value }) {
    let {
      detectedIOCModules,
      selectedIOCModules
    } = this.state;

    const newIndex = getKeys(detectedIOCModules).indexOf(value);
    selectedIOCModules = [...selectedIOCModules];

    let foundIOCIndex = selectedIOCModules.indexOf(newIndex);
    if (foundIOCIndex >= 0) {
      selectedIOCModules.splice(foundIOCIndex, 1);
    } else {
      selectedIOCModules.push(newIndex);
    }
    this.setState({ selectedIOCModules });
  }

  async createJob() {
    const jobs = await getJobs();
    console.log(jobs);
    
  }

  render() {
    const { detectedIOCModules } = this.state;
    return <Form
      className={'InputForm'}
      action=''
      onSubmit={(e) => {
        e.preventDefault();
        this.createJob();

      }}>
        <FormElement label='IOC (Indicator Of Compromise)' name='IOC'
          className='InputForm_IOCType'
          autoComplete='off'
          placeholder='Start typing IOC'
          onChange={this.detectIOCType}
        />
        <p >Your detected IOC Types are: {this.state.detectedIOCTypes.
          map(({ input, type ='' }) => <Fragment><b>{input}</b>:<span style={{ color: 'red'}}>{type.toUpperCase()}</span>, </Fragment>)}</p>
        <Dropdown
          type='multiselect'
          label={<span style={{ fontWeight: 'bold' }}>
                <Tooltip title='Type of IOC' message='Choose Modules supported for current IOC'>IOC Modules</Tooltip>
                </span> }
          name='IOC Types'
          onChange={this.onIOCModuleChange}
          selected={this.state.selectedIOCModules}
        >
          {[...detectedIOCModules.entries()].map(([module, item]) => {
            const desc = `${item.values.map(({ type, input }) => `${type}:${input}`).join(', ')}`;
            return <DropdownItem key={ module } value={ module }>{ `${module}` }</DropdownItem>;
          })}
      </Dropdown>
      <Button design='primary' disabled='' title='Submit' type='submit'>Submit</Button>
    </Form>
  }
}
