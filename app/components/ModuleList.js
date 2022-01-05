/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-key */
import React, { Fragment } from 'react';
import { Table } from 'evergreen-ui';
import getModulesListByIOCType from '../api/getModulesListByIOCType';
import { withRouter } from 'next/router';
import { IOC_TYPE } from '../utils/const';
import Loader from './common/Loader';
import '@ux/icon/chevron-down-lt/index.css';
import '@ux/icon/x/index.css';

const colWidth = 150;

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
      const { currentlySupportedIOCs } = this.state;
      const modulesList = modulesListData;
      const mappedModules = [];
      for (const module in modulesList) {
        if (module) {
          const listOfSupportedIOCTypes = Object.keys(IOC_TYPE).filter((iocType) => {
            const isSupported = modulesList[module].supportedIOCTypes.includes(iocType.toUpperCase());
            if (isSupported && currentlySupportedIOCs.indexOf(iocType) < 0) {
              currentlySupportedIOCs.push(iocType);
            }
            return isSupported;
          });
          if (listOfSupportedIOCTypes.length) {
            mappedModules.push({ module, listOfSupportedIOCTypes });
          }
        }
      }
      this.setState(
        {
          isLoading: false,
          mappedModules,
          tableModulesList: mappedModules.slice(),
          currentlySupportedIOCs
        },
        () => {}
      );
    });
  }

  componentDidMount() {
    this.getModulesListByIOCType();
  }

  renderHead() {
    const { currentlySupportedIOCs } = this.state;
    return (
      <Table.Head className='JobList_head'>
        <Table.TextHeaderCell className='JobList_head_cell' width={colWidth}>
          {'Module'}
        </Table.TextHeaderCell>
        <Fragment>
          {currentlySupportedIOCs.map((iocType, i) => {
            return (
              <Table.TextHeaderCell className='JobList_head_cell' id={i} width={colWidth}>
                {iocType.toUpperCase() === 'HOSTNAME'
                  ? 'GODADDY HOSTNAME'
                  : iocType.toUpperCase() === 'AWSHOSTNAME'
                  ? 'AWS HOSTNAME'
                  : iocType.replace('_', ' ')}
              </Table.TextHeaderCell>
            );
          })}
        </Fragment>
      </Table.Head>
    );
  }

  renderRow({ module, listOfSupportedIOCTypes }) {
    const { currentlySupportedIOCs } = this.state;
    return (
      <Table.Row key={module} className='JobList_row'>
        <Table.Cell className='JobList_id' width={colWidth}>
          {module}
        </Table.Cell>
        {currentlySupportedIOCs.map((iocType) => {
          return (
            <Table.TextCell>{listOfSupportedIOCTypes.includes(iocType.toUpperCase()) ? 'Yes' : 'No'}</Table.TextCell>
          );
        })}
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
