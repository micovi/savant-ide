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
import { connect } from 'react-redux';
import styled from 'styled-components';
import logo from '../../assets/scilla-logo-color-transparent.png';
import config from '../../config';

type Props = OwnProps;

const TopContainer = styled.div`
  background: #efefef;
  position: relative;
  top:0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  z-index:9999;
    padding-left: 1rem;
    padding-right: 1rem;
  .left-side {
      display: flex;
      flex-grow: 1;
     .title {
        padding: 0.5rem;
        border-right: 1px solid #ccc;
        margin-right: 1rem;
    }
  .item {
      padding: 0.5rem;
      color: #000;
      text-decoration: none;
      position: relative;

      &:hover {
          background-color: #ccc;
          cursor: pointer;
          .sub-menu {
              display: block;
          }
      }

      .sub-menu {
          display: none;
              width: 200px;
              position: absolute;
              background-color:#efefef;
          ul {
              list-style: none;
              padding:0;
          }
      }
  }
  }
`;

const Logo = styled.img`
  width: 28px;
`;

interface OwnProps {

}


class Runner extends React.Component<Props> {
    render() {
        return (
            <React.Fragment>
                <TopContainer>
                    <div className="left-side">
                        <Logo src={logo} />
                        <div className="title">
                            Savant IDE
                        </div>
                        <div className="item">
                            File
                            <div className="sub-menu">
                                <ul>
                                    <li>
                                        <div className="item">
                                            New (Ctrl / Cmd + N)
                                    </div>
                                    </li>
                                    <li>
                                        <div className="item">
                                            Open
                                    </div>
                                    </li>
                                    <li>
                                        <div className="item">
                                            Save (Ctrl / Cmd + S)
                                    </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="item">
                            Run / Deploy
                            <div className="sub-menu">
                                <ul>
                                    <li>
                                        <div className="item">
                                            Run Check (TBD)
                                        </div>
                                    </li>
                                    <li>
                                        <div className="item">
                                            Deploy contract (TBD)
                                        </div>
                                    </li>
                                    <li>
                                        <div className="item">
                                            Toggle Events
                                        </div>
                                    </li>
                                    <li>
                                        <div className="item">
                                            Toggle Console
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <a className="item" target="_blank" href={config.SCILLA_DOCS}>Scilla Docs</a>
                        <div className="item">Help</div>
                    </div>
                    <div className="right-side">
                        Network: Local
                    </div>
                </TopContainer>
            </React.Fragment>
        );
    }
}
export default connect()(Runner);
