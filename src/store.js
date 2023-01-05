import { observable, computed, makeObservable } from 'mobx';
import { Auth } from 'aws-amplify';
import FuzzySet from 'fuzzyset';
import Filter from 'bad-words';
import TOOLS from './tools';
import config from './config';

let filterBadWords = new Filter();

let baseURL = config.baseURL;

makeObservable(this);

const FuzzySearch = FuzzySet([...TOOLS.map((tool) => tool.title)]);

class appStore {
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
  }

  init = async () => {
    try {
      this.referralTrackingCode();
      const user = await Auth.currentAuthenticatedUser();
      if (user) {
        this.setProfile(user);
        this.isLoggedIn = true;
        this.refreshProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  referralTrackingCode = async () => {
    let referral = new URLSearchParams(window.location.search).get('referral');
    if (referral) {
      this.setReferral(referral);
    } else {
      this.initReferral();
    }
  };

  setReferral = async (referral) => {
    this.referral = referral;
    localStorage.setItem('referral', JSON.stringify(referral));
  };

  initReferral = async () => {
    const referral = localStorage.getItem('referral');
    this.referral = referral;
  };

  login = async (username, password) => {
    try {
      const user = await Auth.signIn(username, password);
      this.setProfile(user);
      this.isLoggedIn = true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  refreshProfile = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      this.setProfile(user);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  logout = async () => {
    try {
      await Auth.signOut();
      this.isLoggedIn = false;
      this.profile = {};
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  handleLogout = () => {
	this.logout();
	this.redirect = '/login';
  };

  setToken = (token) => {
    this.api.defaults.headers.common['x-access-token'] = token;
  };

  setProfile = (profile) => {
    this.profile = profile;
    localStorage.setItem('profile', JSON.stringify(profile));
  };

  noCreditsRemainPrompt = () => {
    // set the browser url to the no-credits page
    window.location.pathname = '/my-profile';
  };
}

export default new appStore();

  
