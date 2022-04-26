/**
 * @author Varsha Kamath
 * @email varsha.kamath@stud.fra-uas.de
 * @create date 2021-01-23 21:50:38
 * @modify date 2021-01-30 19:52:41
 * @desc [Primary Smartcontract to initiate ledger with document details]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const { Contract } = require('fabric-contract-api');
let Document = require('./Document.js');
let initDocuments = require('./initLedger.json');

class DocumentContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        for (let i = 0; i < initDocuments.length; i++) {
            await ctx.stub.putState(initDocuments[i].documentId, Buffer.from(JSON.stringify(initDocuments[i])));
            console.info('Added <--> ', initDocuments[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    //read document details based on documentId
    async getDocument(ctx, documentId) {
        const exists = await this.documentExists(ctx, documentId);
        if (!exists) {
            throw new Error(`The Document ${documentId} does not exist`);
        }

        const buffer = await ctx.stub.getState(documentId);
        let asset = JSON.parse(buffer.toString());
        
        return asset;
    }

    async getPermissionedDocument(ctx, documentId){
        let document = this.getDocument(ctx,documentId);
        return this.fetchLimitedFields(document);
    }

    async getMyDocument(ctx, documentId){
        let document = this.getDocument(ctx,documentId);
        if(await this.getUserRole(ctx) === "applicant"){
            if(document.applicantId === await this.getUserIdentity(ctx))
                return this.fetchLimitedFields(document);
            throw new Error(`You dont have permission to view the document`);
        }
        else
            throw new Error(`You dont have permission to view the document`);
    }
    

    async documentExists(ctx, documentId) {
        const buffer = await ctx.stub.getState(documentId);
        return (!!buffer && buffer.length > 0);
    }

    async createDocument(ctx, documentId, documentHash, applicantId, applicantName, applicantOrganizationNumber, organizationId, documentName, description, dateOfAccomplishment, tenure, percentage, outOfPercentage, status, documentUrl){
        
        let userId = await this.getUserIdentity(ctx);
        let newDocument = new Document(documentId, documentHash, applicantId, applicantName, applicantOrganizationNumber, organizationId, documentName, description, dateOfAccomplishment, tenure, percentage, outOfPercentage, status, documentUrl, userId);
        const exists = await this.documentExists(ctx, newDocument.documentId);

        if (exists) {
            throw new Error(`The Document ${newDocument.documentId} already exists`);
        }
        const buffer = Buffer.from(JSON.stringify(newDocument));

        await ctx.stub.putState(newDocument.documentId, buffer);
    }

    async createVerifiedDocument(ctx, documentId, documentHash, applicantId, applicantName, applicantOrganizationNumber, documentName, description, dateOfAccomplishment, tenure, percentage, outOfPercentage, documentUrl){
        if(await this.getUserRole(ctx) !== 'viceAdmin')
            return;
            
        const organizationId = await this.getOrganization(ctx);
        await this.createDocument(ctx, documentId, documentHash, applicantId, applicantName, applicantOrganizationNumber, organizationId, documentName, description, dateOfAccomplishment, tenure, percentage, outOfPercentage, "Verified", documentUrl)
    }

    async createSelfUploadedDocument(ctx, documentId, documentHash, applicantId, applicantName, applicantOrganizationNumber, organizationId, documentName, description, dateOfAccomplishment, tenure, percentage, outOfPercentage, documentUrl){
        if(await this.getUserRole(ctx) !== 'applicant')
            return;
        await this.createDocument(ctx, documentId, documentHash, applicantId, applicantName, applicantOrganizationNumber, organizationId, documentName, description, dateOfAccomplishment, tenure, percentage, outOfPercentage, "Self-Uploaded", documentUrl)
    }


    async verifyDocument(ctx, documentId){
        if(await this.getUserRole(ctx) !== 'viceAdmin'){
            throw new Error('Unauthorized operation');
        }
        const document = await this.getDocument(ctx, documentId);
        if(await this.getOrganization(ctx) !== document.organizationId)
                 throw new Error('Unauthorized operation');
        let isDataChanged = false;
        let newStatus = "Verified";
        let userIdentity = await this.getUserIdentity(ctx);

        if (document.status !== newStatus) {
            document.status = newStatus;
            isDataChanged = true;
        }

        if (isDataChanged === false) return;

        document.updatedBy = userIdentity;

        const buffer = Buffer.from(JSON.stringify(document));
        await ctx.stub.putState(documentId, buffer);
        // return await this.getDocument(ctx, documentId);
    }

    async getQueryResultForQueryString(ctx, queryString) {
        let resultsIterator = await ctx.stub.getQueryResult(queryString);
        console.info('getQueryResultForQueryString <--> ', resultsIterator);
        let results = await this.getAllDocumentResults(resultsIterator, false);
        return JSON.stringify(results);
    }

    async getDocumentsByApplicantId(ctx, applicantId) {
        if(await this.getUserRole(ctx) !== 'viceAdmin')
            throw new Error('You dont have permission to view documents');
        let queryString = {};
        queryString.selector = {};
        queryString.selector.applicantId = applicantId;
        const buffer = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        let asset = JSON.parse(buffer.toString());

        return this.fetchLimitedFields(asset);
    }

    async getMyDocuments(ctx) {
        if(await this.getUserRole(ctx) !== 'applicant')
            throw new Error('Unauthorized Access')
        let queryString = {};
        queryString.selector = {};
        queryString.selector.applicantId = await this.getUserIdentity(ctx);
        const buffer = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        let asset = JSON.parse(buffer.toString());
        return this.fetchLimitedFields(asset);
    }

    async getDocumentsSignedByOrganization(ctx) {
        let role = await this.getUserRole(ctx);
        if(role !== 'viceAdmin'){
            return;
        }
        let organizationId = await this.getOrganization(ctx);
        let queryString = {};
        queryString.selector = {};
        queryString.selector.organizationId = organizationId;
        const buffer = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        let asset = JSON.parse(buffer.toString());

        return this.fetchLimitedFields(asset);
    }

    async getAllDocuments(ctx) {
        let resultsIterator = await ctx.stub.getStateByRange('', '');
        let asset = await this.getAllDocumentResults(resultsIterator, false);
        return this.fetchLimitedFields(asset);
    }

    async getDocumentHistory(ctx, documentId) {
        let resultsIterator = await ctx.stub.getHistoryForKey(documentId);
        let asset = await this.getAllDocumentResults(resultsIterator, true);

        return asset;
    }

    /*async getPermissionedDocumentHistory(ctx, documentId){
        let role = await this.getUserRole(ctx);
        if(role === 'viceAdmin'){
            let organizationId = await this.getOrganization(ctx);
            let document = await this.getDocument(ctx, documentId);
            
            if(document.permissionGranted.includes(organizationId)){
                return await this.getDocumentHistory(ctx, documentId);
            }
            else
                throw new Error('You dont have permission to view this document');
        }
        else{
            let document = await this.getDocument(ctx, documentId);
            if(document.applicantId === await this.getUserIdentity(ctx)){
                return await this.getDocumentHistory(ctx, documentId);
            }
            else
                throw new Error('You dont have permission to view this document');
        }
    }*/

    async getAllDocumentResults(iterator, isHistory) {
        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));

                if (isHistory && isHistory === true) {
                    jsonRes.Timestamp = res.value.timestamp;
                }
                jsonRes.Key = res.value.key;

                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return allResults;
            }
        }
    }

    async getOrganization(ctx){
        let identity = await this.getIdentity(ctx);
        identity = identity.split('/')[1].split('=');
        return identity[1].toString('utf8');
    }

    async getUserIdentity(ctx){
        let identity = await this.getIdentity(ctx);
        identity = identity.split('/')[4].split('=');
        return identity[1].toString('utf8');
    }

    async getIdentity(ctx){
        const ClientIdentity = require('fabric-shim').ClientIdentity;
        let cid = new ClientIdentity(ctx.stub);

        //x509::/OU=org1/OU=client/OU=department1/CN=appUser::/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ca.org1.example.com
        return cid.getID().split('::')[1];
    }

    async getUserRole(ctx){
        const ClientIdentity = require('fabric-shim').ClientIdentity;
        let cid = new ClientIdentity(ctx.stub);
        return cid.getAttributeValue('role');
    }


    fetchLimitedFields = (asset, includeTimeStamp = false) => {
        for (let i = 0; i < asset.length; i++) {
            const obj = asset[i];
            asset[i] = {
                documentId: obj.Key,
                documentHash: obj.Record.documentHash,
                applicantId: obj.Record.applicantId,
                applicantName: obj.Record.applicantName,
                applicantOrganizationNumber: obj.Record.applicantOrganizationNumber,
                organizationId: obj.Record.organizationId,
                documentName: obj.Record.documentName,
                description: obj.Record.description,
                dateOfAccomplishment : obj.Record.dateOfAccomplishment,
                tenure: obj.Record.tenure,
                percentage: obj.Record.percentage,
                outOfPercentage: obj.Record.outOfPercentage,
                status: obj.Record.status,
                documentUrl: obj.Record.documentUrl,
                updatedBy : obj.Record.updatedBy
            };
            if (includeTimeStamp) {
                //asset[i].changedBy = obj.Record.changedBy;
                asset[i].Timestamp = obj.Timestamp;
            }
        }

        return asset;
    };

    
}
module.exports = DocumentContract;
