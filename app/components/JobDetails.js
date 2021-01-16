import React, { Fragment } from 'react';
import getJob from '../api/getJob';

export default class JobDetails extends React.Component {
  constructor () {
    super(...arguments);
    this.state = {
      isLoading: true
    }
  }

  componentDidMount() {
    const {
      id
    } = this.props;
    getJob(id).then(jobDetails => {
      this.setState({
        isLoading: false,
        jobDetails
      });
    });
  }


  render() {
    const {
      id
    } = this.props;
    const {
      jobDetails,
      isLoading
    } = this.state;
    if (isLoading) {
      return <div>Is Loading........</div>;
    }
    return <div><div>JOB RESULTS
      </div>
      <div>{JSON.stringify(jobDetails)}</div>
    </div>
  }
}