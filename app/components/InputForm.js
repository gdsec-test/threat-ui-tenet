import React from 'react';
import getIOCTypeByInput from '../api/getIOCTypeByInput';
import { IOC_TYPE } from '../utils/const';

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
      allIOCTypes: Object.values(IOC_TYPE)
    };
    this.state.selectedIOCTypes = this.state.allIOCTypes.map((item, index) => index);
    this.onIOCTypeChange = this.onIOCTypeChange.bind(this);
    this.detectIOCType = this.detectIOCType.bind(this);
    //this.select = this.select.bind(this);
  }

  async detectIOCType({ target: { value } }) {
    const detectedIOCType = await getIOCTypeByInput(value);
    this.setState({
      detectedIOCType
    })
  }

  onIOCTypeChange({ value }) {
    let {
      allIOCTypes,
      selectedIOCTypes
    } = this.state;
    const newIndex = allIOCTypes.findIndex(item => item.id === value);
    selectedIOCTypes = selectedIOCTypes.slice();
    let foundIOCIndex = selectedIOCTypes.indexOf(newIndex);
    if (foundIOCIndex >=0) {
      selectedIOCTypes.splice(foundIOCIndex, 1);
    } else {
      selectedIOCTypes.push(newIndex);
    }
    this.setState({
      selectedIOCTypes
    });
  }
  
  render() {
    return <Form
    action='#'
    onSubmit={() => {} }>
      <FormElement label='IOC' name='IOC'
        autoComplete='off'
        placeholder='Start typing IOC'
        onChange={this.detectIOCType}
      />
      <div>Your detected IOC Type is: {this.state.detectedIOCType}</div>
      <Dropdown
        type='multiselect'
        label={<span style={{ fontWeight: 'bold' }}>
              <Tooltip title='Type of IOC' message='Choose Types of Indicator Of Compromise supported for current Input'>IOC Types</Tooltip>
              </span> }
        name='IOC Types'
        onChange={this.onIOCTypeChange}
        selected={this.state.selectedIOCTypes}
        >

        { this.state.allIOCTypes.map(typeItem => {
            return <DropdownItem key={ typeItem.id } value={ typeItem.id }>{ typeItem.desc }</DropdownItem>;
        }) }
      </Dropdown>
    </Form>

  }
}