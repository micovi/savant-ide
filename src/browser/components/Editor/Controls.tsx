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

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Info from '@material-ui/icons/Info';
import Save from '@material-ui/icons/Save';
import Send from '@material-ui/icons/Send';
import styled from 'styled-components';
import { Keymap } from './index';
import { clearEvent } from '../../store/contract/actions';
import * as blockchainActions from '../../store/blockchain/actions';
import { Event } from '../../store/contract/types';
import { ContractSrcFile } from '../../store/fs/types';
import { Button } from '@material-ui/core';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

interface Props {
  activeFile: ContractSrcFile;
  blockNum: number;
  blockTime: number;
  canSave: boolean;
  clearEvent: typeof clearEvent;
  events: { [id: string]: Event };
  fontSize: number;
  keyMap: Keymap;
  isChecking: boolean;
  getKeyboardShortcuts: () => Array<{ key: string; command: string }>;
  handleCheck: () => void;
  handleSave: () => void;
  handleSetFontSize: (size: number) => void;
  handleSetKeymap: (keymap: Keymap) => void;
  handleUpdateBlockNum: typeof blockchainActions.updateBnum;
  handleUpdateBlockTime: typeof blockchainActions.updateBlkTime;
}

interface State {
  isNukeDialogOpen: boolean;
  isSettingsDialogOpen: boolean;
}

export default class EditorControls extends React.Component<Props, State> {
  state: State = {
    isNukeDialogOpen: false,
    isSettingsDialogOpen: false,
  };

  handleSave: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    this.props.handleSave();
  };

  handleCheck: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    this.props.handleCheck();
  };

  toggleNukeDialog = () => {
    this.setState({ isNukeDialogOpen: !this.state.isNukeDialogOpen });
  };

  handleNuke = () => {
    indexedDB.deleteDatabase('scilla-ide');
    document.location.reload();
  };

  toggleSettingsDialog = () => {
    this.setState({ isSettingsDialogOpen: !this.state.isSettingsDialogOpen });
  };

  render() {
    const { activeFile } = this.props;
    const isContractSelected = !!activeFile.displayName.length;

    return (
      (isContractSelected && this.props.canSave) ?
        <Toolbar variant="dense">
          <Container>
            <Typography align="center" className="save-alert" color="primary" style={{ display: 'flex', alignItems: 'center' }}>
              <Info /> Remeber to save changes (Shortcut: Ctrl/Cmd + S)
            </Typography>
            <Container>
              <Info />
            </Container>
          </Container>
        </Toolbar>
        :
        <Toolbar variant="dense">
          <Container style={{ justifyContent: 'flex-end' }}>
            <Button color="default">
              <Save />
            </Button>
            <Button color="default">
              <Send />
            </Button>
         </Container>
        </Toolbar>
    );
  }
}
