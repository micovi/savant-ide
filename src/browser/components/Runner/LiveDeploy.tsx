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
import Button from '@material-ui/core/Button';

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
import { Input } from '@material-ui/core';

import { Long, bytes, units } from '@zilliqa-js/util';
import { Zilliqa } from '@zilliqa-js/zilliqa';
import { getAddressFromPrivateKey } from '@zilliqa-js/crypto';


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
  deployLiveContract: LiveDeployer;
  isDeploying: boolean;
  files: { [id: string]: ContractSrcFile };
}

interface State {
  error: any;
  isChecking: boolean;
  selected: string;
  abi: ABI | null;
  result: RunnerResult | null;
  privateKey: string;
  network: string;
}

export default class LiveDeployTab extends React.Component<Props, State> {
  state: State = {
    selected: '',
    error: '',
    isChecking: false,
    privateKey: '',
    network: '',
    abi: null,
    result: null,
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

  onDeploy = (init: FieldDict, msg: MsgFieldDict) => {
    const { deployLiveContract, files } = this.props;
    const { privateKey, network } = this.state;

    // this case should never arise, but we have to satisfy the typechecker.
    if (!privateKey || !network) {
      return;
    }

    const sourceFile = files[this.state.selected];
    const initParams = toScillaParams(init);
    const { gaslimit, gasprice, ...msgParams } = toMsgFields(msg);

    deployLiveContract(
      sourceFile.code,
      initParams,
      msgParams,
      privateKey,
      network,
      gaslimit,
      gasprice,
      this.onDeployResult,
    );
  };

  onDeployResult = (result: RunnerResult) => this.setState({ result });


  testDeploy = async () => {
    const {privateKey, network} = this.state;
    const {files} = this.props;

    const zilliqa = new Zilliqa(network);

    const chainId = 333;
    const msgVersion = 1;
    const VERSION = bytes.pack(chainId, msgVersion);

    // import Zilliqa Account
    zilliqa.wallet.addByPrivateKey(privateKey);

    const address = getAddressFromPrivateKey(privateKey);

    // Get Balance
    const balance = await zilliqa.blockchain.getBalance(address);

    console.log('Your balance', balance);
    // Get Minimum Gas Price from blockchain
/*     const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice(); */

    const myGasPrice = units.toQa('1000', units.Units.Li);

    const sourceFile = files[this.state.selected];
    const contractCode = sourceFile.code;

    const init = [
      // this parameter is mandatory for all init arrays
      {
        vname: '_scilla_version',
        type: 'Uint32',
        value: '0'
      },
      {
        vname: 'owner',
        type: 'ByStr20',
        value: `${address}`
      }
    ];

    // Instance of class Contract
    const contract = zilliqa.contracts.new(contractCode, init);

    // Deploy the contract
    const [deployTx, hello] = await contract.deploy({
      version: VERSION,
      gasPrice: myGasPrice,
      gasLimit: Long.fromNumber(10000)
    });

    // Introspect the state of the underlying transaction
    console.log(`Deployment Transaction ID: ${deployTx.id}`);
    console.log(`Deployment Transaction Receipt:`);
    console.log(deployTx.txParams.receipt);

    // Get the deployed contract address
    console.log('The contract address is:');
    console.log(hello.address);
  }

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
        key: 'Kaya RPC (http://localhost:5555)',
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
      // const { code } = this.props.files[this.state.selected];
      // const ctrl = new AbortController();
      this.setState({ isChecking: true, error: null });
      /* api
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
        }); */
    }
  }

  render() {
    const { privateKey, abi, error, selected, network, result } = this.state;

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
        <Input
          placeholder="Enter account Private Key"
          value={privateKey}
          onChange={this.onChangePrivateKey}
        />
        <Select
          placeholder="Select network"
          items={this.getNetworkOptions()}
          value={network}
          onChange={this.onSelectNetwork}
        />
        <Select
          placeholder="Choose a scilla source file"
          items={this.getContractOptions()}
          value={selected}
          onChange={this.onSelectContract}
        />
        {privateKey && abi ? (
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

        <Button
        onClick={this.testDeploy}
        >Test Deploy</Button>
      </Wrapper>
    );
  }
}
