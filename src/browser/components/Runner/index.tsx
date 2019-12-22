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

import ArrowRight from '@material-ui/icons/ArrowRight';
import Drawer from '@material-ui/core/Drawer';
import classNames from 'classnames';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';

import RunnerNav from './Nav';

import * as bcActions from '../../store/blockchain/actions';
import * as contractActions from '../../store/contract/actions';
import { ApplicationState } from '../../store/index';
import { Account } from '../../store/blockchain/types';
import { Contract, RunnerResult, KVPair } from '../../store/contract/types';
import { ContractSrcFile } from '../../store/fs/types';

type Props = OwnProps & MappedProps & DispatchProps;

const ZDrawer = styled(Drawer)`
  &.open {
    width: 30%;
    min-width: 30%;
  }

  &.closed {
    width: 0;
  }

  & .paper {
    position: relative;
    transition: width 50ms ease-in;

    &.open {
      width: 100%;
    }
  }

  & .adder {
    margin: 1em;
  }
`;

const Arrow = styled(ArrowRight)`
  && {
    width: 100%;
    font-size: 14px;
    transition: transform 20ms ease-out;
    &.closed {
      transform: rotate(180deg);
    }
  }
`;

const Closer = styled.div`
  background: #efefef;
  display: flex;
  align-items: center;
  position: relative;
  width: 20px;

  & .closer-icon {
    width: 20px;
    font-size: 20px;
    cursor: pointer;
  }
`;

interface OwnProps {
  isOpen: boolean;
  toggle(): void;
}

interface MappedProps {
  active: Contract | null;
  files: { [name: string]: ContractSrcFile };
  accounts: { [address: string]: Account };
  deployedContracts: { [address: string]: Contract };
  isDeployingContract: boolean;
  isCallingTransition: boolean;
}

interface DispatchProps {
  initContracts: typeof contractActions.init;
  initBlockchain: typeof bcActions.init;
  deployContract: typeof contractActions.deploy;
  deployLiveContract: typeof contractActions.deployLive;
  callTransition: typeof contractActions.call;
  callLiveTransition: typeof contractActions.callLive;
}

class Runner extends React.Component<Props> {
  toggle: React.MouseEventHandler<SVGSVGElement> = (e) => {
    e.preventDefault();
    this.props.toggle();
  };

  componentDidMount() {
    this.props.initBlockchain();
    this.props.initContracts();
  }

  render() {
    const { isOpen, files } = this.props;
    return (
      <React.Fragment>
        <Closer>
          <Arrow
            classes={{ root: classNames('closer-icon', !isOpen && 'closed') }}
            onClick={this.toggle}
          />
        </Closer>
        <ZDrawer
          open={isOpen}
          variant="persistent"
          anchor="right"
          classes={{
            docked: classNames('root', isOpen ? 'open' : 'closed'),
            paper: classNames('paper', isOpen ? 'open' : 'closed'),
          }}
        >
          <RunnerNav
            callTransition={this.props.callTransition}
            callLiveTransition={this.props.callLiveTransition}
            isCallingTransition={this.props.isCallingTransition}
            deployContract={this.props.deployContract}
            deployLiveContract={this.props.deployLiveContract}
            isDeployingContract={this.props.isDeployingContract}
            accounts={this.props.accounts}
            abi={(this.props.active && this.props.active.abi) || null}
            deployedContracts={this.props.deployedContracts}
            files={files}
          />
        </ZDrawer>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  initBlockchain: () => dispatch(bcActions.init()),
  initContracts: (name?: string, code?: string) => dispatch(contractActions.init()),
  deployContract: (
    code: string,
    init: KVPair[],
    msg: { [key: string]: string },
    deployer: Account,
    gaslimit: number,
    gasprice: number,
    resultCb: (result: RunnerResult) => void,
  ) => dispatch(contractActions.deploy(code, init, msg, deployer, gaslimit, gasprice, resultCb)),
  deployLiveContract: (
    code: string,
    init: KVPair[],
    msg: { [key: string]: string },
    privateKey: string,
    network: string,
    gaslimit: number,
    gasprice: number,
    resultCb: (result: RunnerResult) => void,
  ) => dispatch(contractActions.deployLive(code, init, msg, privateKey, network, gaslimit, gasprice, resultCb)),
  callTransition: (
    address: string,
    transition: string,
    tParams: KVPair[],
    msg: { [key: string]: string },
    caller: Account,
    gaslimit: number,
    gasprice: number,
    resultCb: (result: RunnerResult) => void,
  ) =>
    dispatch(
      contractActions.call(address, transition, tParams, msg, caller, gaslimit, gasprice, resultCb),
    ),
  callLiveTransition: (
    address: string,
    transition: string,
    tParams: KVPair[],
    msg: { [key: string]: string },
    privateKey: string,
    network: string,
    gaslimit: number,
    gasprice: number,
    resultCb: (result: RunnerResult) => void,
  ) =>
    dispatch(
      contractActions.callLive(address, transition, tParams, msg, privateKey, network, gaslimit, gasprice, resultCb),
    ),
});

const mapStateToProps = (state: ApplicationState) => {
  const pointer = state.contract.active;
  const files = state.fs.contracts;
  const accounts = state.blockchain.accounts;
  const deployedContracts = state.contract.contracts;

  const baseMappedProps = {
    accounts,
    files,
    deployedContracts,
    isDeployingContract: state.contract.isDeployingContract,
    isCallingTransition: state.contract.isCallingTransition,
  };

  if (pointer.address) {
    return { ...baseMappedProps, active: state.contract.contracts[pointer.address] };
  }

  return { ...baseMappedProps, active: null };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Runner);
