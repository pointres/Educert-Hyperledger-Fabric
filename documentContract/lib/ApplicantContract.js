'use strict';

let Applicant = require('./Applicant.js');
const crypto = require('crypto');
const PrimaryContract = require('./primary-contract.js');
const { Context } = require('fabric-contract-api');

class ApplicantContract extends PrimaryContract {

	async readDocument(ctx, DocumentId) {
        	return await super.readDocument(ctx, DocumentId);
    }
    
    
    
    async getDocumentHistory(ctx, applicantId) {
		let resultsIterator = await ctx.stub.getHistoryForKey(DocumentId);
		let asset = await this.getAllDocumentResults(resultsIterator, true);

		return this.fetchLimitedFields(asset, true);
	    }
	
	
	    
    fetchLimitedFields = asset => {
        for (let i = 0; i < asset.length; i++) {
            const obj = asset[i];
            asset[i] = {
                documentId: obj.Key,
                applicantID: obj.Record.applicantID,
                applicantName: obj.Record.applicantName,
                applicantOrganizationNumber: obj.Record.applicantOrganizationNumber,
                organizationID: obj.Record.organizationID,
                organizationName: obj.Record.organizationName,
                documentName: obj.Record.documentName,
                description: obj.Record.description,
                dateOfAccomplishment: obj.Record.dateOfAccomplishment,
                tenure: obj.Records.tenure,
                percentage: obj.Record.percentage,
                outofPercentage: obj.Record.outofPercentage,
                status: obj.Record.status,
                documentUrl: obj.Record.documentUrl
            };
        }

        return asset;
    }
		
}
