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
import AceEditor from 'react-ace';
// @ts-ignore
import * as brace from 'brace';
import 'brace/ext/searchbox';
import 'brace/ext/keybinding_menu';
import 'brace/keybinding/emacs';
import 'brace/keybinding/vim';
import 'brace/theme/tomorrow';
import './scilla_mode';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import Measure, { ContentRect } from 'react-measure';
import styled from 'styled-components';

import Controls from './Controls';
import Notification from './Notification';
import Statusline from './StatusLine';
import config from '../../config';
import * as blockchainActions from '../../store/blockchain/actions';
import * as contractActions from '../../store/contract/actions';
import * as fsActions from '../../store/fs/actions';
import { ApplicationState } from '../../store/index';
import { ContractSrcFile } from '../../store/fs/types';
import { Event } from '../../store/contract/types';

const Editor = styled(AceEditor)`
  .error-marker {
    position: absolute;
  }

  .error-marker:after {
    position: relative;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1.5px;
    background: linear-gradient(45deg, transparent, transparent 49%, red 49%, transparent 51%);
  }
`;

const Wrapper = styled.div`
  flex: 1;
  min-width: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  
  .ace_scrollbar {
    margin-right: -20px;
  }
`;

const getKeyboardShortcuts: (
  editor: any,
) => Array<{ key: string; command: string }> = brace.acequire(
  'ace/ext/menu_tools/get_editor_keyboard_shortcuts',
).getEditorKeybordShortcuts;

interface OwnProps {}
interface MappedProps {
  blocknum: number;
  blockTime: number;
  contract: ContractSrcFile;
  events: { [id: string]: Event };
}

interface DispatchProps {
  updateBnum: typeof blockchainActions.updateBnum;
  updateBlkTime: typeof blockchainActions.updateBlkTime;
  clearEvent: typeof contractActions.clearEvent;
  check: typeof fsActions.check;
  update: typeof fsActions.update;
}

type Props = OwnProps & MappedProps & DispatchProps;

export type Keymap = 'vim' | ' emacs' | 'standard';

interface State {
  contract: ContractSrcFile;
  cursorPos: { line: number; col: number };
  dimensions: { width: number; height: number };
  editorFontSize: number;
  editorKeymap: Keymap;
  isChecking: boolean;
  notifications: any[];
  snackbar: { open: boolean; message: any; key: number };
}

class ScillaEditor extends React.Component<Props, State> {
  static getDerivedStateFromProps(props: Props, state: State) {
    // the contract has been deleted; clear state.
    if (!props.contract) {
      return { ...state, contract: { id: '', displayName: '', code: '' } };
    }

    // a new contract has been loaded.
    if (
      state.contract &&
      (state.contract.id !== props.contract.id ||
        state.contract.displayName !== props.contract.displayName)
    ) {
      return { ...state, contract: props.contract };
    }

    // the contract was checked, and an error occurred.
    if (state.contract && state.contract.error !== props.contract.error) {
      return { ...state, contract: { ...state.contract, error: props.contract.error } };
    }

    return null;
  }

  editor = React.createRef<AceEditor>();

  state: State = {
    contract: {
      id: '',
      displayName: '',
      code: '',
      error: null,
    },
    cursorPos: { line: 0, col: 0 },
    dimensions: {
      height: -1,
      width: -1,
    },
    editorFontSize: parseInt(localStorage.getItem(config.LS_FSIZE) || '16', 10),
    editorKeymap: (localStorage.getItem(config.LS_KEYMAP) as Keymap) || 'standard',
    isChecking: false,
    notifications: [],
    snackbar: { open: false, message: null, key: 0 },
  };

  getKeyboardShortcuts = (): Array<{ key: string; command: string }> => {
    if (this.editor.current) {
      return getKeyboardShortcuts((this.editor.current as any).editor);
    }

    return [];
  };

  handleCheck = () => {
    const { check } = this.props;
    const { contract } = this.state;
    this.setState({ isChecking: true });
    check(contract.code, this.handleCheckRes);
  };

  handleCheckRes = (res: any) => {
    this.setState((state) => ({
      notifications: state.notifications.concat([res]),
      isChecking: false,
    }));

    if (this.state.snackbar.open) {
      this.setState((state) => ({
        snackbar: { ...state.snackbar, open: false },
        isChecking: false,
      }));
      return;
    }

    this.handleDisplayNext();
  };

  handleCloseSnackbar = () => {
    this.setState({ snackbar: { ...this.state.snackbar, open: false } });
  };

  handleDisplayNext = () => {
    if (this.state.notifications.length) {
      const [head, ...tail] = this.state.notifications;

      this.setState({
        notifications: tail,
        snackbar: { open: true, message: head, key: new Date().getTime() },
      });

      return;
    }
  };

  handleSave = () => {
    const { update } = this.props;
    const { contract } = this.state;
    update(contract.id, contract.displayName, contract.code);
  };

  handleResize = (contentRect: ContentRect): void => {
    if (contentRect && contentRect.bounds) {
      const { height, width } = contentRect.bounds;
      this.setState({ dimensions: { height, width } });
    }
  };

  handleSetFontSize = (size: number): void => {
    this.setState({ editorFontSize: size }, () =>
      localStorage.setItem(config.LS_FSIZE, size.toString()),
    );
  };

  handleSetKeymap = (keymap: Keymap): void => {
    this.setState({ editorKeymap: keymap }, () => localStorage.setItem(config.LS_KEYMAP, keymap));
  };

  onChange = (value: string): void => {
    this.setState({ contract: { ...this.state.contract, code: value } });
  };

  onCursorChange = (selection: any): void => {
    this.setState({ cursorPos: { line: selection.lead.row + 1, col: selection.lead.column } });
  };

  getAnnotations = (): any => {
    const { contract } = this.state;
    if (contract.error && contract.error.message) {
      const markers = contract.error.message.map((err: any) => {
        const row = parseInt(err.line, 10);
        const col = parseInt(err.column, 10);

        return {
          row: row === 0 ? 0 : row - 1,
          col,
          type: 'error',
          text: err.msg,
        };
      });

      return markers;
    }

    return [];
  };

  render() {
    const { contract, snackbar } = this.state;

    return (
      <Measure bounds onResize={this.handleResize}>
        {({ measureRef }) => (
          <Wrapper innerRef={measureRef}>
            <Notification
              key={snackbar.key}
              onClose={this.handleCloseSnackbar}
              onExited={this.handleDisplayNext}
              open={snackbar.open}
              msg={
                snackbar.message && snackbar.message.result === 'success'
                  ? 'Type-checking succeeded.'
                  : 'Type-checking failed.'
              }
              variant={snackbar.message && snackbar.message.result}
            />
            <Controls
              activeFile={contract}
              blockNum={this.props.blocknum}
              blockTime={this.props.blockTime}
              clearEvent={this.props.clearEvent}
              canSave={this.props.contract && this.props.contract.code !== this.state.contract.code}
              events={this.props.events}
              fontSize={this.state.editorFontSize}
              keyMap={this.state.editorKeymap}
              isChecking={this.state.isChecking}
              getKeyboardShortcuts={this.getKeyboardShortcuts}
              handleCheck={this.handleCheck}
              handleSave={this.handleSave}
              handleSetFontSize={this.handleSetFontSize}
              handleSetKeymap={this.handleSetKeymap}
              handleUpdateBlockNum={this.props.updateBnum}
              handleUpdateBlockTime={this.props.updateBlkTime}
            />
            <Editor
              mode="scilla"
              theme="tomorrow"
              fontSize={this.state.editorFontSize}
              onChange={this.onChange}
              // @ts-ignore
              onCursorChange={this.onCursorChange}
              name="scilla-editor"
              annotations={this.getAnnotations()}
              height={`${this.state.dimensions.height.toString(10)}px`}
              width={`${this.state.dimensions.width.toString(10)}px`}
              value={contract.code}
              keyboardHandler={
                this.state.editorKeymap === 'standard' ? undefined : this.state.editorKeymap
              }
              editorProps={{ $blockScrolling: true }}
              readOnly={contract.id.length === 0}
              innerRef={this.editor}
            />
            <Statusline
              line={this.state.cursorPos.line}
              col={this.state.cursorPos.col}
            />
          </Wrapper>
        )}
      </Measure>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  update: (id: string, displayName: string, code: string) =>
    dispatch(fsActions.update(id, displayName, code)),
  check: (code: string, cb?: (res: any) => void) => dispatch(fsActions.check(code, cb)),
  clearEvent: (id: string) => dispatch(contractActions.clearEvent(id)),
  updateBnum: (num: number) => dispatch(blockchainActions.updateBnum(num)),
  updateBlkTime: (interval: number) => dispatch(blockchainActions.updateBlkTime(interval)),
});

const mapStateToProps = (state: ApplicationState) => ({
  blocknum: state.blockchain.blockNum,
  blockTime: state.blockchain.blockTime,
  contract:
    state.fs.activeContract && state.fs.activeContract.length > 1
      ? state.fs.contracts[state.fs.activeContract]
      : { id: '', displayName: '', code: '' },
  events: state.contract.events,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ScillaEditor);
