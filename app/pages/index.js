import React from 'react';
import { Pivots, ProgressBar } from '@ux/uxcore2';
import { withLocaleRequired } from '@gasket/intl';
import { FormattedMessage } from 'react-intl';
import Head from '../components/head';

const pivotList = [
  {
    title: <FormattedMessage id='learn_gasket' />,
    href: 'https://gxsys.uxp.int.godaddy.com/pages/engineers/gasket/overview',
    graphic: (<span className='uxicon uxicon-star'/>),
    subtitle: <FormattedMessage id='learn_gasket_subtitle' />
  },
  {
    title: <FormattedMessage id='learn_uxcore2' />,
    subtitle: <FormattedMessage id='learn_uxcore2_subtitle' />,
    href: 'https://gxsys.uxp.int.godaddy.com',
    graphic: (<span className='uxicon uxicon-magnifying-glass'/>)
  },
  {
    title: <FormattedMessage id='learn_nextjs' />,
    subtitle: <FormattedMessage id='learn_nextjs_subtitle' />,
    href: 'https://github.com/zeit/next.js#getting-started',
    graphic: (<span className='uxicon uxicon-drop-right'/>)
  },
  {
    title: <FormattedMessage id='gasket_support' />,
    subtitle: <FormattedMessage id='gasket_support_subtitle' values={ ({
      gasket: (<code>@gasket</code>),
      gasketChannel: (<code>#gasket-support</code>)
    }) } />,
    href: 'https://godaddy.slack.com/messages/CABCTNQ5P/',
    graphic: (<span className='uxicon uxicon-help'/>)
  }
];

export const IndexPage = () => (
  <div className='container m-t-3'>
    <Head title='Home'/>
    <div className='row'>
      <div className='card ux-card'>

        <div className='card-title'>
          <h1 className='p-t-1'>Welcome to Threat UI!</h1>
          <p className='description'>To get started, edit <code>pages/index.js</code> and save to reload.</p>
        </div>

        <div className='card-block'>
          <Pivots pivotList={ pivotList } grid={ ({ md: 6 }) } />
        </div>

        <ProgressBar
          striped
          value={ 5 }
          max={ 7 }
          min={ 0 } />

      </div>
    </div>
  </div>
);

export default withLocaleRequired('threat-ui-tenet')(IndexPage);
