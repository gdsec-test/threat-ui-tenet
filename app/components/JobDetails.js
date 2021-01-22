import React from 'react';
import { Spinner, Table, Dropdown } from '@ux/uxcore2';
import getJob from '../api/getJob';
import { THEMES } from '../utils/const';
import JSONTree from 'react-json-tree';
import ReactJson from 'react-json-view';
const { DropdownItem } = Dropdown;

export default class JobDetails extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      isLoading: true,
      theme: 'monokai'
    };
    this.onChangeTheme = this.onChangeTheme.bind(this);
  }

  componentDidMount() {
    const { id } = this.props;
    getJob(id).then((jobDetails) => {
      this.setState({
        isLoading: false,
        jobDetails
      });
    });
  }

  onChangeTheme({ selected }) {
    this.setState({
      theme: THEMES[selected].value
    });
  }

  render() {
    const { jobDetails, isLoading, theme } = this.state;
    if (isLoading) {
      return <Spinner inline size='lg' />;
    }
    /* eslint-disable-next-line camelcase, no-unused-vars */
    const { responses, start_time, job_status, job_percentage, request } = jobDetails;
    return (
      <div className='m-3'>
        <Table
          className='table table-hover'
          data={[
            { name: 'Status', value: job_status },
            { name: 'Progress', value: job_percentage },
            { name: 'Stared on', value: start_time },
            { name: 'Input', value: request }
          ]}
        ></Table>
        <Dropdown label={'Theme'} type='select' name='JSONtheme' onChange={this.onChangeTheme}>
          {THEMES.map(({ value, label }) => (
            <DropdownItem key={value}>{label}</DropdownItem>
          ))}
        </Dropdown>
        <JSONTree data={responses} theme={theme} shouldExpandNode={() => true} />
        <ReactJson src={responses} theme={theme} displayDataTypes={false} />
      </div>
    );
  }
}
