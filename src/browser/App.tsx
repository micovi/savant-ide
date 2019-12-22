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

import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import Navigator from './components/Navigator';
import ScillaEditor from './components/Editor';
import Runner from './components/Runner';
import Footer from './components/Footer';
import Topbar from './components/Topbar';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#ffa910',
      main: '#ea8b0c',
      dark: '#009090',
      contrastText: '#000000',
    },
    secondary: {
      light: '#2e4cb4',
      main: '#6977e7',
      dark: '#9ea6ff',
      contrastText: '#000000',
    },
  },
  typography: {
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  overrides: {
    MuiButton: {
      root: {
        /* background: 'linear-gradient(45deg, #42c1c0 30%, #6977e7 90%)', */
      },
    },
  },
});

const Wrapper = styled.div`
  flex-grow: 1;
  z-index: 1;
  position: relative;
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

interface Props {
  store: Store<any>;
}

interface State {
  isRunnerOpen: boolean;
  isNavigatorOpen: boolean;
}

class App extends React.Component<Props, State> {
  state: State = {
    isRunnerOpen: true,
    isNavigatorOpen: true,
  };

  toggleRunner = () => {
    this.setState({ isRunnerOpen: !this.state.isRunnerOpen });
  };

  toggleNavigator = () => {
    this.setState({ isNavigatorOpen: !this.state.isNavigatorOpen });
  };

  render() {
    return (
      <Provider store={this.props.store}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Topbar />
          <Wrapper className="App">
            <Navigator toggle={this.toggleNavigator} isOpen={this.state.isNavigatorOpen} />
            <ScillaEditor />
            <Runner toggle={this.toggleRunner} isOpen={this.state.isRunnerOpen} />
          </Wrapper>
          <Footer />
        </MuiThemeProvider>
      </Provider>
    );
  }
}

export default App;
