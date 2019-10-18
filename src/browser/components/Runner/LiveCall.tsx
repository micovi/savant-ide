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
import Typography from '@material-ui/core/Typography';
import Status from '../Status';
import { LiveCaller } from '../types';
import { RunnerResult, Contract, Transition } from '../../store/contract/types';
import Select, { Option } from '../Form/Select';
import { toMsgFields, toScillaParams, FieldDict, MsgFieldDict } from '../../util/form';
import TransitionForm from './TransitionForm';
import { Input, Button } from '@material-ui/core';
import { Zilliqa } from '@zilliqa-js/zilliqa';

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


const Box = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  > * {
    width: 100%;
  }
`;

interface Props {
  // the address of a deployed contract
  isCalling: boolean;
  callTransition: LiveCaller;
  deployedContracts: { [address: string]: Contract };
}

interface State {
  result: RunnerResult | null;
  selectedContract: string; // address of currently selected transition
  selectedTransition: string;
  decryptError: any;
  privateKey: string;
  network: string;
  keystore: any;
  passphrase: string;
  wallet: any;
}

export default class CallTab extends React.Component<Props, State> {
  state: State = {
    selectedContract: '',
    selectedTransition: '',
    decryptError: '',
    result: null,
    network: '',
    passphrase: '',
    wallet: null,
    keystore: null,
    privateKey: ''
  };

  onCallTransition = (transition: string, params: FieldDict, msg: MsgFieldDict) => {
    const { selectedContract, wallet, network } = this.state;
    const { callTransition } = this.props;


    const tParams = toScillaParams(params);
    const { gaslimit, gasprice, ...msgParams } = toMsgFields(msg);

    console.log(selectedContract, tParams, msgParams);

    callTransition(
      selectedContract,
      transition,
      tParams,
      msgParams,
      wallet.privateKey,
      network,
      gaslimit,
      gasprice,
      this.onCallResult,
    );
  };

  onCallResult = (result: RunnerResult) => this.setState({ result });

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

    const filtered = Object.values(deployedContracts).filter((contract: Contract) => {
      if (contract.type !== undefined && contract.type === 'live') {
        return true;
      }

      return false;
    });

    return filtered.map(contract => {
      const key = `${contract.address} (${(contract.abi && contract.abi.vname) || ''})`;
      const value = contract.address;

      return { key, value };
    });
  };

  reset = () =>
    this.setState({
      wallet: null,
      selectedContract: '',
      selectedTransition: '',
      result: null,
    });

  onSelectNetwork: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    e.preventDefault();

    this.setState({
      network: e.target.value
    });
  };

  getNetworkOptions = () => {
    return [
      {
        key: 'Mainnet (https://api.zilliqa.com)',
        value: 'https://api.zilliqa.com'
      },
      {
        key: 'Testnet (https://dev-api.zilliqa.com)',
        value: 'https://dev-api.zilliqa.com'
      },
      {
        key: 'IsolatedServer RPC (http://localhost:5555)',
        value: 'http://localhost:5555'
      }
    ];
  };

  onChangePrivateKey: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();

    this.setState({
      privateKey: e.target.value
    });
  }

  onChangeKeystore: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();

    if (e.target.files !== null) {
      const reader: FileReader = new FileReader();
      reader.readAsText(e.target.files[0], 'UTF-8');

      reader.onload = () => {
        this.setState({
          keystore: reader.result
        });
      };

    }
  }

  onChangePassphrase: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    e.preventDefault();

    this.setState({
      passphrase: e.target.value
    });
  }

  onAccessWallet: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();

    this.setState({
      decryptError: null
    });

    try {

      const { keystore, passphrase, network, privateKey } = this.state;

      const zilliqa = new Zilliqa(network);

      if (keystore && passphrase) {
        await zilliqa.wallet.addByKeystore(keystore, passphrase);
      } else {
        await zilliqa.wallet.addByPrivateKey(privateKey);
      }

      const account = zilliqa.wallet.defaultAccount;

      if (account !== undefined) {
        this.setState({
          wallet: account,
          privateKey: account.privateKey
        });
      }
    } catch (error) {
      this.setState({
        decryptError: error.message
      });
    }

  }



  render() {
    const { deployedContracts } = this.props;
    const { selectedContract, selectedTransition, result, network, wallet, privateKey, keystore, passphrase, decryptError } = this.state;
    const toCall = deployedContracts[selectedContract] || null;
    const abi = toCall && toCall.abi;

    return (
      <Wrapper>
        <Select
          placeholder="Select network"
          items={this.getNetworkOptions()}
          value={network}
          onChange={this.onSelectNetwork}
        />

        {network ? (
          <Box>
            {wallet ? (
              <Box>
                <p>Wallet Address: {wallet.address}</p>

                <br />

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
                    {wallet &&
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
              </Box>
            ) : (
                <Box>
                  {!keystore ? (
                    <Box>
                      <Input
                        type="text"
                        placeholder="Enter account Private Key"
                        value={privateKey}
                        onChange={this.onChangePrivateKey}
                      />
                      <h4>or select Keystore File</h4>
                    </Box>
                  ) : null}

                  <Input
                    type="file"
                    onChange={this.onChangeKeystore}
                  />

                  <br />

                  {(keystore && privateKey === '') ? (
                    <Input
                      type="password"
                      placeholder="Enter passphrase to decrypt Keystore file"
                      onChange={this.onChangePassphrase}
                    />
                  ) : null}

                  {(keystore && passphrase) || (privateKey) ? (
                    <Button
                      variant="contained"
                      onClick={this.onAccessWallet}
                    >Access Wallet</Button>
                  ) : null}

                  <br />

                  {(decryptError && decryptError.length) ?
                    (
                      <Status>
                        <Typography color="error" variant="body2">
                          {decryptError}
                        </Typography>
                      </Status>
                    ) : null}
                </Box>
              )}
          </Box>
        ) : null}
      </Wrapper>
    );
  }
}
