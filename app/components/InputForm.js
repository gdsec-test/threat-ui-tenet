import React from 'react';
import getIOCTypeByInput from '../api/getIOCTypeByInput';
import getModulesListByIOCType from '../api/getModulesListByIOCType';
import createJob from "../api/createJob";

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

export default class InputForm extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      detectedIOCType: "Unknown",
      detectedIOCModules: [],
      selectedIOCModules: [],
    };
    this.onIOCModuleChange = this.onIOCModuleChange.bind(this);
    this.detectIOCType = this.detectIOCType.bind(this);
    this.createJob = this.createJob.bind(this);
  }

  async detectIOCType({ target: { value } }) {
    const detectedIOCType = await getIOCTypeByInput(value);
    const detectedIOCModules = await getModulesListByIOCType(detectedIOCType);
    this.setState({
      detectedIOCType, detectedIOCModules, selectedIOCModules: detectedIOCModules.map((_, idx) => idx)
    })
  }

  onIOCModuleChange({ value }) {
    let {
      detectedIOCModules,
      selectedIOCModules
    } = this.state;

    const newIndex = detectedIOCModules.indexOf(value);
    selectedIOCModules = [...selectedIOCModules];

    let foundIOCIndex = selectedIOCModules.indexOf(newIndex);
    if (foundIOCIndex >= 0) {
      selectedIOCModules.splice(foundIOCIndex, 1);
    } else {
      selectedIOCModules.push(newIndex);
    }
    this.setState({ selectedIOCModules });
  }

  createJob() {
    // await createJob();
    
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
        <FormElement label='IOC' name='IOC'
          className='InputForm_IOCType'
          autoComplete='off'
          placeholder='Start typing IOC'
          onChange={this.detectIOCType}
        />
        <p >Your detected IOC Type is: {this.state.detectedIOCType}</p>
        <Dropdown
          type='multiselect'
          label={<span style={{ fontWeight: 'bold' }}>
                <Tooltip title='Type of IOC' message='Choose Types of Indicator Of Compromise supported for current Input'>IOC Modules</Tooltip>
                </span> }
          name='IOC Types'
          onChange={this.onIOCModuleChange}
          selected={this.state.selectedIOCModules}
        >
          {detectedIOCModules.map(module => {
              return <DropdownItem key={ module } value={ module }>{ module }</DropdownItem>;
          })}
        <input />
      </Dropdown>
      <Button design='primary' disabled='' title='Submit' type='submit'>Submit</Button>
    </Form>
  }
}
