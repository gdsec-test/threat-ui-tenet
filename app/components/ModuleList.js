import React from 'react';
import { Table } from 'evergreen-ui';
import getModules from '../api/getModules';
import { withRouter } from 'next/router';
import Loader from './common/Loader';
import '@ux/icon/chevron-down-lt/index.css';
import '@ux/icon/x/index.css';

const COLUMNS = {
  MODULE: { name: 'Module', id: 'module' },
  DOMAIN: { name: 'Domain', id: 'domain' },
  URL: { name: 'URL', id: 'url' },
  IP: { name: 'IP', id: 'ip' },
  EMAIL: { name: 'Email', id: 'email' },
  MD5: { name: 'MD5', id: 'md5' },
  SHA1: { name: 'SHA1', id: 'sha1' },
  SHA256: { name: 'SHA256', id: 'sha256' },
  SHA512: { name: 'SHA512', id: 'sha512' },
  CVE: { name: 'CVE', id: 'cve' },
  HOSTNAME: { name: 'GoDaddy Hostname', id: 'hostname' },
  GODADDY_USERNAME: { name: 'GoDaddy Username', id: 'godaddyusername' },
  AWSHOSTNAME: { name: 'AWS Hostname', id: 'awshostname' }
};

class ModuleList extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      modulesList: [],
      tableModulesList: []
    };
    this.renderHead = this.renderHead.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.getModules = this.getModules.bind(this);
  }

  getModules() {
    this.setState({
      isLoading: true
    });
    getModules().then((modulesListData) => {
      const modulesList = modulesListData instanceof Array ? modulesListData : [];
      this.setState(
        {
          isLoading: false,
          modulesList,
          tableModulesList: modulesList.slice()
        },
        () => {}
      );
    });
  }

  componentDidMount() {
    this.getModules();
  }

  renderHead() {
    return (
      <Table.Head className='JobList_head'>
        <Table.TextHeaderCell className='JobList_head_cell' width={150} flex='none'>
          {COLUMNS.MODULE.name}
        </Table.TextHeaderCell>
        <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.DOMAIN.name}</Table.TextHeaderCell>
        <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.URL.name}</Table.TextHeaderCell>
        <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.IP.name}</Table.TextHeaderCell>
        <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.EMAIL.name}</Table.TextHeaderCell>
        <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.CVE.name}</Table.TextHeaderCell>
        <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.MD5.name}</Table.TextHeaderCell>
        <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.SHA1.name}</Table.TextHeaderCell>
        <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.SHA256.name}</Table.TextHeaderCell>
        <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.SHA512.name}</Table.TextHeaderCell>
        <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.HOSTNAME.name}</Table.TextHeaderCell>
        <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.GODADDY_USERNAME.name}</Table.TextHeaderCell>
        <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.AWSHOSTNAME.name}</Table.TextHeaderCell>
      </Table.Head>
    );
  }

  renderRow({
    module,
    domain,
    url,
    ip,
    email,
    cve,
    md5,
    sha1,
    sha256,
    sha512,
    hostname,
    godaddyusername,
    awshostname
  }) {
    return (
      <Table.Row key={module} className='JobList_row' width={150} flex='none'>
        <Table.Cell className='JobList_id' width={150} flex='none'>
          {module}
        </Table.Cell>
        <Table.TextCell>{domain}</Table.TextCell>
        <Table.TextCell>{url}</Table.TextCell>
        <Table.TextCell>{ip}</Table.TextCell>
        <Table.TextCell>{email}</Table.TextCell>
        <Table.TextCell>{cve}</Table.TextCell>
        <Table.TextCell>{md5}</Table.TextCell>
        <Table.TextCell>{sha1}</Table.TextCell>
        <Table.TextCell>{sha256}</Table.TextCell>
        <Table.TextCell>{sha512}</Table.TextCell>
        <Table.TextCell>{hostname}</Table.TextCell>
        <Table.TextCell>{godaddyusername}</Table.TextCell>
        <Table.TextCell>{awshostname}</Table.TextCell>
      </Table.Row>
    );
  }

  render() {
    const { tableModulesList, isLoading } = this.state;
    if (isLoading) {
      return <Loader inline size='lg' text='Loading module information...' />;
    }

    return (
      <div className='JobList'>
        <p>IOCs currently supported by Threat API modules: </p>
        <Table border>
          {this.renderHead()}
          <Table.VirtualBody height={640}>{tableModulesList.map((item) => this.renderRow(item))}</Table.VirtualBody>
        </Table>
      </div>
    );
  }
}

export default withRouter(ModuleList);
