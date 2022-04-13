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

    //Read applicant details based on applicantId
    async readApplicant(ctx, applicantId) {
        let asset = await super.readApplicant(ctx, applicantId)
 
        asset = ({
            applicantId: applicantId,
            email: asset.email,
            name: asset.name,
            address: asset.address,
            pin: asset.pin,
            state: asset.state,
            country: asset.country,
            contact: asset.contact,
            dateOfBirth: asset.dateOfBirth
        });
        return asset;
    }

    // //Delete applicant from the ledger based on applicantId
    // async deleteApplicant(ctx, applicantId) {
    //     const exists = await this.applicantExists(ctx, applicantId);
    //     if (!exists) {
    //         throw new Error(`The applicant ${applicantId} does not exist`);
    //     }
    //     await ctx.stub.deleteState(applicantId);
    // }

    /*

    //Read applicants based on lastname
    async queryApplicantsByLastName(ctx, lastName) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'applicant';
        queryString.selector.lastName = lastName;
        const buffer = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        let asset = JSON.parse(buffer.toString());

        return this.fetchLimitedFields(asset);
    }

    //Read applicants based on firstName
    async queryApplicantsByFirstName(ctx, firstName) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'applicant';
        queryString.selector.firstName = firstName;
        const buffer = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        let asset = JSON.parse(buffer.toString());

        return this.fetchLimitedFields(asset);
    }

    */

    //Retrieves all applicants details
    
    /*async readAllApplicantsofOrganization(ctx) {
        let resultsIterator = await ctx.stub.getStateByRange('', '');
        let asset = await this.getAllApplicantResults(resultsIterator, false);

        return this.fetchLimitedFields(asset);
    }*/
    
    //Admin can view all applicants while organization cannot. (Same for documents).
    
    async readAllApplicantsOfOrganization(ctx, organizationId){
        let queryString = {};
        queryString.selector = {};
        queryString.selector.currentOrganization = organizationId;
        const buffer = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        let asset = JSON.parse(buffer.toString());

        return this.fetchLimitedFields(asset);
    }
    
   //To do.
    
    async addDocumentIdToApplicant(ctx, applicantId, documentId){
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
                applicantId: obj.Key,
                email: obj.Record.email,
                name: obj.Record.name,
                address: obj.Record.address,
                pin: obj.Record.pin,
                state: obj.Record.state,
                country: obj.Record.country,
                contact: obj.Record.contact,
                dateOfBirth: obj.Record.dateOfBirth,
                documents : obj.Records.documents,
                currentOrganization : obj.Record.currentOrganization
            };
        }

        return asset;
    }
}
module.exports = OrganizationContract;
