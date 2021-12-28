import React from 'react';
import Layout from '../components/Layout';
import ModuleList from '../components/ModuleList';

export const IndexPage = () => (
  <Layout
    links={[
      { url: '/', caption: 'Submit Job' },
      { url: '/jobs', caption: 'Jobs List' },
      { url: '/modules', caption: 'Modules' }
    ]}
  >
    <ModuleList />
  </Layout>
);

export default IndexPage;
