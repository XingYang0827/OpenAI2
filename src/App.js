
import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
} from "react-router-dom";
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Amplify, Auth, API, Analytics } from 'aws-amplify';
import { ThemeProvider } from 'styled-components';
import colors from 'tailwindcss/colors';
import awsconfig from './aws-exports';

import Header from './Header';
import Search from './Search';
import Dashboard from './Dashboard';
import Tool from './Core/Tool';
import Chat from './Core/Chat';
import Profile from './Profile/';
import LoginSuccess from './Login/Success';

import './App.scss';

Amplify.configure(awsconfig);

@withAuthenticator
class App extends Component {
  render() {
    const user = Auth.currentAuthenticatedUser();
    return (
      <ThemeProvider theme={colors}>
        <Router>
          {!user ? <Redirect to="/login" /> : null}
          <Switch>
            <Route path="/" exact component={Dashboard} />
            <Route path="/search" exact component={Search} />
            <Route path="/my-profile" component={Profile} />
            <Route path="/signup/failed" component={Profile} />
            <Route path="/signup/success" component={LoginSuccess} />
            <Route path="/ai/">
              <Switch>
                <Route path="/ai/code/debugging" component={Chat} />
                <Route component={Tool} />
              </Switch>
            </Route>
            <Route path="/login" component={Auth} />
            <Route component={Header} />
          </Switch>
        </Router>
      </ThemeProvider>
    );
  }
}

export default withAuthenticator(App);
