import React from 'react';
import Head from '../components/head';
import Link from 'next/link';
import { withLocaleRequired } from '@gasket/intl';

export const Layout = ({ children, links = [] }) => (
  <div className='container m-t-3'>
    <Head title='Home' />
    <div className='row'>
      <div className='card ux-card'>
        {children}
        <ul>
          {links.map(({ url, caption }) => (
            <li>
              <Link href={url}>
                <a>{caption}</a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default withLocaleRequired('threat-ui-tenet')(Layout);