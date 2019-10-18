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
import { find } from 'ramda';
import styled from 'styled-components';

import { Account } from '../../store/blockchain/types';
import { RunnerResult, Contract, Transition } from '../../store/contract/types';
import Select, { Option } from '../Form/Select';
import { Caller } from '../types';
import { toMsgFields, toScillaParams, FieldDict, MsgFieldDict } from '../../util/form';
import TransitionForm from './TransitionForm';

const Wrapper = styled.div`
  margin-top: 2em;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  width: 100%;

  > * {
    width: 100%;
  }
`;

interface Props {
  // the address of a deployed contract
  callTransition: Caller;
  isCalling: boolean;
  accounts: { [address: string]: Account };
  deployedContracts: { [address: string]: Contract };
}

interface State {
  activeAccount: Account | null;
  result: RunnerResult | null;
  selectedContract: string; // address of currently selected transition
  selectedTransition: string;
}

export default class CallTab extends React.Component<Props, State> {
  state: State = {
    activeAccount: null,
    selectedContract: '',
    selectedTransition: '',
    result: null,
  };

  onCallTransition = (transition: string, params: FieldDict, msg: MsgFieldDict) => {
    const { callTransition } = this.props;
    const { activeAccount, selectedContract } = this.state;

    if (!activeAccount) {
      return;
    }

    const tParams = toScillaParams(params);
    const { gaslimit, gasprice, ...msgParams } = toMsgFields(msg);

    callTransition(
      selectedContract,
      transition,
      tParams,
      msgParams,
      activeAccount,
      gaslimit,
      gasprice,
      this.onCallResult,
    );
  };

  onCallResult = (result: RunnerResult) => this.setState({ result });

  onSelectAccount: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    e.preventDefault();
    this.setState({ activeAccount: this.props.accounts[e.target.value] });
  };

  onSelectContract: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    e.preventDefault();
    this.setState({ selectedContract: e.target.value });
  };

  onSelectTransition: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    e.preventDefault();
    this.setState({ selectedTransition: e.target.value });
  };

  getTransitionOptions = (): Option[] => {
    const { deployedContracts } = this.props;
    const { selectedContract } = this.state;

    const abi = deployedContracts[selectedContract].abi;

    if (abi && abi.transitions.length > 0) {
      return abi.transitions.map((transition) => {
        return { key: transition.vname, value: transition.vname };
      });
    }

    return [];
  };

  getDeployedContractOptions = (): Option[] => {
    const { deployedContracts } = this.props;
    
    const filtered = Object.values(deployedContracts).filter((contract:Contract) => {
      if(contract.type === undefined || contract.type !== 'live') {
        return true;
      }

      return false;
    });

    return filtered.map(contract => {
      const key = `0x${contract.address.toUpperCase()} (${(contract.abi && contract.abi.vname) || ''})`;
      const value = contract.address;

      return {key, value};
    });
  };

  getAccountOptions = () => {
    const { accounts } = this.props;

    return Object.keys(accounts).map((address) => ({
      key: `0x${address.toUpperCase()} (Balance: ${accounts[address].balance} ZIL, Nonce: ${
        accounts[address].nonce
      })`,
      value: address,
    }));
  };

  reset = () =>
    this.setState({
      activeAccount: null,
      selectedContract: '',
      selectedTransition: '',
      result: null,
    });

  render() {
    const { deployedContracts } = this.props;
    const { activeAccount, selectedContract, selectedTransition, result } = this.state;
    const toCall = deployedContracts[selectedContract] || null;
    const abi = toCall && toCall.abi;

    return (
      <Wrapper>
        <Select
          copyable
          value={(activeAccount && activeAccount.address) || ''}
          placeholder="Select account"
          onChange={this.onSelectAccount}
          items={this.getAccountOptions()}
        />
        <Select
          placeholder="Select a contract"
          items={this.getDeployedContractOptions()}
          value={selectedContract}
          onChange={this.onSelectContract}
        />
        {abi && (
          <React.Fragment>
            <Select
              placeholder={`Select a transition for ${abi.vname}`}
              items={this.getTransitionOptions()}
              value={selectedTransition}
              onChange={this.onSelectTransition}
            />
            {activeAccount &&
              !!selectedTransition.length && (
                <TransitionForm
                  key={selectedTransition}
                  isCalling={this.props.isCalling}
                  handleReset={this.reset}
                  handleSubmit={this.onCallTransition}
                  result={result}
                  {...find((t) => t.vname === selectedTransition, abi.transitions) as Transition}
                />
              )}
          </React.Fragment>
        )}
      </Wrapper>
    );
  }
}
