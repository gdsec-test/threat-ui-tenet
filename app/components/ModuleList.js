/* eslint-disable react/jsx-key */
/* eslint-disable complexity */
import React, { Fragment } from 'react';
import { Table } from 'evergreen-ui';
// import getModules from '../api/getModules';
import getModulesListByIOCType from '../api/getModulesListByIOCType';
import { withRouter } from 'next/router';
import { IOC_TYPE, IOC_TYPE_DESC } from '../utils/const';
import Loader from './common/Loader';
import '@ux/icon/chevron-down-lt/index.css';
import '@ux/icon/x/index.css';

const colWidth = 150;

const COLUMNS = Object.values(IOC_TYPE).reduce((acc, ioctype) => {
  acc[ioctype.toUpperCase()] = { name: IOC_TYPE_DESC[ioctype].desc, id: ioctype };
  return acc;
}, {});
COLUMNS.MODULE = { name: 'Module', id: 'module' };

class ModuleList extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      modulesList: [],
      tableModulesList: [],
      currentlySupportedIOCs: []
    };
    this.renderHead = this.renderHead.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.getModulesListByIOCType = this.getModulesListByIOCType.bind(this);
  }

  getModulesListByIOCType() {
    this.setState({
      isLoading: true
    });
    getModulesListByIOCType().then((modulesListData) => {
      const modulesList = modulesListData;
      const mappedModules = [];
      for (const module in modulesList) {
        if (module) {
          mappedModules.push({
            module,
            domain: modulesList[module].supportedIOCTypes.includes(IOC_TYPE.DOMAIN.toUpperCase()) ? 'Yes' : 'No',
            url: modulesList[module].supportedIOCTypes.includes(IOC_TYPE.URL.toUpperCase()) ? 'Yes' : 'No',
            ip: modulesList[module].supportedIOCTypes.includes(IOC_TYPE.IP.toUpperCase()) ? 'Yes' : 'No',
            email: modulesList[module].supportedIOCTypes.includes(IOC_TYPE.EMAIL.toUpperCase()) ? 'Yes' : 'No',
            md5: modulesList[module].supportedIOCTypes.includes(IOC_TYPE.MD5.toUpperCase()) ? 'Yes' : 'No',
            sha1: modulesList[module].supportedIOCTypes.includes(IOC_TYPE.SHA1.toUpperCase()) ? 'Yes' : 'No',
            sha256: modulesList[module].supportedIOCTypes.includes(IOC_TYPE.SHA256.toUpperCase()) ? 'Yes' : 'No',
            sha512: modulesList[module].supportedIOCTypes.includes(IOC_TYPE.SHA512.toUpperCase()) ? 'Yes' : 'No',
            cve: modulesList[module].supportedIOCTypes.includes(IOC_TYPE.CVE.toUpperCase()) ? 'Yes' : 'No',
            hostname: modulesList[module].supportedIOCTypes.includes(IOC_TYPE.HOSTNAME.toUpperCase()) ? 'Yes' : 'No',
            gdusername: modulesList[module].supportedIOCTypes.includes(IOC_TYPE.GODADDY_USERNAME.toUpperCase())
              ? 'Yes'
              : 'No',
            awshostname: modulesList[module].supportedIOCTypes.includes(IOC_TYPE.AWSHOSTNAME.toUpperCase())
              ? 'Yes'
              : 'No'
          });
        }
      }
      this.setState(
        {
          isLoading: false,
          mappedModules,
          tableModulesList: mappedModules.slice()
        },
        () => {}
      );
    });
  }

  componentDidMount() {
    this.getModulesListByIOCType();
  }

  renderHead() {
    return (
      <Table.Head className='JobList_head'>
        <Table.TextHeaderCell className='JobList_head_cell' width={colWidth} flex='none'>
          {COLUMNS.MODULE.name}
        </Table.TextHeaderCell>
        <Fragment>
          {
            // console.log(Object.values(COLUMNS))
            Object.entries(COLUMNS).map(([key, value]) => (
              <Table.TextHeaderCell className='JobList_head_cell' id={key}>
                {value.name}
              </Table.TextHeaderCell>
            ))
          }
        </Fragment>
        {/* <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.DOMAIN.name}</Table.TextHeaderCell>
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
        <Table.TextHeaderCell className='JobList_head_cell'>{COLUMNS.AWSHOSTNAME.name}</Table.TextHeaderCell> */}
      </Table.Head>
    );
  }

  renderRow({ module, domain, url, ip, email, cve, md5, sha1, sha256, sha512, hostname, gdusername, awshostname }) {
    return (
      <Table.Row key={module} className='JobList_row' width={colWidth} flex='none'>
        <Table.Cell className='JobList_id' width={colWidth} flex='none'>
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
        <Table.TextCell>{gdusername}</Table.TextCell>
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
