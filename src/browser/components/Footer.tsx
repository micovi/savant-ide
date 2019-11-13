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
import styled from 'styled-components';
import { withTheme, WithTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const Wrapper = styled.div`
  background-color: #efefef;
  opacity: 0.5;
  display: flex;
  justify-content:space-between;
  padding: 0.5em;
  transition: all 0.2s ease-in-out;

  .announcement {
    display: flex;
    align-items: center;
  }

  &:hover {
    opacity: 1;
  }
`;

class Footer extends React.Component<WithTheme> {
  render() {
    return (
      <Wrapper>
        <div className="announcement">
          <span style={{ fontSize: '0.5rem', fontWeight: 'bold' }}>LOG:</span>
          <Typography>
            Contract successfully deployed with address zil1n7eej0xz35exrpwv8jdluvvepyk09qfnsy5j6s (3 min ago)
          </Typography>
        </div>
        <Typography variant="subheading" color="primary" style={{ fontWeight: 500 }}>
          Current Block: 123123
        </Typography>
      </Wrapper>
    );
  }
}

export default withTheme()(Footer);
