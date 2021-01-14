import React from 'react';
import { Pivots, ProgressBar } from '@ux/uxcore2';
import { withLocaleRequired } from '@gasket/intl';
import { FormattedMessage } from 'react-intl';
import Head from '../components/head';
import InputForm from '../components/InputForm';
import getJobs from '../api/getJobs';
import createJob from '../api/createJob';

export const IndexPage = () => (
  <div className='container m-t-3'>
    <Head title='Home'/>
    <div className='row'>
      <div className='card ux-card'>
        <InputForm />

      </div>
    </div>
  </div>
);

export default withLocaleRequired('threat-ui-tenet')(IndexPage);
