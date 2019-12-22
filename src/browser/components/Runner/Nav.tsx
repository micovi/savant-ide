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

import styled from 'styled-components';

import Terminal from '../../assets/terminal.svg';

import CallTab from './Call';
import DeployTab from './Deploy';
import LiveCallTab from './LiveCall';
import LiveDeployTab from './LiveDeploy';
import StateTab from './State';

import { LiveCaller, Caller, Deployer, LiveDeployer } from '../types';
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

const TabsContainer = styled.div`
 width: 60px;
 background-color: #fff;
 height: 100%;
 position: absolute;
 right: 0;
 top: 0;
 z-index: 10;
 padding: 1rem;

 display: flex;
 flex-direction: column;
 align-items: center;

 .clickable {
    opacity: 0.5;
    transition: all 0.2s ease-in-out;
    &:hover {
      cursor: pointer;
      opacity: 1;
    }
  }
`;

const FlatIcon = styled.img`
  height: 32px;
`;


interface Props {
  deployContract: Deployer;
  deployLiveContract: LiveDeployer;
  isDeployingContract: boolean;
  callTransition: Caller;
  callLiveTransition: LiveCaller;
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

  handleTerminal = (e: React.MouseEvent<any>) => {
    e.preventDefault();
    this.setState({ value: 1 });
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
      case 4:
        return (
          <LiveCallTab
            deployedContracts={this.props.deployedContracts}
            callTransition={this.props.callLiveTransition}
            isCalling={this.props.isCallingTransition}
          />
        );
      default:
        return null;
    }
  };

  render() {
    return (
      <Wrapper classes={{ root: 'root' }} square>
        <TabsContainer>
          <FlatIcon src={Terminal} className="clickable" onClick={this.handleTerminal} />
        </TabsContainer>
        <Content>{this.renderContent()}</Content>
      </Wrapper>
    );
  }
}
