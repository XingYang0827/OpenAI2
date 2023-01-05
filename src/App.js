import React, { Component } from 'react';
import { AmplifyAuthenticator, AmplifySignUp, AmplifySignIn } from '@aws-amplify/ui-react';
import { Router, Switch, Redirect, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'mobx-react';
import { observer } from 'mobx-react';

import AppStore from './store';
import colors from 'tailwindcss/colors';

import Header from './Header';
import Search from './Search';
import Dashboard from './Dashboard';
import Tool from './Core/Tool';
import Chat from './Core/Chat';
import LoginSuccess from './Login/Success';

import './App.scss';

if (!window.store) {
  window.store = new AppStore();
}

@observer
class App extends Component {
  render() {
    return (
      <AmplifyAuthenticator>
        <Switch>
          {window.store.isLoggedIn ? (
            <>
              {window.store.profile.status ? (
                <>
                  <Switch>
                    <Route path="/writing/document">
                      <div />
                    </Route>
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
                    <Route path="/signup/success" component={LoginSuccess} />
                  </Switch>
                </>
              ) : (
                <>{/* Logged in but no plan */}</>
              )}
            </>
          ) : (
            <>
              {/* Not Logged In */}
              <Switch>
                <Route path="/" exact>
                  <Redirect to="/login" />
                </Route>
                <Route path="/" component={AmplifySignIn} />
              </Switch>
            </>
          )}
        </Switch>
      </AmplifyAuthenticator>
    );
  }
}

export default () => (
  <ThemeProvider theme={colors}>
    <Provider store={window.store}>
      <App />
    </Provider>
  </ThemeProvider>
);
