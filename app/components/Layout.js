import { withLocaleRequired } from '@gasket/react-intl';
import Arrow from '@ux/icon/link-arrow';
import '@ux/icon/link-arrow/index.css';
import { Button, Modal } from '@ux/uxcore2';
import Link from 'next/link';
import { withRouter } from 'next/router';
import React, { useState } from 'react';
import JSONTree from 'react-json-tree';
import startVulnerabilityWatch from '../api/startVulnerabilityWatch';
import Head from '../components/head';
import { expandData, formatData } from '../utils/dataFormatters';
import Loader from './common/Loader';

export const Layout = ({ children, links = [], router }) => {
  const [showVulnModal, toggleVulnModal] = useState(false);
  const [report, setReport] = useState(null);
  return <div className='Layout container m-t-3'>
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
        <Button className='Layout_Navigation_Button' onClick={() => {
          toggleVulnModal(true);
          startVulnerabilityWatch().then((watchReport) => {
            setReport(watchReport);
          }).catch(err => {
            setReport(err);
          });
          }}>
          Start Vuln Scanner
        </Button>
      </div>
    </div>
    <div className='row'>
      <div className='card ux-card'>{children}</div>
    </div>
    {showVulnModal && 
      <Modal  title='Vulnerability Watch Report' onClose={ () => {
        toggleVulnModal(false);
        setReport(null);
        }}>
      {report ? 
      <JSONTree
          data={report}
          theme={'monokai'}
          labelRenderer={(keyPath) => <b>{keyPath[0]}</b>}
          valueRenderer={formatData}
          shouldExpandNode={expandData}
        /> : 
        <Loader inline size='lg' text='Loading report...' />
      }
      </Modal>
    }
  </div>
};

export default withLocaleRequired()(withRouter(Layout));
