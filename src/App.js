import { Auth } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import React, { useState, useEffect } from 'react';
import { Router, Switch, Redirect, Route } from "react-router-dom";
import { ThemeProvider } from 'styled-components';
import colors from 'tailwindcss/colors';

import Header from './Header';
import Search from './Search';
import Dashboard from './Dashboard';
import Tool from './Core/Tool';
import Chat from './Core/Chat';
import Login from './Login/Login';
import Profile from './Profile/';
import LoginSuccess from './Login/Success';

import './App.scss';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [redirect, setRedirect] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function checkUser() {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setIsAuthenticated(true);
        setProfile(user.attributes);
      } catch (error) {
        setIsAuthenticated(false);
      }
    }
    checkUser();
  }, []);

  return (
    <ThemeProvider theme={colors}>
      <Router>
        {redirect ? <Redirect to={redirect} /> : null }
        {isAuthenticated ? (
          <>
            {profile.status ? (
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
                  <Route path="/signup/success" component={LoginSuccess} />
                </Switch>
              </>
            ) : (
              <>
                {/* Render routes and views for users without a paid plan */}
              </>
            )}
          </>
        ) : (
          <>
            <Switch>
              <Route path="/" exact>
                <Redirect to="/login" />
              </Route>
              <Route path="/" component={Login} />
            </Switch>
          </>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default withAuthenticator(App);
