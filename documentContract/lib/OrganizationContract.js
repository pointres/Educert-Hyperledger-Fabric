/**
 * @author Varsha Kamath
 * @email varsha.kamath@stud.fra-uas.de
 * @create date 2021-01-23 21:50:38
 * @modify date 2021-01-26 13:30:00
 * @desc [Admin Smartcontract to create, read applicant details in legder]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

let Applicant = require('./Applicant.js');
const PrimaryContract = require('./primaryContract.js');

class OrganizationContract extends PrimaryContract {

    //Returns the last applicantId in the set
    /*async getLatestApplicantId(ctx) {
        let allResults = await this.queryAllApplicants(ctx);

        return allResults[allResults.length - 1].applicantId;
    }*/

    //Create applicant in the ledger
    
    
    
    async readDocument(ctx, documentId) {

    let asset = await PrimaryContract.prototype.readDocument(ctx, documentId)

    // Get the organizationID, retrieves the id used to connect the network
    const organizationId = await this.getClientId(ctx);
    // Check if organization has the permission to read the document
    const permissionArray = asset.permissionGranted;
    if(!permissionArray.includes(organizationId)) {
        throw new Error(`The organization ${organizationId} does not have permission to document ${documentId}`);
    }
    asset = ({
        documentId: documentId,
        applicantId:asset.applicantId, 
        applicantName:asset.applicantName, 
        applicantOrganizationNumber:asset.applicantOrganizationNumber,
        organizationId:asset.organizationId, 
        organizationName:asset.organizationName, 
        documentName:asset.documentName, 
        description: asset.description,
        dateOfAccomplishment: asset.dateOfAccomplishment,
        tenure: asset.tenure,
        percentage: asset.percentage,
        outOfPercentage: asset.outOfPercentage,
        status: asset.status,
        documentUrl : asset.documentUrl
    });
    return asset;
}
    
    
    async createDocument(ctx, args) {
	    args = JSON.parse(args);

	    if (args.password === null || args.password === '') {
		throw new Error(`Empty or null values should not be passed for password parameter`);
	    }

	    let newDocument = await new Document(args.documentId, args.applicantId, args.applicantName, args.applicantOrganizationNumber, args.organizationId, args.organizationName, args.documentName, args.description, args.dateOfAccomplishment, args.tenure, args.percentage, args.outOfPercentage, "Verified", args.documentUrl);
	    const exists = await this.documentExists(ctx, newDocument.documentId);
	    if (exists) {
		throw new Error(`The document ${newDocument.documentId} already exists`);
	    }
	    const buffer = Buffer.from(JSON.stringify(newDocument));
	    await ctx.stub.putState(newDocument.documentId, buffer);
	}
    
    
    async readAllDocumentsSignedByOrganization(ctx, organizationId) {
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
	}
    
    
    async getDocumentsByApplicantId(ctx, applicantId) {
	    let queryString = {};
	    queryString.selector = {};
	    queryString.selector.applicantId = applicantId;
	    const buffer = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
	    let asset = JSON.parse(buffer.toString());

	    return this.fetchLimitedFields(asset);
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
    
    
    /**
     * @author Jathin Sreenivas
     * @param  {Context} ctx
     * @description Get the client used to connect to the network.
     */
    async getClientId(ctx) {
        const clientIdentity = ctx.clientIdentity.getID();
        // Ouput of the above - 'x509::/OU=client/CN=hosp1admin::/C=US/ST=North Carolina/L=Durham/O=hosp1.lithium.com/CN=ca.hosp1.lithium.com'
        let identity = clientIdentity.split('::');
        identity = identity[1].split('/')[2].split('=');
        return identity[1].toString('utf8');
    }
    
    
}
module.exports = OrganizationContract;
