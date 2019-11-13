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
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';

const StatusWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 6px 8px;
  position: absolute;
  bottom: 0;
  right: 0;
  z-index:999;
`;

interface Props {
  line: number;
  col: number;
}

const Statusline: React.SFC<Props> = ({ line, col }) => (
  <StatusWrapper>
    <Typography variant="body2">{`Ln ${line}, Col ${col}`}</Typography>
  </StatusWrapper>
);

export default Statusline;
