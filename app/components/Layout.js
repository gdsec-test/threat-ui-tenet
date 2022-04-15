import { withLocaleRequired } from '@gasket/react-intl';
import Arrow from '@ux/icon/link-arrow';
import '@ux/icon/link-arrow/index.css';
import { Button } from '@ux/uxcore2';
import Link from 'next/link';
import { withRouter } from 'next/router';
import React from 'react';
import Head from '../components/head';

const ALL_NAVIGATION_LINKS = [
  { url: '/', caption: 'Submit Job' },
  { url: '/jobs', caption: 'Jobs List' },
  { url: '/modules', caption: 'Modules' },
  { url: '/vulnwatch', caption: 'Vulnerability Watch' },
  { url: '/forensicstorage', caption: 'Forensic Storage' }
];

export const Layout = ({ children, router }) => {
  return <div className='Layout container m-t-3'>
    <Head title='Home' />
    <div className='row'>
      <div className='Layout_Navigation card ux-card'>
        <Button className='Layout_Navigation_Back Layout_Navigation_Button' onClick={() => router.back()}>
          <Arrow />
        </Button>
        {ALL_NAVIGATION_LINKS.filter(({url}) => { return url !== router.route; }).map(({ url, caption }) => (
          <Link key={url} href={url}>
            <Button className='Layout_Navigation_Button'>{caption}</Button>
          </Link>
        ))}
      </div>
    </div>
    <div className='row'>
      <div className='card ux-card'>{children}</div>
    </div>
  </div>
};

export default withLocaleRequired()(withRouter(Layout));
