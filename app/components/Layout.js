import { withLocaleRequired } from '@gasket/react-intl';
import Arrow from '@ux/icon/link-arrow';
import '@ux/icon/link-arrow/index.css';
import { Button } from '@ux/uxcore2';
import Link from 'next/link';
import { withRouter } from 'next/router';
import React, { useEffect } from 'react';
import Head from '../components/head';

const ALL_NAVIGATION_LINKS = [
  { url: '/', caption: 'Submit Job' },
  { url: '/jobs', caption: 'Jobs' },
  { url: '/modules', caption: 'Modules' },
  { url: '/vulnwatch', caption: 'Vulnerability Watch' },
  { url: '/forensicstorage', caption: 'Forensic Storage' }
];

export const Layout = ({ children, router }) => {
  useEffect(() => {
    if (process.browser) {
      ux.header((err, header) => {
        if (err) return console.error(err); // handle this as you wish
        const menu = ALL_NAVIGATION_LINKS.filter(({ url }) => {
          return url !== router.route;
        }).map(({ url, caption }) => {
          return {
            caption: caption,
            href: url,
            eid: `${caption}.nav.home.click`,
            active: true
          };
        });
        //header.updateNavigationTop(<div>Resources</div>);
        header.updateNavHeading({
          text: 'Hello World'
        });
        header.updateSidebarNav(menu);
        header.onNavLinkClick(() => (key) => {
          return (evt) => {
            evt.preventDefault();
            router.push(evt.currentTarget.href);
            return false;
          }
        });
      });
    }
  }, [router]);
  const currentCaption = ALL_NAVIGATION_LINKS.find(link => link.url === router.route).caption;
  return (
    <div className='Layout container m-t-3'>
      <Head title='Home' />
      <div className='row'>
        <div className='Layout_Main_Content card ux-card'>
          <div className='Layout_Main_Caption'>{currentCaption}</div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default withLocaleRequired()(withRouter(Layout));
