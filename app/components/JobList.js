import React, { Fragment } from 'react';
import { Tooltip } from '@ux/uxcore2';
import ChevronDown from '@ux/icon/chevron-down-lt';
import Cross from '@ux/icon/x';
import { Table } from 'evergreen-ui';
import getJobs from '../api/getJobs';
import { JOB_STATUS } from '../utils/const';
import { withRouter } from 'next/router';
import Loader from './common/Loader';
import CopyToClipboard from './common/CopyToClipboard';
import '@ux/icon/chevron-down-lt/index.css';
import '@ux/icon/x/index.css';

const updateInterval = 60000;

const COLUMNS = {
  ID: { name: 'Id', id: 'id' },
  TAGS: { name: 'Tags', id: 'tags' },
  STATUS: { name: 'Status', id: 'status' },
  MODULES: { name: 'Modules', id: 'modules' },
  TIMESTAMP: { name: 'Date/Time', id: 'timestamp' }
};

const SORT = {
  ASC: 'ASC',
  DESC: 'DESC'
};

const intervalIds = {};

class JobList extends React.Component {
  constructor() {
    super(...arguments);
    const max = Math.round(updateInterval / 1000);
    this.state = {
      isLoading: true,
      pageSelected: 1,
      pageItems: 5,
      jobsList: [],
      tableJobsList: [],
      sortBy: {},
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

  getJobs() {
    this.setState({
      isLoading: true
    });
    getJobs().then((jobsListData) => {
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

  componentDidMount() {
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

  componentWillUnmount() {
    Object.values(intervalIds).forEach((id) => clearInterval(id));
  }

  renderHead() {
    const getSortableButton = ({ id: columnId, name }, columnWidth) => {
      const { sortBy } = this.state;
      const isActive = sortBy[columnId] ? 'JobList_head_cell_active' : '';
      const sortByType = this.state.sortBy[columnId] || SORT.ASC;
      const isDown = sortByType === SORT.DESC ? '' : 'JobList_sortButton_rotated';
      return (
        <Table.TextHeaderCell
          width={columnWidth + (isActive ? 20 : 0)}
          flex='none'
          className={`JobList_head_cell JobList_head_cell_sortable ${isActive}`}
          onClick={() => {
            const newSortByType = sortByType === SORT.DESC ? SORT.ASC : SORT.DESC;
            this.sortBy(columnId, newSortByType);
          }}
        >
          {name}
          <ChevronDown className={`JobList_sortButton ${isDown}`} />
        </Table.TextHeaderCell>
      );
    };
    return (
      <Table.Head className='JobList_head'>
        <Table.TextHeaderCell className='JobList_head_cell' width={100} flex='none'>
          {COLUMNS.ID.name}
        </Table.TextHeaderCell>
        <Table.SearchHeaderCell
          className='JobList_head_cell'
          placeholder='Search by tags'
          onChange={this.handleTagsFilterChange}
          value={this.state.filterBy.searchTagsQuery}
        />
        {getSortableButton(COLUMNS.TIMESTAMP, 220)}
        {getSortableButton(COLUMNS.STATUS, 100)}
        <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.MODULES.name}</Table.TextHeaderCell>
      </Table.Head>
    );
  }

  renderRow({ id, tags, status, modules, timestamp }) {
    const { router } = this.props;
    return (
      <Table.Row key={id} className='JobList_row' isSelectable onSelect={() => router.push(`/job/${id}`)}>
        <Table.Cell className='JobList_id' width={100} flex='none'>
          <CopyToClipboard value={`${location.origin}/job/${id}`} />
          {id}
        </Table.Cell>
        <Table.Cell display='flex' alignItems='center'>
          <a> {tags.join(', ')}</a>
        </Table.Cell>
        <Table.TextCell width={220} flex='none'>
          {new Date(timestamp * 1000).toUTCString()}
        </Table.TextCell>
        <Table.TextCell width={100} flex='none' className={`${status === JOB_STATUS.PENDING ? 'pending' : ''}`}>
          {status}
        </Table.TextCell>
        <Table.Cell className='JobList_modules' display='flex' alignItems='center'>
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

  getUrlQueryParams() {
    const {
      router: {
        query: { jobIds }
      }
    } = this.props;
    return { jobIds: jobIds ? jobIds.split(',') : [] };
  }

  sortBy(columnId, sortByType) {
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

  applyFilters() {
    const {
      filterBy: { searchTagsQuery, jobIds },
      jobsList
    } = this.state;
    let tableJobsList = jobsList.slice();
    const formattedQuery = (searchTagsQuery || '')
      .replaceAll(' ', ',')
      .split(',')
      .filter((item) => item);
    if (jobIds && jobIds.length) {
      tableJobsList = tableJobsList.filter(({ id }) => jobIds.indexOf(id) >= 0);
    } else if (this.getUrlQueryParams().jobIds.length) {
      const { router } = this.props;
      // we need to clean up URL from jobs if any
      router.push(`/jobs`);
    }
    if (formattedQuery.length) {
      tableJobsList = tableJobsList.filter(({ tags }) =>
        tags.find((tag) => formattedQuery.find((query) => tag.indexOf(query) >= 0))
      );
    }
    this.setState(
      {
        tableJobsList
      },
      () => {
        Object.keys(this.state.sortBy).forEach((columnId) => {
          this.sortBy(columnId, this.state.sortBy[columnId]);
        });
      }
    );
  }

  handleTagsFilterChange(searchTagsQuery) {
    const { filterBy } = this.state;
    this.setState(
      {
        filterBy: { ...filterBy, searchTagsQuery }
      },
      () => this.applyFilters()
    );
  }

  render() {
    const {
      tableJobsList,
      isLoading,
      filterBy,
      jobsRefresh: { max, progress }
    } = this.state;
    if (isLoading) {
      return <Loader inline size='lg' text='Jobs are refreshing...' />;
    }
    const filterByNames = Object.keys(filterBy).filter((filter) => filterBy[filter].length);
    return (
      <div className='JobList'>
        {filterByNames.length ? (
          <div className='JobList_filter_list'>
            <div>
              {filterByNames.map((filter) => {
                let filterValue = filterBy[filter];
                filterValue =
                  filterValue instanceof Array
                    ? filterValue.map((s) => s.substring(0, 6) + '...').join(',')
                    : filterValue.toString();
                return (
                  <span className='JobList_filter' key={filter}>
                    {`${filter}: ${filterValue}`}
                    <Cross
                      onClick={() => {
                        const filterBy = { ...this.state.filterBy };
                        delete filterBy[filter];
                        this.setState({ filterBy }, () => this.applyFilters());
                      }}
                      width={'1em'}
                      height={'1em'}
                    />
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}
        <div>{`Jobs will refresh in ${max - progress} sec`}</div>
        <Table border>
          {this.renderHead()}
          <Table.VirtualBody height={640}>{tableJobsList.map((item) => this.renderRow(item))}</Table.VirtualBody>
        </Table>
      </div>
    );
  }
}

export default withRouter(JobList);
