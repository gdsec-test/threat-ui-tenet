import React from 'react';
import Head from '../components/head';
import Link from 'next/link';
import { Button } from '@ux/uxcore2';
import { withLocaleRequired } from '@gasket/react-intl';
import { withRouter } from 'next/router';
import Arrow from '@ux/icon/link-arrow';
import '@ux/icon/link-arrow/index.css';

export const Layout = ({ children, links = [], router }) => (
  <div className='Layout container m-t-3'>
    <Head title='Home' />
    <div className='row'>
      <div className='Layout_Navigation card ux-card'>
        <Button className='Layout_Navigation_Back Layout_Navigation_Button' onClick={() => router.back()}>
          <Arrow />
        </Button>
        {links.map(({ url, caption }) => (
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
);

export default withLocaleRequired()(withRouter(Layout));
