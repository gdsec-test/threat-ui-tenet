import React from 'react';
import InputForm from '../components/InputForm';
import Layout from '../components/Layout';

export const IndexPage = () => (
  <Layout links={[{ url: '/jobs', caption: 'Jobs List' }]}>
    <InputForm />
  </Layout>
);

export default IndexPage;
