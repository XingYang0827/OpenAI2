import axios from 'axios'
import { observable, computed, makeObservable } from 'mobx'
import { configure } from "mobx"
import FuzzySet from 'fuzzyset'
import Filter from 'bad-words'
import { Auth } from 'aws-amplify'

import TOOLS from './tools'
import config from './config'

let filterBadWords = new Filter()

let baseURL = config.baseURL

configure({  enforceActions: "never", })

let api = axios.create({ baseURL, });

const FuzzySearch = FuzzySet([...TOOLS.map(tool => tool.title)]);

class appStore {

	api = api
	@observable baseURL = baseURL
	@observable redirect = ``
	@observable editor
	@observable editorIsLoading = true

	// User Profile
	@observable profile = {}
	@observable isLoggedIn = false
	@observable loginLoading = false
	
	@observable landingPageUrl = config.landingPageUrl
	
	editor

	constructor(){
		makeObservable(this);
		this.init()
		// Check credits every time, and log out people who aren't authenticated
		this.api.interceptors.response.use((response) => {
			this.updateCredits(response)
			return response;
		}, (error) => {
			console.log(error)
			console.log(`error.response.statusText`,error.response.statusText)
			if (error.response && error.response.statusText === "Token Authentication Failed") {
				this.handleLogout()
			}
			if (error.response && error.response.statusText === "No Credit Remaining") {
				this.noCreditsRemainPrompt()
			}
			return Promise.reject(error);
		});
		
	}

	noCreditsRemainPrompt = () => {
		Auth.signOut()
		this.redirect = '/my-profile'
	}
	
	init = async () => {
		try {
			this.referralTrackingCode()
			const session = await Auth.currentSession()
			if (session) {
				this.api.defaults.headers.common['Authorization'] = session.getIdToken().getJwtToken()
				const idToken = session.getIdToken()
				const accessToken = session.getAccessToken()
				this.profile = idToken.payload
				this.isLoggedIn = true
				this.refreshTokenAndProfile(accessToken)
			}
		} catch (err){
			console.log(err)
		}
	}

	@observable referral = ""

	referralTrackingCode = async () => {
		let referral = new URLSearchParams(window.location.search).get("referral")
		if(referral){
			await Auth.updateUserAttributes({ referral })
			this.setReferral(referral)
		} else {
			const userInfo = await Auth.currentUserInfo()
			if (userInfo && userInfo.attributes && userInfo.attributes.referral) {
				this.setReferral(userInfo.attributes.referral)
			} else {
				this.initReferral()
			}
		}
	}

	setReferral = async (referral) => {
		this.referral = referral
		await Auth.updateUserAttributes({ referral })
	}
	
	initReferral = async () => {
		const userInfo = await Auth.currentUserInfo()
		if (userInfo && userInfo.attributes && userInfo.attributes.referral) {
			this.referral = userInfo.attributes.referral
		}
	}	
	
	loginWithDataTokenAndProfile = async (data) => {
		await Auth.signIn(data.profile.email, data.token)
		this.setProfile(data.profile)
		this.isLoggedIn = true
	}

	refreshTokenAndProfile = async (accessToken) => {
		try {
			const session = await Auth.currentSession()
			const idToken = session.getIdToken()
			accessToken = session.getAccessToken()
			this.setProfile(idToken)
		} catch (err) {
			console.log(err)
		}
	}

	updateCredits = (response) => {
		if(response.data.credits) {
			this.setProfile({...this.profile, credits: response.data.credits})
		}
	}

	setToken = (accessToken) => {
		Auth.updateCachedItem({ accessToken })
		this.api.defaults.headers.common['Authorization'] = accessToken.getJwtToken()
	}

	setProfile = (idToken) => {
		this.profile = idToken.payload
	}
	
	handleLogout = () => {
		this.profile = {}
		this.isLoggedIn = false
		Auth.signOut()
		this.redirect = `/`
	}

	fuzzySearch = (string) => {
		let result = FuzzySearch.get(string);
		if(result){
			result = result[0][1]
			let searchResults = TOOLS.find(tool => tool.title === result)
			if(searchResults){
				return searchResults
			}
		}
		return false
	}
	
	isBadWord = (string) => {
		return filterBadWords.check(string)
	}
}

const store = new appStore();

export default store

