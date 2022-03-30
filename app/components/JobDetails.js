import '@ux/icon/clipboard/index.css';
import Download from '@ux/icon/download';
import '@ux/icon/download/index.css';
import { Dropdown, Table } from '@ux/uxcore2';
import React from 'react';
import JSONTree from 'react-json-tree';
import getJob from '../api/getJob';
import { THEMES } from '../utils/const';
import { expandData, formatData, parseData, badnessFormatter } from '../utils/dataFormatters';
import CopyToClipboard from './common/CopyToClipboard';
import Loader from './common/Loader';
import RenderError from './common/RenderError';
const { DropdownItem } = Dropdown;
const customError = "Error during rendering theme. Please, switch to another theme"

class JobDetails extends React.Component {
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
      jobDetails = parseData(jobDetails);
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
    const { jobDetails } = this.state;
    const {
      submission: {
        metadata: { tags = [] }
      }
    } = jobDetails;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(jobDetails, null, 2)], {
        type: 'text/plain'
      })
    );
    a.setAttribute('download', `${tags.join(',')}.json`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  render() {
    const { jobDetails, isLoading, theme } = this.state;
    if (isLoading) {
      return <Loader inline size='lg' text='Loading job details...' />;
    }
    const {
      submission: {
        iocType,
        iocs,
        metadata: { tags = [] }
      }
    } = jobDetails;
    /* eslint-disable */
    const { responses, startTime, jobStatus, jobPercentage, submission, badness = [] } = jobDetails;
    let badnessScore = badnessFormatter(badness);
    badnessScore = <td className='JobDetails_badness'>{badnessScore}</td>
    let dateTime = new Date(startTime * 1000);
    return (
      <div className='JobDetails'>
        <Table
          className='JobDetails_Primary_Form table table-hover'
          data={[
            { name: 'Status', value: jobStatus },
            { name: 'Badness', value: badnessScore },
            { name: 'Tags', value: tags.join(', ') },
            { name: 'Progress', value: Math.round(jobPercentage) + '%' },
            { name: 'Started on', value: dateTime.toString() },
            { name: 'Input', value: `${iocType}: ${iocs.join(', ')}` }
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
        <JSONTree
          data={responses}
          theme={theme}
          labelRenderer={(keyPath) => <b>{keyPath[0]}</b>}
          valueRenderer={formatData}
          shouldExpandNode={expandData}
        />
      </div>
    );
  }
}

export default RenderError(JobDetails, customError);