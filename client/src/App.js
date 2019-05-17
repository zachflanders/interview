import React from 'react';
import './App.css';
import {BrowserRouter} from 'react-router-dom'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MainRouter from './MainRouter';


const theme = createMuiTheme({
  palette:{
    primary: {
      main: '#3498db',
      contrastText: '#fff',
    }
  }
});

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <BrowserRouter>
        <MainRouter />
      </BrowserRouter>
    </MuiThemeProvider>
  );
}

export default App;
