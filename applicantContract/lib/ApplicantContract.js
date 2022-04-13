'use strict';

let Applicant = require('./Applicant.js');
const crypto = require('crypto');
const PrimaryContract = require('./primary-contract.js');
const { Context } = require('fabric-contract-api');

class ApplicantContract extends PrimaryContract {
	
	async updateApplicantPersonalDetails(ctx, args) {
		args = JSON.parse(args);
		let isDataChanged = false;
		let applicantId = args.applicantId;
		let newName = args.name;
		let newEmail = args.email;
		let newAddress = args.address;
		let newPin = args.pin;
		let newState = args.state;
		let newCountry = args.country;
		let newContact = args.contact;

		const applicant = await this.readApplicant(ctx, applicantId)
		if (newName !== null && newName !== '' && applicant.name !== newName) {
		    applicant.name = newName;
		    isDataChanged = true;
		}

		if (newEmail !== null && newEmail !== '' && applicant.email !== newEmail) {
		    applicant.email = newEmail;
		    isDataChanged = true;
		}

		if (newAddress !== null && newAddress !== '' && applicant.address !== newAddress) {
		    applicant.address = newAddress;
		    isDataChanged = true;
		}

		if (newPin !== null && newPin !== '' && applicant.pin !== newPin) {
		    applicant.pin = newPin;
		    isDataChanged = true;
		}

		if (newState !== null && newState !== '' && applicant.state !== newState) {
		    applicant.state = newState;
		    isDataChanged = true;
		}
		
		if (newCountry !== null && newCountry !== '' && applicant.country !== newCountry) {
		    applicant.country = newCountry;
		    isDataChanged = true;
		}
		
		if (newContact !== null && newContact !== '' && applicant.contact !== newContact) {
		    applicant.contact = newContact;
		    isDataChanged = true;
		}
		
		if (isDataChanged === false) return;

		const buffer = Buffer.from(JSON.stringify(applicant));
		await ctx.stub.putState(applicantId, buffer);
	    }	
    
    
    /*async getApplicantPassword(ctx, applicantId) {
		let applicant = await this.readApplicant(ctx, applicantId);
		applicant = ({
		    password: applicant.password,
		    pwdTemp: applicant.pwdTemp})
		return applicant;
	    }*/

    //Retrieves applicant medical history based on applicantId
    async getApplicantHistory(ctx, applicantId) {
		let resultsIterator = await ctx.stub.getHistoryForKey(applicantId);
		let asset = await this.getAllApplicantResults(resultsIterator, true);

		return this.fetchLimitedFields(asset, true);
	    }
		
}
