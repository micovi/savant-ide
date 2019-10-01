/**
 * This file is part of savant-ide.
 * Copyright (c) 2018 - present Zilliqa Research Pte. Ltd.
 *
 * savant-ide is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * savant-ide is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * savant-ide.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import AssignmentIcon from '@material-ui/icons/Description';
import PlayIcon from '@material-ui/icons/PlayCircleOutline';
import SendIcon from '@material-ui/icons/Send';
import LaunchIcon from '@material-ui/icons/Launch';
import styled from 'styled-components';

import CallTab from './Call';
import DeployTab from './Deploy';
import LiveDeployTab from './LiveDeploy';
import StateTab from './State';

import { Caller, Deployer, LiveDeployer } from '../types';
import { ContractSrcFile } from '../../store/fs/types';
import { Account } from '../../store/blockchain/types';
import { ABI, Contract } from '../../store/contract/types';

const Wrapper = styled(Paper)`
  display: flex;
  height: 100%;
  flex-direction: column;

  & .tabs {
    min-height: 72px;
  }
`;

const Content = styled.div`
  overflow: auto;
  flex: 1 1 auto;
  display: flex;
  padding: 0 1em;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

interface Props {
  deployContract: Deployer;
  deployLiveContract: LiveDeployer;
  isDeployingContract: boolean;
  callTransition: Caller;
  isCallingTransition: boolean;
  accounts: { [address: string]: Account };
  deployedContracts: { [address: string]: Contract };
  files: { [name: string]: ContractSrcFile };
  abi: ABI | null;
}

interface State {
  value: number;
}

export default class RunnerNav extends React.Component<Props, State> {
  state: State = {
    value: 0,
  };

  handleChange = (_: React.ChangeEvent<any>, value: number) => {
    this.setState({ value });
  };

  renderContent = () => {
    switch (this.state.value) {
      case 0:
        return (
          <CallTab
            accounts={this.props.accounts}
            callTransition={this.props.callTransition}
            deployedContracts={this.props.deployedContracts}
            isCalling={this.props.isCallingTransition}
          />
        );
      case 1:
        return <StateTab accounts={this.props.accounts} contracts={this.props.deployedContracts} />;
      case 2:
        return (
          <DeployTab
            accounts={this.props.accounts}
            files={this.props.files}
            deployContract={this.props.deployContract}
            isDeploying={this.props.isDeployingContract}
          />
        );
        case 3:
          return (
            <LiveDeployTab
            files={this.props.files}
            deployLiveContract={this.props.deployLiveContract}
            isDeploying={this.props.isDeployingContract}
          />
          );
      default:
        return null;
    }
  };

  render() {
    return (
      <Wrapper classes={{ root: 'root' }} square>
        <Tabs
          classes={{ root: 'tabs' }}
          value={this.state.value}
          onChange={this.handleChange}
          fullWidth={false}
          indicatorColor="secondary"
          textColor="secondary"
        >
          <Tab style={{minWidth: 40}} icon={<PlayIcon />} label="Call" />
          <Tab icon={<AssignmentIcon />} label="State" />
          <Tab icon={<SendIcon />} label="Local Deploy" />
          <Tab icon={<LaunchIcon />} label="Live Deploy" />
        </Tabs>
        <Content>{this.renderContent()}</Content>
      </Wrapper>
    );
  }
}
