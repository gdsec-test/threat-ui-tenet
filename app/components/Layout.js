import React from 'react';
import Head from '../components/head';
import Link from 'next/link';
import { Button } from '@ux/uxcore2';
import { withLocaleRequired } from '@gasket/intl';

export const Layout = ({ children, links = [] }) => (
  <div className='container m-t-3'>
    <Head title='Home' />
    <div className='row'>
      <div className='card ux-card p-3'>
        <a target='_blank' rel='noreferrer' href='https://github.com/gdcorp-infosec/threat-api/blob/main/docs/USAGE.md'>
          Threat API Docs
        </a>
        <div className='p-3'>
          {links.map(({ url, caption }) => (
            <Link key={url} href={url}>
              <Button design='secondary' className='m-3'>
                {caption}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
    <div className='row'>
      <div className='card ux-card'>{children}</div>
    </div>
  </div>
);

export default withLocaleRequired('threat-ui-tenet')(Layout);
