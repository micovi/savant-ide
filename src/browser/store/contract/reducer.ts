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

import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import * as contractActions from './actions';
import { Contract, ContractState } from './types';
import fastHash from 'murmurhash3js';

type ContractAction = ActionType<typeof contractActions>;

const initialState: ContractState = {
  error: false,
  isLoading: false,
  isDeployingContract: false,
  isCallingTransition: false,
  active: { address: '', isChecking: false, isExecuting: false },
  contracts: {},
  events: {},
};

const contractReducer: Reducer<ContractState, ContractAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(contractActions.init): {
      return { ...state, isLoading: true };
    }

    case getType(contractActions.initSuccess): {
      const index = action.payload.contracts.reduce(
        (acc, cntr) => {
          return { ...acc, [cntr.address]: cntr };
        },
        {} as { [address: string]: Contract },
      );

      return { ...state, contracts: index, isLoading: false };
    }

    // for now, just put the entire store into an error state.
    case getType(contractActions.initError): {
      return { ...state, isLoading: false, error: true };
      break;
    }

    case getType(contractActions.deploy): {
      return { ...state, isDeployingContract: true };
    }

    case getType(contractActions.deployLive): {
      return { ...state, isDeployingContract: true };
    }

    case getType(contractActions.deploySuccess): {
      const { contract } = action.payload;
      const newIndex = { ...state.contracts, [contract.address]: contract };

      return { ...state, contracts: newIndex, isDeployingContract: false };
    }

    case getType(contractActions.deployError): {
      return { ...state, isDeployingContract: false };
    }

    case getType(contractActions.call): {
      return { ...state, isCallingTransition: true };
    }

    case getType(contractActions.callError): {
      return { ...state, isCallingTransition: false };
    }

    case getType(contractActions.callSuccess): {
      const { address, contract } = action.payload;
      const newIndex = { ...state.contracts, [address]: contract };
      return { ...state, contracts: newIndex, isCallingTransition: false };
    }

    case getType(contractActions.addEvent): {
      const { address, name, event } = action.payload;
      const id = fastHash.x86.hash32(address + name + JSON.stringify(event));

      return { ...state, events: { ...state.events, [id]: { address, name, event } } };
    }

    case getType(contractActions.clearEvent): {
      const { id } = action.payload;
      const { [id]: evt, ...rest } = state.events;

      return { ...state, events: { ...rest } };
    }

    default:
      return state;
  }
};

export default contractReducer;
