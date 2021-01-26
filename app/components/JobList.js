import React, { Fragment } from 'react';
import { Spinner, Tooltip } from '@ux/uxcore2';
import ChevronDown from '@ux/icon/chevron-down-lt';
import { Table } from 'evergreen-ui';
import getJobs from '../api/getJobs';
import { JOB_STATUS } from '../utils/const';
import { withRouter } from 'next/router';
import '@ux/icon/chevron-down-lt/index.css';

const COLUMNS = {
  ID: { name: 'Id', id: 'id' },
  TAGS: { name: 'Tags', id: 'tags' },
  STATUS: { name: 'Status', id: 'status' },
  MODULES: { name: 'Modules', id: 'modules' },
  TIMESTAMP: { name: 'Date\\Time', id: 'timestamp' }
};

const SORT = {
  ASC: 'ASC',
  DESC: 'DESC'
};
class JobList extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      isLoading: true,
      pageSelected: 1,
      pageItems: 5,
      jobsList: [],
      tableJobsList: [],
      sortBy: {}
    };
    this.renderHead = this.renderHead.bind(this);
    this.handleTagsFilterChange = this.handleTagsFilterChange.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentDidMount() {
    getJobs().then((jobsListData) => {
      const jobsList = jobsListData instanceof Array ? jobsListData : [];
      this.setState({
        isLoading: false,
        jobsList,
        tableJobsList: jobsList.slice()
      });
    });
  }

  renderHead() {
    const getSortableButton = ({ id: columnId, name }, columnWidth) => {
      const { sortBy, tableJobsList } = this.state;
      const isActive = sortBy[columnId] ? 'JobList_head_cell_active' : '';
      const sortByType = this.state.sortBy[columnId] || SORT.ASC;
      const isDown = sortByType === SORT.DESC ? '' : 'JobList_sortButton_rotated';
      return (
        <Table.TextHeaderCell
          width={columnWidth + (isActive ? 20 : 0)}
          flex='none'
          className={`JobList_head_cell JobList_head_cell_sortable ${isActive}`}
        >
          {name}
          <span
            onClick={() => {
              const newSortByType = sortByType === SORT.DESC ? SORT.ASC : SORT.DESC;
              this.setState({
                sortBy: { [columnId]: newSortByType },
                tableJobsList: tableJobsList.slice().sort((job1, job2) => {
                  if (newSortByType === SORT.ASC) {
                    return job1[columnId] >= job2[columnId] ? 1 : -1;
                  }
                  return job1[columnId] <= job2[columnId] ? 1 : -1;
                })
              });
            }}
            className={`JobList_sortButton ${isDown}`}
          >
            <ChevronDown />
          </span>
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
          value={this.state.searchTagsQuery}
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
          {id}
        </Table.Cell>
        <Table.Cell display='flex' alignItems='center'>
          <a> {tags.join(', ')}</a>
        </Table.Cell>
        <Table.TextCell width={220} flex='none'>
          {new Date(timestamp).toUTCString()}
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

  handleTagsFilterChange(searchTagsQuery) {
    const { jobsList } = this.state;
    if (!searchTagsQuery) {
      this.setState({
        tableJobsList: this.state.jobsList.slice(),
        searchTagsQuery: null
      });
      return;
    }
    const formattedQuery = (searchTagsQuery || '')
      .replaceAll(' ', ',')
      .split(',')
      .filter((item) => item);
    this.setState({
      tableJobsList: jobsList.filter(({ tags }) =>
        tags.find((tag) => formattedQuery.find((query) => tag.indexOf(query) >= 0))
      ),
      searchTagsQuery
    });
  }

  render() {
    const { tableJobsList, isLoading } = this.state;
    if (isLoading) {
      return <Spinner inline size='lg' />;
    }

    return (
      <div className='JobList'>
        <Table border>
          {this.renderHead()}
          <Table.VirtualBody height={640}>{tableJobsList.map((item) => this.renderRow(item))}</Table.VirtualBody>
        </Table>
      </div>
    );
  }
}

export default withRouter(JobList);
