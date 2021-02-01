import React from 'react';
import { withLocaleRequired } from '@gasket/intl';
import Layout from '../components/Layout';
import JobList from '../components/JobList';

export const IndexPage = () => (
  <Layout links={[{ url: '/', caption: 'Submit Job' }]}>
    <JobList />
  </Layout>
);

export default withLocaleRequired('threat-ui-tenet')(IndexPage);
