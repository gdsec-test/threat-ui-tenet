import ArrowDown from '@ux/icon/arrow-down';
import '@ux/icon/arrow-down/index.css';
import '@ux/icon/search/index.css';
import '@ux/icon/x/index.css';
import Search from '@ux/search';
import '@ux/search/dist/styles.css';
import '@ux/text-input/dist/styles.css';
import { Tooltip } from '@ux/uxcore2';
import { Table } from 'evergreen-ui';
import { withRouter } from 'next/router';
import React, { Fragment } from 'react';
import getJobs from '../api/getJobs';
import { JOB_STATUS } from '../utils/const';
import CopyToClipboard from './common/CopyToClipboard';
import Loader from './common/Loader';
import RenderError from './common/RenderError';

const updateInterval = 60000;

const COLUMNS = {
  ID: { name: 'ID', id: 'id', size: 200 },
  TAGS: { name: 'Tags', id: 'tags', size: 200 },
  STATUS: { name: 'Status', id: 'status', size: 100 },
  MODULES: { name: 'Modules', id: 'modules', size: 100 },
  TIMESTAMP: { name: 'Date/Time', id: 'timestamp', size: 220 }
};

const SORT = {
  ASC: 'ASC',
  DESC: 'DESC'
};

const intervalIds = {};

class JobList extends React.Component {
  constructor () {
    super(...arguments);
    const max = Math.round(updateInterval / 1000);
    this.state = {
      isLoading: true,
      pageSelected: 1,
      pageItems: 5,
      jobsList: [],
      tableJobsList: [],
      sortBy: {
        [COLUMNS.TIMESTAMP.id]: SORT.DESC
      },
      filterBy: {},
      jobsRefresh: {
        max,
        step: 1,
        progress: 0
      }
    };
    this.renderHead = this.renderHead.bind(this);
    this.handleTagsFilterChange = this.handleTagsFilterChange.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.applyFilters = this.applyFilters.bind(this);
    this.sortBy = this.sortBy.bind(this);
    this.getJobs = this.getJobs.bind(this);
  }

  getJobs () {
    this.setState({
      isLoading: true
    });
    getJobs().then(jobsListData => {
      const jobsList = jobsListData instanceof Array ? jobsListData : [];
      const { jobIds } = this.getUrlQueryParams();
      this.setState(
        {
          isLoading: false,
          jobsList,
          tableJobsList: jobsList.slice(),
          filterBy: { ...this.state.filterBy, jobIds },
          jobsRefresh: { ...this.state.jobsRefresh, progress: 0 }
        },
        () => {
          this.applyFilters();
        }
      );
    });
  }

  componentDidMount () {
    const {
      jobsRefresh: { step }
    } = this.state;
    this.getJobs();
    intervalIds.jobs = setInterval(this.getJobs, updateInterval);
    intervalIds.progress = setInterval(() => {
      const {
        jobsRefresh: { progress }
      } = this.state;
      this.setState({ jobsRefresh: { ...this.state.jobsRefresh, progress: progress + 1 } });
    }, step * 1000);
  }

  componentWillUnmount () {
    Object.values(intervalIds).forEach(id => clearInterval(id));
  }

  renderHead () {
    const getSortableHeader = ({ id: columnId, name }, columnWidth) => {
      const { sortBy } = this.state;
      const isActive = sortBy[columnId] ? 'JobList_head_cell_active' : '';
      const sortByType = this.state.sortBy[columnId] || SORT.ASC;
      const isDown = sortByType === SORT.DESC ? '' : 'JobList_sortButton_rotated';
      return (
        <Table.TextHeaderCell
          width={columnWidth}
          flex='none'
          className={`JobList_head_cell JobList_head_cell_sortable ${isActive}`}
          onClick={() => {
            const newSortByType = sortByType === SORT.DESC ? SORT.ASC : SORT.DESC;
            this.sortBy(columnId, newSortByType);
          }}
        >
          <div
            className={`${columnId === COLUMNS.TIMESTAMP.id ? 'JobList_head_cell_right' : 'JobList_head_cell_center'}`}
          >
            <ArrowDown width={20} height={20} className={`JobList_sortButton ${isDown}`} />
            {name}
          </div>
        </Table.TextHeaderCell>
      );
    };
    return (
      <Table.Head className='JobList_head'>
        <Table.TextHeaderCell className='JobList_head_cell' width={COLUMNS.ID.size} flex='none'>
          {COLUMNS.ID.name}
        </Table.TextHeaderCell>
        <Table.TextHeaderCell className='JobList_head_cell' width={COLUMNS.TAGS.size} flex='none'>
          {COLUMNS.TAGS.name}
        </Table.TextHeaderCell>
        {getSortableHeader(COLUMNS.TIMESTAMP, COLUMNS.TIMESTAMP.size)}
        {getSortableHeader(COLUMNS.STATUS, COLUMNS.STATUS.size)}
        <Table.TextHeaderCell className='JobList_head_cell' width={COLUMNS.MODULES.size}>
          {COLUMNS.MODULES.name}
        </Table.TextHeaderCell>
      </Table.Head>
    );
  }

  renderRow ({ id, tags, status, modules, timestamp, jobPercentage }) {
    const { router } = this.props;
    return (
      <Table.Row key={id} className='JobList_row' isSelectable onSelect={() => router.push(`/job/${id}`)}>
        <Table.Cell className='JobList_id' width={COLUMNS.ID.size} flex='none'>
          <CopyToClipboard value={`${location.origin}/job/${id}`} />
          {id}
        </Table.Cell>
        <Table.Cell flex='none' width={COLUMNS.TAGS.size} alignItems='center'>
          <a> {tags.join(', ')}</a>
        </Table.Cell>
        <Table.TextCell width={COLUMNS.TIMESTAMP.size} flex='none'>
          {new Date(timestamp * 1000).toUTCString()}
        </Table.TextCell>
        <Table.TextCell
          width={COLUMNS.STATUS.size}
          flex='none'
          className={`${status === JOB_STATUS.PENDING ? 'pending' : 'is_done'}`}
        >
          {jobPercentage === 100 ? status : jobPercentage.toFixed(2) + '%'}
        </Table.TextCell>
        <Table.Cell className='JobList_modules' display='flex' alignItems='center' width={COLUMNS.MODULES.size}>
          <Tooltip
            id={id}
            hideClose={true}
            text={Object.keys(modules).join(', ')}
            message={
              <Fragment>
                {Object.entries(modules).map(([key, value]) => (
                  <div
                    className={`${value === JOB_STATUS.PENDING ? 'pending' : ''}`}
                    key={key}
                  >{`${key}:${value}`}</div>
                ))}
              </Fragment>
            }
            openOnHover={true}
            autoHideTimeout={1}
          ></Tooltip>
        </Table.Cell>
      </Table.Row>
    );
  }

  getUrlQueryParams () {
    const {
      router: {
        query: { jobIds }
      }
    } = this.props;
    return { jobIds: jobIds ? jobIds.split(',') : [] };
  }

  sortBy (columnId, sortByType) {
    const { tableJobsList } = this.state;
    const newTableJobsList = tableJobsList.slice();
    newTableJobsList.sort((job1, job2) => {
      if (sortByType === SORT.ASC) {
        return job1[columnId] >= job2[columnId] ? 1 : -1;
      }
      return job1[columnId] <= job2[columnId] ? 1 : -1;
    });
    this.setState({
      sortBy: { [columnId]: sortByType },
      tableJobsList: newTableJobsList
    });
  }

  applyFilters () {
    const {
      filterBy: { searchTagsQuery, jobIds },
      jobsList
    } = this.state;
    let tableJobsList = jobsList.slice();
    const formattedQuery = (searchTagsQuery || '')
      .replaceAll(' ', ',')
      .split(',')
      .filter(item => item)
      .map(item => item.toLowerCase());
    if (jobIds && jobIds.length) {
      tableJobsList = tableJobsList.filter(({ id }) => jobIds.indexOf(id) >= 0);
    } else if (this.getUrlQueryParams().jobIds.length) {
      const { router } = this.props;
      // we need to clean up URL from jobs if any
      router.push(`/jobs`);
    }
    if (formattedQuery.length) {
      tableJobsList = tableJobsList.filter(({ tags }) =>
        tags.find(tag => formattedQuery.find(query => tag.toLowerCase().indexOf(query) >= 0))
      );
    }
    this.setState(
      {
        tableJobsList
      },
      () => {
        Object.keys(this.state.sortBy).forEach(columnId => {
          this.sortBy(columnId, this.state.sortBy[columnId]);
        });
      }
    );
  }

  handleTagsFilterChange (searchTagsQuery) {
    const { filterBy } = this.state;
    this.setState(
      {
        filterBy: { ...filterBy, searchTagsQuery }
      },
      () => this.applyFilters()
    );
  }

  render () {
    const {
      tableJobsList,
      isLoading,
      jobsRefresh: { max, progress }
    } = this.state;
    if (isLoading) {
      return <Loader inline size='lg' text='Jobs are refreshing...' />;
    }
    return (
      <div className='JobList'>
        <div>
          <Search
            type='text'
            className='JobList_Search_Tags'
            placeholder='Search Tags'
            onChange={this.handleTagsFilterChange}
          />
          <span>{`Refreshing in ${max - progress} sec`}</span>
        </div>

        <Table border>
          {this.renderHead()}
          <Table.VirtualBody height={640}>{tableJobsList.map(item => this.renderRow(item))}</Table.VirtualBody>
        </Table>
      </div>
    );
  }
}

export default withRouter(RenderError(JobList));
