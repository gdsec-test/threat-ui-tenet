import React, { Fragment } from 'react';
import { Table, Pagination, Spinner } from '@ux/uxcore2';
import Link from 'next/link';
import getJobs from '../api/getJobs';

export default class JobList extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      isLoading: true,
      pageSelected: 1,
      pageItems: 5,
      jobsList: []
    };
    this.renderRows = this.renderRows.bind(this);
  }

  componentDidMount() {
    getJobs().then(jobsList => {
      this.setState({
        isLoading: false,
        jobsList: jobsList instanceof Array ? jobsList : []
      });
    });
  }

  renderRows() {
    const { jobsList, pageSelected, pageItems } = this.state;
    const start = (pageSelected - 1) * pageItems;
    const end = start + pageItems;
    return jobsList.slice(start, end).map(id => {
      const row = {};
      row.id = (
        <td key='id'>
          <Link href={`/job/${id}`}>
            <a>{id}</a>
          </Link>
        </td>
      );
      return row;
    });
  }

  render() {
    const { jobsList, isLoading, pageItems } = this.state;
    if (isLoading) {
      return <Spinner inline size='lg' />;
    }
    return (
      <Fragment>
        <Table
          className='table table-hover table-striped'
          data={this.renderRows()}
          order='id'
          sortable={true}
        >
          <thead>
            <tr>
              <th column='id'>{'Job ID'}</th>
            </tr>
          </thead>
        </Table>
        <Pagination
          defaultSelected={1}
          onChange={(pageSelected, pageItems) => {
            this.setState({ pageSelected, pageItems });
          }}
          pageItems={pageItems}
          size={'sm'}
          totalItems={jobsList.length}
          maxPageLinks={10}
        />
      </Fragment>
    );
  }
}
