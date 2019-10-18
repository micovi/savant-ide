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

import { Account } from '../store/blockchain/types';
import { RunnerResult, KVPair } from '../store/contract/types';
/**
 * Action dispatchers
 */
export type Deployer = (
  code: string,
  initParams: KVPair[],
  msgParams: { [key: string]: string },
  deployer: Account,
  gaslimit: number,
  gasprice: number,
  resultCb: (result: RunnerResult) => void,
) => void;

export type LiveDeployer = (
  code: string,
  initParams: KVPair[],
  msgParams: { [key: string]: string },
  privateKey: string,
  network: string,
  gaslimit: number,
  gasprice: number,
  resultCb: (result: RunnerResult) => void,
) => void;

export type Caller = (
  address: string,
  transition: string,
  tParams: KVPair[],
  msgParams: { [key: string]: string },
  caller: Account,
  gaslimit: number,
  gasprice: number,
  resultCb: (result: RunnerResult) => void,
) => void;

export type LiveCaller = (
  address: string,
  transition: string,
  tParams: KVPair[],
  msgParams: { [key: string]: string },
  privateKey: string,
  network: string,
  gaslimit: number,
  gasprice: number,
  resultCb: (result: RunnerResult) => void,
) => void;