import React from 'react';
import { Table, Dropdown } from '@ux/uxcore2';
import Clipboard from '@ux/icon/clipboard';
import Download from '@ux/icon/download';
import { Tooltip } from 'evergreen-ui';
import getJob from '../api/getJob';
import { THEMES } from '../utils/const';
import JSONTree from 'react-json-tree';
import ReactJson from 'react-json-view';
import Loader from './common/Loader';
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
    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.saveToFile = this.saveToFile.bind(this);
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

  async copyToClipboard() {
    const { jobDetails } = this.state;
    try {
      await navigator.clipboard.writeText(JSON.stringify(jobDetails));
      this.setState({ isShowCopyTooltip: <span style={{ color: 'green' }}>Copied to Clipboard</span> });
    } catch (err) {
      this.setState({ isShowCopyTooltip: <span style={{ color: 'red' }}>Failed to copy to clipboard!</span> });
    }
    setTimeout(() => this.setState({ isShowCopyTooltip: false }), 1000);
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
    const { jobDetails, isLoading, theme, isShowCopyTooltip } = this.state;
    if (isLoading) {
      return <Loader inline size='lg' />;
    }
    /* eslint-disable */
    const { responses, start_time, job_status, job_percentage, request } = jobDetails;
    let dateTime = new Date(start_time * 1000);
    return (
      <div className='JobDetails'>
        <Table
          className='table table-hover'
          data={[
            { name: 'Status', value: job_status },
            { name: 'Progress', value: job_percentage },
            { name: 'Started on', value: dateTime.toString() },
            { name: 'Input', value: request }
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
          <Tooltip appearance='card' content={isShowCopyTooltip} isShown={!!isShowCopyTooltip}>
            <div className='JobDetails_controls_export'>
              <span onClick={this.copyToClipboard}>
                <Clipboard />
              </span>
              <span onClick={this.saveToFile}>
                <Download />
              </span>
            </div>
          </Tooltip>
        </div>
        <JSONTree data={responses} theme={theme} shouldExpandNode={() => true} />
        <ReactJson src={responses} theme={theme} displayDataTypes={false} />
      </div>
    );
  }
}
