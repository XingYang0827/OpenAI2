import React, { useEffect, useState } from 'react';
import { Router, Switch, Redirect, Route } from "react-router-dom";
import { Auth } from 'aws-amplify';
import { ThemeProvider } from 'styled-components';
import { withAuthenticator } from '@aws-amplify/ui-react';
import awsconfig from './aws-exports';

import Header from './Header';
import Search from './Search';
import Dashboard from './Dashboard';
import colors from 'tailwindcss/colors' 
import Tool from './Core/Tool';
import Chat from './Core/Chat';
import Login from './Login/Login';
import Profile from './Profile/';
import LoginSuccess from './Login/Success';

import './App.scss';

Amplify.configure(awsconfig);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState({});
  const [redirect, setRedirect] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        if (user) {
          setProfile(user.attributes);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.log(err);
      }
    };
    init();
  }, []);

  return (
    <ThemeProvider theme={colors}>
      <Router>
        {redirect ? <Redirect to={redirect} /> : null}
        {isLoggedIn ? (
          <>
            <Switch>
              <Route path="/writing/document"><div /></Route>
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
};

export default withAuthenticator(App);
