import { ThemeProvider } from 'styled-components'
import React, { Component } from 'react';
import { observer } from 'mobx-react'
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Router, Switch, Redirect, Route } from "react-router-dom";
import { Provider } from 'mobx-react';

import AppStore from './store'
import colors from 'tailwindcss/colors' 
import Header from './Header'
import Search from './Search'
import Dashboard from './Dashboard'
import Tool from './Core/Tool'
import Chat from './Core/Chat'
import Login from './Login/Login'
import Profile from './Profile/'
import LoginSuccess from './Login/Success'

import './App.scss'

if(!window.store){
  window.store = new AppStore();
}

@observer
class App extends Component {
  render() {
    return (
      <ThemeProvider theme={colors}>
        <Provider store={window.store}>
          <Router>
            {window.store.redirect ? <Redirect to={window.store.redirect} /> : null }
            {window.store.isLoggedIn ? (
              <>
                <Switch>
                  <Route path="/writing/document"><div/></Route>
                  <Route component={Header} />
                </Switch>
                <Switch>
                  <Route path="/" exact component={Dashboard} />
                  <Route path="/search" exact component={Search} />
                  <Route path="/ai/">
                    <Switch>
                      <Route path="/ai/code/debugging" component={Chat} />
                      <Route component={Tool} />
                    </Switch>
                  </Route>
                  <Route path="/my-profile" component={Profile} />
                  <Route path="/signup/failed" component={Profile} />
                  <Route path="/signup/success" component={LoginSuccess} />
                </Switch>
              </>
            ) : (
              <Switch>
                <Route path="/" exact>
                  <Redirect to="/login" />
                </Route>
                <Route path="/" component={Login} />
              </Switch>
            )}
          </Router>
        </Provider>
      </ThemeProvider>
    )
  }
}

export default withAuthenticator(App);
