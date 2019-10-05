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

import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';

import Loader from '../Loader';
import { ABI, RunnerResult } from '../../store/contract/types';
import { ContractSrcFile } from '../../store/fs/types';
import { LiveDeployer } from '../types';

import Status from '../Status';
import * as api from '../../util/api';
import { toMsgFields, toScillaParams, FieldDict, MsgFieldDict } from '../../util/form';
import Select from '../Form/Select';
import InitForm from './InitForm';
import { Input, Button } from '@material-ui/core';
import { Zilliqa } from '@zilliqa-js/zilliqa';

/* import { Long, bytes, units } from '@zilliqa-js/util';
import { toBech32Address } from '@zilliqa-js/crypto'; */


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
  deployLiveContract: LiveDeployer;
  isDeploying: boolean;
  files: { [id: string]: ContractSrcFile };
}

interface State {
  error: any;
  decryptError: any;
  isChecking: boolean;
  selected: string;
  abi: ABI | null;
  result: RunnerResult | null;
  privateKey: string;
  network: string;
  keystore: any;
  passphrase: string;
  wallet: any;
}

export default class LiveDeployTab extends React.Component<Props, State> {
  state: State = {
    selected: '',
    keystore: '',
    error: '',
    decryptError: '',
    isChecking: false,
    privateKey: '',
    network: '',
    abi: null,
    result: null,
    passphrase: '',
    wallet: null
  };

  onSelectContract: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    e.preventDefault();
    this.setState({ selected: e.target.value, abi: null, result: null });
  };

  onSelectNetwork: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    e.preventDefault();

    this.setState({
      network: e.target.value
    });
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

  onDeploy = (init: FieldDict, msg: MsgFieldDict) => {
    const { deployLiveContract, files } = this.props;
    const { wallet, network } = this.state;

    // this case should never arise, but we have to satisfy the typechecker.
    if (!wallet || !network) {
      return;
    }

    const sourceFile = files[this.state.selected];
    const initParams = toScillaParams(init);
    const { gaslimit, gasprice, ...msgParams } = toMsgFields(msg);

    deployLiveContract(
      sourceFile.code,
      initParams,
      msgParams,
      wallet.privateKey,
      network,
      gaslimit,
      gasprice,
      this.onDeployResult,
    );
  };

  onDeployResult = (result: RunnerResult) => this.setState({ result });

  reset = () =>
    this.setState({
      privateKey: '',
      network: '',
      selected: '',
      error: '',
      isChecking: false,
      abi: null,
      result: null,
    });

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

  getContractOptions = () => {
    const { files } = this.props;

    return Object.keys(files).map((id) => ({
      key: `${files[id].displayName}.scilla`,
      value: id,
    }));
  };

  componentDidUpdate(_: Props, prevState: State) {
    if (this.state.selected.length && prevState.selected !== this.state.selected) {
      const { code } = this.props.files[this.state.selected];
      const ctrl = new AbortController();
      this.setState({ isChecking: true, error: null });
      api
        .checkContract(code, ctrl.signal)
        .then((res) => {
          if (res.result === 'error') {
            throw new Error(res.message);
          }

          const { contract_info } = JSON.parse(res.message);

          this.setState({ isChecking: false, abi: contract_info });
        })
        .catch((err) => {
          this.setState({ error: err.response ? err.response.message : err });
        });
    }
  }

  render() {
    const { privateKey, abi, error, decryptError, selected, network, result, keystore, passphrase, wallet } = this.state;

    if (error && error.length) {
      return (
        <Status>
          <Typography color="error" variant="body2" style={{ whiteSpace: 'pre-line' }}>
            {` The following errors were encountered during type-checking:

              ${api.formatError(error)}

              Please correct these errors and try again.
            `}
          </Typography>
          <Button
            variant="extendedFab"
            color="primary"
            aria-label="reset"
            onClick={this.reset}
            style={{ margin: '3.5em 0' }}
          >
            Try Again
          </Button>
        </Status>
      );
    }

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

                <br/>

                <Select
                  placeholder="Choose contract you want to deploy"
                  items={this.getContractOptions()}
                  value={selected}
                  onChange={this.onSelectContract}
                />

                {wallet && abi ? (
                  <InitForm
                    key={abi.vname}
                    handleReset={this.reset}
                    handleSubmit={this.onDeploy}
                    isDeploying={this.props.isDeploying}
                    abiParams={abi.params}
                    result={result}
                  />
                ) : (
                    this.state.isChecking && <Loader delay={1001} message="Getting ABI..." />
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
