import React from 'react';
import { Table, Dropdown } from '@ux/uxcore2';
import Download from '@ux/icon/download';
import getJob from '../api/getJob';
import { THEMES } from '../utils/const';
import JSONTree from 'react-json-tree';
import Loader from './common/Loader';
import CopyToClipboard from './common/CopyToClipboard';
import dataFormatters from '../utils/dataFormatters';
const { DropdownItem } = Dropdown;
import '@ux/icon/clipboard/index.css';
import '@ux/icon/download/index.css';

export default class JobDetails extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      isLoading: true,
      theme: 'monokai'
    };
    this.onChangeTheme = this.onChangeTheme.bind(this);
    this.saveToFile = this.saveToFile.bind(this);
  }

  componentDidMount() {
    const { id } = this.props;
    getJob(id).then((jobDetails) => {
      jobDetails.responses = Object.keys(jobDetails.responses).reduce((acc, key) => {
        const moduleDataFormatter = dataFormatters[key];
        if (moduleDataFormatter) {
          acc[key] = moduleDataFormatter(acc[key]);
        }
        return acc;
      }, jobDetails.responses);
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

  saveToFile() {
    const { id } = this.props;
    const { jobDetails } = this.state;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(jobDetails, null, 2)], {
        type: 'text/plain'
      })
    );
    a.setAttribute('download', `${id}.json`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  render() {
    const { jobDetails, isLoading, theme } = this.state;
    if (isLoading) {
      return <Loader inline size='lg' text='Loading job details...' />;
    }
    /* eslint-disable */
    const { responses, startTime, jobStatus, jobPercentage, submission } = jobDetails;
    let dateTime = new Date(startTime * 1000);
    return (
      <div className='JobDetails'>
        <Table
          className='table table-hover'
          data={[
            { name: 'Status', value: jobStatus },
            { name: 'Progress', value: jobPercentage },
            { name: 'Started on', value: dateTime.toString() },
            { name: 'Input', value: JSON.stringify(submission) }
          ]}
        ></Table>
        <div className='JobDetails_controls'>
          <Dropdown
            className='JobDetails_controls_theme'
            label={'Theme'}
            type='select'
            name='JSONtheme'
            onChange={this.onChangeTheme}
          >
            {THEMES.map(({ value, label }) => (
              <DropdownItem key={value}>{label}</DropdownItem>
            ))}
          </Dropdown>
          <div className='JobDetails_controls_export'>
            <CopyToClipboard value={JSON.stringify(jobDetails)} />
            <span onClick={this.saveToFile}>
              <Download />
            </span>
          </div>
        </div>
        <JSONTree data={responses} theme={theme} shouldExpandNode={() => true} />
      </div>
    );
  }
}
