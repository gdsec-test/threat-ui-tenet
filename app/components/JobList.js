import React, { Fragment } from 'react';
import { Table } from '@ux/uxcore2';
import Link from 'next/link';
import getJobs from '../api/getJobs';

export default class JobList extends React.Component {
  constructor () {
    super(...arguments);
    this.state = {
      isLoading: true,
      jobsList: []
    }
    this.renderRows = this.renderRows.bind(this);
  }

  componentDidMount() {
    getJobs().then(jobsList=> {
      this.setState({
        isLoading: false,
        jobsList
      });
    });
  }

  renderRows() {
    const {
      jobsList
    } = this.state;
    return jobsList.map(id => {
      const row = {};
      row.id = <td key='id'>
        <Link href={`/job/${id}`}>
          <a>{id}</a>
        </Link>
      </td>;
      return row;
    });
  }

  render () {
    const {
      jobsList,
      isLoading
    } = this.state;
    if (isLoading) {
      return <div>Is Loading........</div>;
    }
    return (
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
    )
  }
}
