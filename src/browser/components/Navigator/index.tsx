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
import classNames from 'classnames';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';

import FolderOpenOutlined from '@material-ui/icons/FolderOpenOutlined';
import AddBoxOutlined from '@material-ui/icons/AddBoxOutlined';
import ArrowLeft from '@material-ui/icons/ArrowLeft';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import File from './File';
import { ApplicationState } from '../../store/index';
import { ContractSrcFile } from '../../store/fs/types';
import * as fsActions from '../../store/fs/actions';
import { extractDefault } from '../../util/storage';

const ZDrawer = styled(Drawer)`
  overflow: hidden;
  & .paper {
    position: relative;
    width: 300px;
  }

  & .closed {
    margin-right: -250px;
  }

  & .adder {
    margin: 1em;
  }

  .subheader {
    display:flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fafafa;
    font-weight:500;

    .actions {
      display:flex;
      align-items: center;

      .clickable {
        opacity: 0.5;
        transition: all 0.2s ease-in-out;
        &:hover {
          cursor: pointer;
          opacity: 1;
        }
      }
    }
    
  }
`;

const Arrow = styled(ArrowLeft)`
  && {
    width: 100%;
    font-size: 14px;
    transition: transform 20ms ease-out;
    &.closed {
      transform: rotate(180deg);
    }
  }
`;

const Closer = styled.div`
  background: #efefef;
  display: flex;
  align-items: center;
  position: relative;
  width: 2px;
  transition: all .2s ease-in-out;
  cursor: w-resize;

  &:hover {
    width: 20px;
  }

  & .closer-icon {
    width: 20px;
    font-size: 20px;
    cursor: pointer;
  }
`;

interface OwnProps {
  isOpen: boolean;
  toggle: () => void;
}

interface MappedProps {
  error: boolean;
  isLoading: boolean;
  contracts: ContractSrcFile[];
  activeContract: string;
}

interface DispatchProps {
  init: typeof fsActions.init;
  addContract: typeof fsActions.add;
  selectContract: typeof fsActions.setSelectedContract;
  updateContract: typeof fsActions.update;
  deleteContract: typeof fsActions.deleteContract;
}

type Props = OwnProps & MappedProps & DispatchProps;

interface State {
  isAdding: boolean;
}

class Navigator extends React.Component<Props, State> {
  state: State = {
    isAdding: false,
  };

  componentDidMount() {
    this.props.init();
  }

  toggle: React.MouseEventHandler<SVGSVGElement | HTMLDivElement> = (e) => {
    e.preventDefault();
    this.props.toggle();
  };

  handleNew = (e: React.MouseEvent<HTMLButtonElement | SVGSVGElement>) => {
    e.preventDefault();
    this.setState({ isAdding: true });
  };

  handlePersist = (displayName: string, id?: string) => {
    if (this.state.isAdding) {
      // dispatch add contract
      this.props.addContract(displayName, '');
      this.setState({ isAdding: false });
      return;
    }

    const { contracts } = this.props;

    if (id) {
      const [active] = contracts.filter((ctr) => ctr.id === id);
      this.props.updateContract(id, displayName, active.code);
    }
  };

  handleSelect = (id: string) => {
    // don't select an already-active contract
    if (this.props.activeContract !== id) {
      this.props.selectContract(id);
      return;
    }
  };

  handleDelete = (id: string) => {
    this.props.deleteContract(id);
  };

  render() {
    const { isAdding } = this.state;
    const { isOpen } = this.props;

    return (
      <React.Fragment>
        <ZDrawer
          open={isOpen}
          anchor="left"
          variant="persistent"
          classes={{ paper: classNames('paper', isOpen ? 'open' : 'closed') }}
        >
          <List dense subheader={<ListSubheader className="subheader" component="div">
            Files
            <div className="actions">
              <AddBoxOutlined className="clickable" onClick={this.handleNew} />
              <FolderOpenOutlined className="clickable" />
            </div>
          </ListSubheader>}>
            {isAdding ? (
              <File
                key="pending"
                id=""
                name=""
                handlePersist={this.handlePersist}
                handleSelect={this.handleSelect}
                handleDelete={this.handleDelete}
              />
            ) : null}
            {extractDefault(this.props.contracts).map((file) => {
              return (
                <File
                  key={file.id}
                  id={file.id}
                  name={file.displayName}
                  isSelected={file.id === this.props.activeContract}
                  handlePersist={this.handlePersist}
                  handleSelect={this.handleSelect}
                  handleDelete={this.handleDelete}
                />
              );
            })}
          </List>
          <List dense subheader={<ListSubheader className="subheader" component="div">
            Deployed Contracts
          </ListSubheader>}>
            <ListItem>
              <ListItemText primary="zil1n7eej0xz35exrpwv8jdluvvepyk09qfnsy5j6s" secondary="3 min ago (HelloWorld.scilla)" />
            </ListItem>
          </List>
        </ZDrawer>
        <Closer onClick={this.toggle}>
          <Arrow
            classes={{ root: classNames('closer-icon', !isOpen && 'closed') }}
            onClick={this.toggle}
          />
        </Closer>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  init: () => dispatch(fsActions.init()),
  addContract: (name: string, code: string) => dispatch(fsActions.add(name, code)),
  selectContract: (name: string) => dispatch(fsActions.setSelectedContract(name)),
  updateContract: (id: string, displayName: string, code: string) =>
    dispatch(fsActions.update(id, displayName, code)),
  deleteContract: (id: string) => dispatch(fsActions.deleteContract(id)),
});

const mapStateToProps = (state: ApplicationState) => {
  const contractsArr: ContractSrcFile[] = Object.keys(state.fs.contracts).map((address) => {
    return state.fs.contracts[address];
  });

  return {
    contracts: contractsArr,
    isLoading: state.fs.loading,
    error: state.fs.error,
    activeContract: state.fs.activeContract,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Navigator);
