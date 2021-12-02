import React from 'react';
import { withLocaleRequired } from '@gasket/react-intl';
import Layout from '../components/Layout';
import JobList from '../components/JobList';

export const IndexPage = () => (
  <Layout links={[{ url: '/', caption: 'Submit Job' }]}>
    <JobList />
  </Layout>
);

export default withLocaleRequired('/locales', { initialProps: true })(IndexPage);
