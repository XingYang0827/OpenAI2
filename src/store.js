
import { configure } from 'mobx';
import FuzzySet from 'fuzzyset';
import Filter from 'bad-words';
import { Auth } from 'aws-amplify';
import config from './config';
import awsconfig from './aws-exports';
import { withAuthenticator } from '@aws-amplify/ui-react';

Amplify.configure(awsconfig);

let filterBadWords = new Filter();

let baseURL = config.baseURL;

configure({ enforceActions: 'never' });

const FuzzySearch = FuzzySet([...TOOLS.map((tool) => tool.title)]);

class appStore {
  api = api;
  baseURL = baseURL;
  @observable redirect = '';
  @observable editor;
  @observable editorIsLoading = true;

  // User Profile
  @observable profile = {};
  @observable isLoggedIn = false;
  @observable loginLoading = false;

  @observable landingPageUrl = config.landingPageUrl;

  editor;

  constructor() {
    this.init();
    // Check credits every time, and log out people who aren't authenticated
  }

  init = async () => {
    try {
      this.referralTrackingCode();
      const user = await Auth.currentAuthenticatedUser();
      if (user) {
        this.setProfile(user.attributes);
        this.isLoggedIn = true;
        this.refreshTokenAndProfile();
      }
    } catch (err) {
      console.log(err);
    }
  };

  loginWithDataTokenAndProfile = async (data) => {
    this.setToken(data.token);
    this.setProfile(data.profile);
    this.isLoggedIn = true;
  };

  refreshTokenAndProfile = async () => {
    try {
      let data = await this.api
        .post('/user/refresh/profile')
        .then(({ data }) => data);
      this.setToken(data.token);
      this.setProfile(data.profile);
    } catch (err) {
      console.log(err);
    }
  };

  setToken = (token) => {
    this.api.defaults.headers.common['x-access-token'] = token;
    // Store the token in Cognito instead of local storage
    Auth.completeNewPassword(Auth.currentAuthenticatedUser(), token)
      .then(user => console.log(user))
      .catch(err => console.log(err));
  };

  setProfile = (profile) => {
    this.profile = profile;
    // Store the profile in Cognito instead of local storage
    Auth.updateUserAttributes(Auth.currentAuthenticatedUser(), profile)
      .then(user => console.log(user))
      .catch(err => console.log(err));
  };

  handleLogout = () => {
    // Clear the token and profile from Cognito instead of local storage
    Auth.signOut()
      .then(() => {
        this.isLoggedIn = false;
        this.profile = {};
        this.api.defaults.headers.common['x-access-token'] = '';
      })
      .catch(err => console.log(err));
  };
}
