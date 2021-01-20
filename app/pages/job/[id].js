import React from 'react';
import { withLocaleRequired } from '@gasket/intl';
import Layout from '../../components/Layout';
import JobDetails from '../../components/JobDetails';
import { useRouter } from 'next/router';

export const IndexPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return <Layout links={[
    { url: '/', caption: 'Go Home'},
    { url: '/jobs', caption: 'See My Jobs List' }]}>
    <JobDetails id={id} />
  </Layout>
};

export default withLocaleRequired('threat-ui-tenet')(IndexPage);
