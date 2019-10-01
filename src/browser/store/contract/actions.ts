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

import { createAction } from 'typesafe-actions';

import { ContractActionTypes, Contract, RunnerResult, KVPair } from './types';
import { Account } from '../blockchain/types';

/**
 * Initialisation
 * This boots up the main channel for communicatino with persistence layer
 */
export const init = createAction(ContractActionTypes.INIT);
export const initSuccess = createAction(ContractActionTypes.INIT_SUCCESS, (resolve) => {
  return (contracts: Contract[]) => resolve({ contracts });
});
export const initError = createAction(ContractActionTypes.CHECK_ERROR, (resolve) => {
  return (error: string) => resolve({ error });
});

/**
 * Deployment actions
 */
export const deploy = createAction(ContractActionTypes.DEPLOY, (resolve) => {
  return (
    code: string,
    initParams: KVPair[],
    msgParams: { [key: string]: string },
    deployer: Account,
    gaslimit: number,
    gasprice: number,
    statusCB: (result: RunnerResult) => void,
  ) => resolve({ code, init: initParams, msg: msgParams, gaslimit, gasprice, deployer, statusCB });
});
export const deployLive = createAction(ContractActionTypes.DEPLOYLIVE, (resolve) => {
  return (
    code: string,
    initParams: KVPair[],
    msgParams: { [key: string]: string },
    privateKey: string,
    network: string,
    gaslimit: number,
    gasprice: number,
    statusCB: (result: RunnerResult) => void,
  ) => resolve({ code, init: initParams, msg: msgParams, gaslimit, gasprice, privateKey, network, statusCB });
});
export const deploySuccess = createAction(ContractActionTypes.DEPLOY_SUCCESS, (resolve) => {
  return (contract: Contract) => resolve({ contract });
});
export const deployError = createAction(ContractActionTypes.DEPLOY_ERROR, (resolve) => {
  return (error: string) => resolve({ error });
});

/**
 * Transition actions
 */
export const call = createAction(ContractActionTypes.CALL, (resolve) => {
  return (
    address: string,
    transition: string,
    tParams: KVPair[],
    msgParams: { [key: string]: string },
    caller: Account,
    gaslimit: number,
    gasprice: number,
    statusCB: (result: RunnerResult) => void,
  ) => resolve({ address, transition, caller, tParams, msgParams, gaslimit, gasprice, statusCB });
});
export const callSuccess = createAction(ContractActionTypes.CALL_SUCCESS, (resolve) => {
  return (address: string, contract: Contract) => resolve({ address, contract });
});
export const callError = createAction(ContractActionTypes.CALL_ERROR, (resolve) => {
  return (address: string, error: any) => resolve({ address, error });
});

/**
 * Event actions
 */
export const addEvent = createAction(ContractActionTypes.ADD_EVENT, (resolve) => {
  return (address: string, name: string, event: { [key: string]: any }) =>
    resolve({ address, name, event });
});
export const clearEvent = createAction(ContractActionTypes.CLEAR_EVENT, (resolve) => {
  return (id: string) => resolve({ id });
});
