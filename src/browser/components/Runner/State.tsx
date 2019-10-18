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
import JSONTree from 'react-json-tree';
import styled from 'styled-components';

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';

import Collapsible from './Collapsible';
import { Account } from '../../store/blockchain/types';
import { Contract } from '../../store/contract/types';
import { deserialiseContractState } from '../../util/encoding';

const noop = () => {
  return <React.Fragment />;
};

const labelRender = (key: string[]) => {
  return <span>{key.length > 1 ? key[0] : `0x${key[0]}`}:</span>;
};

const valueRender = (value: string, ...args: any[]) => {
  if (args[1] === 'code') {
    const expander = (isOpen: boolean) => (
      <span style={{ color: '#000', cursor: 'pointer' }}>{isOpen ? 'hide' : 'show'}</span>
    );
    return (
      <Collapsible expander={expander}>
        {() => <code style={{ whiteSpace: 'pre' }}>{`\n${value}`}</code>}
      </Collapsible>
    );
  }

  return <span>{value}</span>;
};

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;

  > .tree-wrapper {
    margin: 1em 0;
  }

  > * ul {
    background: #ffffff;
    font-family: roboto;
    width: 100%;
  }
`;

const ToggleWrapper = styled(FormGroup)`
  margin-top: 1em;
  flex: 1 0 auto;
`;

interface Props {
  contracts: { [address: string]: Contract };
  accounts: { [address: string]: Account };
}

interface State {
  native: boolean;
}

export default class StateTree extends React.Component<Props, State> {
  state: State = { native: false };

  toggleNative = () => this.setState({ native: !this.state.native });

  getContracts = () => {
    const { contracts } = this.props;

    if (this.state.native) {
      return Object.keys(contracts).reduce((acc, address) => {
        return {
          ...acc,
          [address]: {
            ...contracts[address],
            init: deserialiseContractState(contracts[address].init),
            state: deserialiseContractState(contracts[address].state),
            stateLog: contracts[address].previousStates.map((state) =>
              deserialiseContractState(state),
            ),
          },
        };
      }, {});
    }

    return contracts;
  };

  render() {
    return (
      <Wrapper>
        <ToggleWrapper row>
          <FormControlLabel
            control={<Switch checked={this.state.native} onChange={this.toggleNative} />}
            label="Native Data Types"
          />
        </ToggleWrapper>
        <div className="tree-wrapper">
          <Typography variant="title">Contract State</Typography>
          <JSONTree
            hideRoot
            data={this.getContracts()}
            getItemString={noop}
            valueRenderer={valueRender}
            labelRenderer={labelRender}
          />
        </div>
        <div className="tree-wrapper">
          <Typography variant="title">Account State</Typography>
          <JSONTree
            hideRoot
            data={this.props.accounts}
            getItemString={noop}
            labelRenderer={labelRender}
          />
        </div>
      </Wrapper>
    );
  }
}
