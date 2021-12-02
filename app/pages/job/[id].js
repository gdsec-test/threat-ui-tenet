import React from 'react';
import { withLocaleRequired } from '@gasket/react-intl';
import Layout from '../../components/Layout';
import JobDetails from '../../components/JobDetails';
import { useRouter } from 'next/router';

export const IndexPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <Layout
      links={[
        { url: '/', caption: 'Submit Job' },
        { url: '/jobs', caption: 'Jobs List' }
      ]}
    >
      <JobDetails id={id} />
    </Layout>
  );
};

export default withLocaleRequired('/locales', { initialProps: true })(IndexPage);
