'use strict';

let Applicant = require('./Applicant.js');
const crypto = require('crypto');
const OrganizationContract = require('./organization-contract.js');
const { Context } = require('fabric-contract-api');


class OrganizationContract extends PrimaryContract {

    async getApplicant(ctx, applicantId) {
        return await super.getApplicant(ctx, patientId);
    }


    async createApplicant(ctx, args) {
    	args = JSON.parse(args);

        if (args.password === null || args.password === '') {
            throw new Error(`Empty or null values should not be passed for password parameter`);
        }

        let newApplicant = await new Applicant(args.applicantId, args.email, args.password, args.name, args.address, args.pin, args.state, args.country, args.contact, args.dateOfBirth, args.currentOrganization);
        const exists = await this.applicantExists(ctx, newApplicant.applicantId);
        if (exists) {
            throw new Error(`The applicant ${newApplicant.applicantId} already exists`);
        }
        const buffer = Buffer.from(JSON.stringify(newApplicant));
        await ctx.stub.putState(newApplicant.applicantId, buffer);
    }

    async getAllApplicants(ctx , orgId) {
    }

    async getDocuments(ctx, documentId) {
        
    }

    async getAllDocumentsSignedByOrganization(ctx, args) {
        let resultsIterator = await ctx.stub.getStateByRange('', '');
	    let asset = await this.getAllDocumentResults(resultsIterator, false);
	    const permissionedAssets = [];
	    for (let i = 0; i < asset.length; i++) {
		const obj = asset[i];
		if ('permissionGranted' in obj.Record && obj.Record.permissionGranted.includes(organizationId)) {
		    permissionedAssets.push(asset[i]);
		}
	    }

	    return this.fetchLimitedFields(permissionedAssets);
    };

    async addDocumentsToApplicant(ctx, document) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.applicantId = applicantId;
        const buffer = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        let asset = JSON.parse(buffer.toString());

        return this.fetchLimitedFields(asset);
    };

    async verifyDocument(ctx, documentId) {
    };

    
    async fetchLimitedFields(ctx, applicantId) {
    };
}
module.exports = OrganizationContract;
