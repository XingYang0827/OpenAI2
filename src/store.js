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
		// set the browser url to the no-credits page
		window.location.pathname = "/my-profile"
	}

	init = async () => {
		try {
			this.referralTrackingCode()
			const profile = localStorage.getItem("profile")
			const token = localStorage.getItem("token")
			if (profile && token) {
				this.api.defaults.headers.common['x-access-token'] = token;
				this.profile = JSON.parse(profile)
				this.isLoggedIn = true
				this.refreshTokenAndProfile()
			}
		} catch (err){
			console.log(err)
		}
	}

	@observable referral = ""

	referralTrackingCode = async () => {
		let referral = new URLSearchParams(window.location.search).get("referral")
		if(referral){
			this.setReferral(referral)
		} else {
			this.initReferral()
		}
	}

	setReferral = async (referral) => {
		this.referral = referral
		localStorage.setItem("referral", JSON.stringify(referral))
	}
	
	initReferral = async () => {
		const referral = localStorage.getItem("referral")
		this.referral = referral
	}

	
	loginWithDataTokenAndProfile = async (data) => {
		await Auth.signIn(data.profile.email, data.token)
		this.setProfile(data.profile)
		this.isLoggedIn = true
	}

	refreshTokenAndProfile = async () => {
		try {
			let data = await this.api
				.post('/user/refresh/profile')
				.then(({ data }) => data)
			if(data){
				this.setProfile(data.profile)
			}
		} catch (err){
			console.log(err)
		}
	}

	updateCredits = (response) => {
		if(response.data.credits) {
			this.setProfile({...this.profile, credits: response.data.credits})
		}
	}

	setToken = (token) => {
		localStorage.setItem("token", token)
		this.api.defaults.headers.common['x-access-token'] = token
	}
	setProfile = (profile) => {
		localStorage.setItem("profile", JSON.stringify(profile))
		this.profile = profile
	}

	handleLogout = () => {
		localStorage.removeItem("profile");
		localStorage.removeItem("token");
		this.profile = {}
		this.isLoggedIn = false
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

