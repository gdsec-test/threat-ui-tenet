import React from 'react';
import { withLocaleRequired } from '@gasket/intl';
import Layout from '../components/Layout';


export const IndexPage = () => (
  <Layout links={[{ url: '/', caption: 'Go To Home' }]}>
    <div>My jobs go here</div>
  </Layout>
);

export default withLocaleRequired('threat-ui-tenet')(IndexPage);
