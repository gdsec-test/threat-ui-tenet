import { withLocaleRequired } from '@gasket/react-intl';
import { useRouter } from 'next/router';
import React from 'react';
import JobDetails from '../../components/JobDetails';
import Layout from '../../components/Layout';

export const IndexPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <Layout>
      <JobDetails id={id} />
    </Layout>
  );
};

export default withLocaleRequired('/locales', { initialProps: true })(IndexPage);
