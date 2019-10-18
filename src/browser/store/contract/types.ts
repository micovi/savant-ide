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

export const enum ScillaBinStatus {
  SUCCESS,
  FAILURE,
}

export interface RunnerResult {
  status: ScillaBinStatus;
  gasUsed: number;
  gasPrice: number;
  address: string;
  error?: any;
}

export interface Param {
  vname: string;
  type: string;
}

export interface Transition {
  vname: string;
  params: Param[];
}

export interface ABI {
  vname: string;
  fields: Param[];
  params: Param[];
  transitions: Transition[];
}

export interface ContractEvent {
  _eventname: string;
  params: KVPair[];
}

export interface ContractMessage {
  _accepted: string;
  _amount: string;
  _recipient: string;
  _tag: string;
  params: KVPair[];
}

export interface TransitionCallResponse {
  events: ContractEvent[];
  message: ContractMessage;
  gas_remaining: string;
  states: KVPair[];
}

export interface Contract {
  address: string;
  code: string;
  abi: ABI | null;
  init: KVPair[];
  state: KVPair[];
  previousStates: KVPair[][];
  eventLog: ContractEvent[];
  messageLog: ContractMessage[];
  type: string;
  network: string | null;
}

interface ContractPointer {
  address: string;
  isChecking: boolean;
  isExecuting: boolean;
}

export interface KVPair {
  vname: string;
  type: string;
  value: string;
}

export interface TransitionParams {
  name: string;
  blockchain: KVPair[];
  state: KVPair[];
  tParams: KVPair[];
}

export interface Event {
  address: string;
  name: string;
  event: { [key: string]: any };
}

export interface ContractState {
  isLoading: boolean;
  isCallingTransition: boolean;
  isDeployingContract: boolean;
  error: boolean;
  active: ContractPointer;
  contracts: {
    [address: string]: Contract;
  };
  events: { [id: string]: Event };
}

export const enum ContractActionTypes {
  INIT = '@contract/INIT',
  INIT_SUCCESS = '@contract/INIT_SUCCESS',
  INIT_ERROR = '@contract/INIT_ERROR',
  CHECK = '@contract/CHECK',
  CHECK_SUCCESS = '@contract/CHECK_SUCCESS',
  CHECK_ERROR = '@contract/CHECK_ERROR',
  DEPLOYLIVE = '@contract/DEPLOYLIVE',
  DEPLOY = '@contract/DEPLOY',
  DEPLOY_SUCCESS = '@contract/DEPLOY_SUCCESS',
  DEPLOY_ERROR = '@contract/DEPLOY_ERROR',
  CALL = '@contract/CALL',
  CALLLIVE = '@contract/CALLLIVE',
  CALL_SUCCESS = '@contract/CALL_SUCCESS',
  CALL_ERROR = '@contract/CALL_ERROR',
  ADD_EVENT = '@contract/ADD_EVENT',
  CLEAR_EVENT = '@contract/CLEAR_EVENT',
}
