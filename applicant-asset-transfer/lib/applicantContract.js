'use strict';

let Applicant = require('./Applicant.js');
const crypto = require('crypto');
const PrimaryContract = require('./primary-contract.js');
const { Context } = require('fabric-contract-api');


class ApplicantContract extends PrimaryContract {

    async readApplicant(ctx, applicantId) {
    	const exists = await this.applicantExists(ctx, aId);
        if (!exists) {
            throw new Error(`The applicant ${aId} does not exist`);
        }

        const buffer = await ctx.stub.getState(aId);
        let asset = JSON.parse(buffer.toString());
        asset = ({
            applicantId: asset.applicantId,
            email : asset.email,
            name : asset.name,
            address : asset.address,
            pin : asset.pin,
            state : asset.state,
            country : asset.country,
            contact : asset.contact,
            dateOfBirth : asset.dateOfBirth,
            documents : asset.documents,
            permissionGranted : asset.permissionGranted,
            currentOrganization : asset.currentOrganization
        });
        return asset;
    }


    async getApplicantPersonalDetails(ctx, id) {
    }

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

    async getDocument(ctx, documentId) {
        
    }

    async getApplicantHistory(ctx, applicantId) {
        let resultsIterator = await ctx.stub.getHistoryForKey(applicantId);
		let asset = await this.getAllApplicantResults(resultsIterator, true);

		return this.fetchLimitedFields(asset, true);
	    }
    };

    async grantAccessToOrganization(ctx, organizationId) {
        
    };

    async revokeAccessFromOrganization(ctx, organizationId) {
    };
}
module.exports = ApplicantContract;
