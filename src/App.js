
import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
} from "react-router-dom";
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Amplify, Auth, API, Analytics } from 'aws-amplify';
import awsconfig from './aws-exports';
import { ThemeProvider } from 'styled-components';
import colors from 'tailwindcss/colors';

import Header from './Header';
import Search from './Search';
import Dashboard from './Dashboard';
import Tool from './Core/Tool';
import Chat from './Core/Chat';
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

    </ThemeProvider>
  );
};

export default withAuthenticator(App);
