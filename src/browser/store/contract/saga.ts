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

import { all, actionChannel, select, call, fork, put, take } from 'redux-saga/effects';
import { ActionType } from 'typesafe-actions';
import BN from 'bn.js';

import { ApplicationState } from '../index';
import ContractStore from '../../database/contracts';
import * as contractActions from './actions';
import { ContractActionTypes, ScillaBinStatus, ABI } from './types';

import * as bcActions from '../blockchain/actions';
import * as api from '../../util/api';
import config from '../../config';

import { Long, bytes} from '@zilliqa-js/util';
import { Zilliqa } from '@zilliqa-js/zilliqa';
import { getAddressFromPrivateKey } from '@zilliqa-js/crypto';

type ContractAction = ActionType<typeof contractActions>;

export function* initContract() {
  // instantiate a call to the virtual fs IDB store
  yield take(ContractActionTypes.INIT);
  const db = new ContractStore();

  // fetch all contracts on first load
  const contracts = yield db.getAll();
  yield put(contractActions.initSuccess(contracts));

  // block on _all_ actions
  const chan = yield actionChannel([ContractActionTypes.DEPLOYLIVE, ContractActionTypes.CALL]);
  while (true) {
    const action: ContractAction = yield take<ContractAction>(chan);
    // call the appropriate actions, passing the instance of db along
    switch (action.type) {
      case ContractActionTypes.DEPLOYLIVE:
        yield call(deployContractLive, action);
        break;
      case ContractActionTypes.CALL:
        yield call(callTransition, action, db);
        break;
      default:
    }
  }
}

function* deployContractLive(action: ActionType<typeof contractActions.deployLive>) {
  try {
    const { code, privateKey, network, init: pInit, msg, gaslimit, gasprice, statusCB } = action.payload;
    const { message: result } = yield api.checkContract(code);
    if (!result) {
      throw new Error('ABI could not be parsed.');
    }
    

    // we need to take this off the depoyer's balance
    const txAmount = new BN(msg._amount || '0');

    const zilliqa = new Zilliqa(network);

    let chainId = 1;
    if (network === 'https://dev-api.zilliqa.com') {
      chainId = 333;
    }
    const msgVersion = 1;
    const VERSION = bytes.pack(chainId, msgVersion);

    // import Zilliqa Account
    zilliqa.wallet.addByPrivateKey(privateKey);

    const address = getAddressFromPrivateKey(privateKey);

    // const myGasPrice = units.toQa(gasprice, units.Units.Li);

    const init = [
      ...pInit,
      { vname: '_scilla_version', type: 'Uint32', value: config.SCILLA_VERSION },
    ];

    // Instance of class Contract
    const zilContract = zilliqa.contracts.new(code, init);

    const myGasPrice = new BN(gasprice);

    // Deploy the contract
    const [deployTx] = yield zilContract.deploy({
      version: VERSION,
      gasPrice: myGasPrice,
      gasLimit: Long.fromNumber(gaslimit)
    });

    if(deployTx.id === undefined) {
      throw new Error('Contract could not be deployed.');
    }

    // Introspect the state of the underlying transaction
    console.log(`Deployment Transaction ID: ${deployTx.id}`);
    console.log(deployTx.txParams);


    const contract = {
      abi: JSON.parse(result).contract_info,
      code,
      init,
      state: [{ vname: '_balance', type: 'Uint128', value: txAmount.toString() }],
      previousStates: [],
      eventLog: [],
      messageLog: [],
      address,
    };

    yield all([
      yield put(contractActions.deploySuccess(contract)),
    ]);

    const gasUsed = deployTx.txParams.receipt.cumulative_gas;

    statusCB({ status: ScillaBinStatus.SUCCESS, address: deployTx.id, gasUsed, gasPrice: myGasPrice.toNumber() });
  } catch (err) {
    console.log(err);
    yield put(contractActions.deployError(err));
    action.payload.statusCB({
      status: ScillaBinStatus.FAILURE,
      address: '',
      gasUsed: 0,
      gasPrice: action.payload.gasprice,
      error: err,
    });
  }
}

function* callTransition(action: ActionType<typeof contractActions.call>, db: ContractStore) {
  const {
    address,
    transition,
    tParams,
    msgParams,
    caller,
    gaslimit,
    gasprice,
    statusCB,
  } = action.payload;

  try {
    const state: ApplicationState = yield select();
    const contractStorage = state.contract.contracts[address];
    // get init params
    const init = contractStorage.init;
    // get previous state if any
    const contractState = contractStorage.state;
    // get blockchain state
    const blockchain = [
      { vname: 'BLOCKNUMBER', type: 'BNum', value: state.blockchain.blockNum.toString() },
    ];

    // we need to take this off the caller's balance
    const txAmount = new BN(msgParams._amount || '0');

    // get message
    const message = {
      _tag: transition,
      _amount: txAmount.toString(10),
      _sender: `0x${caller.address.toUpperCase()}`,
      params: tParams,
    };

    const payload = {
      code: contractStorage.code,
      init: JSON.stringify(init),
      blockchain: JSON.stringify(blockchain),
      state: JSON.stringify(contractState),
      message: JSON.stringify(message),
      gaslimit,
    };

    const res: api.CallResponse = yield api.callContract(payload);

    const { message: msg } = res;

    const gasUsed = gaslimit - parseInt(msg.gas_remaining, 10);

    const updatedAccount = {
      ...caller,
      nonce: caller.nonce + 1,
      balance: new BN(caller.balance)
        .sub(txAmount)
        .sub(new BN(gasUsed * gasprice))
        .add(new BN((msg.message && msg.message._amount) || '0'))
        .toString(10),
    };

    const updatedContract: typeof contractStorage = {
      ...contractStorage,
      state: msg.states,
      previousStates: [...contractStorage.previousStates, contractStorage.state],
      eventLog: [...contractStorage.eventLog, ...msg.events],
      messageLog: [...contractStorage.messageLog, msg.message],
    };

    yield db.set(address, updatedContract);
    yield all([
      put(bcActions.updateAccount(updatedAccount)),
      put(contractActions.callSuccess(contractStorage.address, updatedContract)),
      ...msg.events.map((event) =>
        put(
          contractActions.addEvent(
            contractStorage.address,
            (contractStorage.abi as ABI).vname,
            event,
          ),
        ),
      ),
    ]);

    statusCB({ status: ScillaBinStatus.SUCCESS, address, gasUsed, gasPrice: gasprice });
  } catch (err) {
    yield put(contractActions.callError(address, err));
    statusCB({
      status: ScillaBinStatus.FAILURE,
      address,
      gasPrice: action.payload.gasprice,
      gasUsed: 0,
      error: err,
    });
  }
}

export default function* contractSaga() {
  yield fork(initContract);
}
