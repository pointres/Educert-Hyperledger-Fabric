'use strict';

const { Contract } = require('fabric-contract-api');
let Applicant = require('./Applicant.js');
let initApplicants = require('./initLedger.json');

class ApplicantContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        for (let i = 0; i < initApplicants.length; i++) {
            await ctx.stub.putState(initApplicants[i].applicantId, Buffer.from(JSON.stringify(initApplicants[i])));
            console.info('Added <--> ', initApplicants[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    //read applicant details based on applicantId
    async getApplicant(ctx, applicantId) {

        const exists = await this.applicantExists(ctx, applicantId);
        if (!exists) {
            throw new Error(`The applicant ${applicantId} does not exist`);
        }

        const buffer = await ctx.stub.getState(applicantId);
        let asset = JSON.parse(buffer.toString());
        asset = ({
            applicantId: applicantId,
            email : asset.email,
            password : asset.password,
            name : asset.name,
            address : asset.address,
            pin : asset.pin,
            state : asset.state,
            country : asset.country,
            contact : asset.contact,
            dateOfBirth : asset.dateOfBirth,
            documentIds : asset.documentIds,
            currentOrganization:asset.currentOrganization,
            organizationsEnrolledIn : asset.organizationsEnrolledIn,
            permissionGranted : asset.permissionGranted,
            updatedBy : asset.updatedBy,
        });
        return asset;
    }


    async createApplicant(ctx, applicantId, email, password, name, address, pin, state, country, contact, dateOfBirth) {

        if(await this.getUserRole(ctx) !== 'viceAdmin'){
            return;
        }

        if (password === null || password === '') {
            throw new Error(`Empty or null values should not be passed for password parameter`);
        }

        let currentOrganization = await this.getOrganization(ctx);
        let userIdentity = await this.getUserIdentity(ctx);

        let newApplicant = await new Applicant(applicantId, email, password, name, address, pin, state, country, contact, dateOfBirth, currentOrganization, userIdentity);
        const exists = await this.applicantExists(ctx, newApplicant.applicantId);
        if (exists) {
            throw new Error(`The applicant ${newApplicant.applicantId} already exists`);
        }
        const buffer = Buffer.from(JSON.stringify(newApplicant));
        await ctx.stub.putState(newApplicant.applicantId, buffer);
    }


    /* ****************RONAK START******************/
    async updateMyPersonalDetails(ctx, args) {

        if(await this.getUserRole(ctx) !== 'applicant'){
            return;
        }

    	args = JSON.parse(args);
		let isDataChanged = false;
		let applicantId = await this.getUserIdentity(ctx);
		let newName = args.name;
		let newEmail = args.email;
		let newAddress = args.address;
		let newPin = args.pin;
		let newState = args.state;
		let newCountry = args.country;
		let newContact = args.contact;

		const applicant = await this.getApplicant(ctx, applicantId)
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

        applicant.updatedBy = applicantId;

		const buffer = Buffer.from(JSON.stringify(applicant));
		await ctx.stub.putState(applicantId, buffer);
    }


    async getMyPassword(ctx){
        let applicantId = await this.getUserIdentity(ctx);
        const applicant = await this.getApplicant(ctx, applicantId);
        return applicant.password;
    }

    async updateMyPassword(ctx, password) {
        let applicantId = await this.getUserIdentity(ctx)

        if (password === null || password === '') {
            throw new Error(`Empty or null values should not be passed for password`);
        }

        const applicant = await this.getApplicant(ctx, applicantId);
        applicant.password = password;
        applicant.updatedBy = applicantId;
        const buffer = Buffer.from(JSON.stringify(applicant));
        await ctx.stub.putState(applicantId, buffer);
    }

    async changeCurrentOrganization(ctx, applicantId){

        if(await this.getUserRole(ctx) !== 'viceAdmin'){
            return;
        }

        let isDataChanged = false;
        let userIdentity = await this.getUserIdentity(ctx);
        let organizationId = await this.getOrganization(ctx);
        const applicant = await this.getApplicant(ctx, applicantId);

        if (applicant.currentOrganization !== organizationId) {
            applicant.currentOrganization = organizationId;
            isDataChanged = true;
        }

        if (!applicant.organizationsEnrolledIn.includes(organizationId)) {
            applicant.organizationsEnrolledIn.push(organizationId);
            isDataChanged = true;
        }

        if (isDataChanged === false) return await this.getPermissionedApplicant(ctx, applicantId);

        applicant.updatedBy = userIdentity;
        const buffer = Buffer.from(JSON.stringify(applicant));
        await ctx.stub.putState(applicantId, buffer);
        return await this.getPermissionedApplicant(ctx, applicantId);
    }

    async grantAccessToOrganization(ctx, organizationId) {

        if(await this.getUserRole(ctx) !== 'applicant'){
            return;
        }

        let applicantId = await this.getUserIdentity(ctx);
        const applicant = await this.getApplicant(ctx, applicantId);
        // unique organizationIDs in 
        console.log(applicant)
        if (!applicant.permissionGranted.includes(organizationId)) {
            applicant.permissionGranted.push(organizationId);
        }

        applicant.updatedBy = applicantId;
        const buffer = Buffer.from(JSON.stringify(applicant));
        // Update the ledger with updated permissionGranted
        await ctx.stub.putState(applicantId, buffer);
    };

    async revokeAccessFromOrganization(ctx, organizationId) {
        if(await this.getUserRole(ctx) !== 'applicant'){
            return;
        }

        let applicantId = await this.getUserIdentity(ctx);
        const applicant = await this.getApplicant(ctx, applicantId);
        if(applicant.currentOrganization === organizationId)
            applicant.currentOrganization = "";
        // Remove the organization if existing
        if (applicant.permissionGranted.includes(organizationId)) {
            applicant.permissionGranted = applicant.permissionGranted.filter(organization => organization !== organizationId);
        }

        applicant.updatedBy = applicantId;
        const buffer = Buffer.from(JSON.stringify(applicant));
        await ctx.stub.putState(applicantId, buffer);
    };
    /********************RONAK END*******************/
    

    async addDocumentIdToArray(ctx, applicantId, documentId){

        const applicant = await this.getApplicant(ctx, applicantId);
        if (!applicant.documentIds.includes(documentId)) {
            applicant.documentIds.push(documentId);
            applicant.updatedBy = await this.getUserIdentity(ctx);
            const buffer = Buffer.from(JSON.stringify(applicant));
            await ctx.stub.putState(applicantId, buffer);
        }
    }


    async getPermissionedApplicant(ctx, applicantId){
        let role = await this.getUserRole(ctx);
        if(role !== 'viceAdmin'){
            return;
        }

        let organizationId = await this.getOrganization(ctx);
        let applicant = await this.getApplicant(ctx, applicantId);
        
        if(applicant.permissionGranted.includes(organizationId)){
            return this.fetchLimitedFields(applicant);
        }
        throw new Error("Your Organization does not have permission to view this Applicant!");
    }

    async getMyDetails(ctx){
        if(await this.getUserRole(ctx) !== 'applicant')
            throw new Error("Your dont not have permission to view this Applicant!");
         return await this.getApplicant(ctx, await this.getUserIdentity(ctx));
    }

    async getCurrentlyEnrolledApplicants(ctx){
        let role = await this.getUserRole(ctx);
        if(role !== 'viceAdmin'){
            return;
        }

        let organizationId = await this.getOrganization(ctx);
        let queryString = {};
        queryString.selector = {};
        queryString.selector.currentOrganization = organizationId;
        const buffer = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        let asset = JSON.parse(buffer.toString());

        return this.fetchLimitedFields(asset);
    }

    async applicantExists(ctx, applicantId) {
        const buffer = await ctx.stub.getState(applicantId);
        return (!!buffer && buffer.length > 0);
    }

    async getQueryResultForQueryString(ctx, queryString) {
        let resultsIterator = await ctx.stub.getQueryResult(queryString);
        console.info('getQueryResultForQueryString <--> ', resultsIterator);
        let results = await this.getAllApplicantResults(resultsIterator, false);
        return JSON.stringify(results);
    }

    async getAllApplicants(ctx) {
        let resultsIterator = await ctx.stub.getStateByRange('', '');
        let asset = await this.getAllApplicantResults(resultsIterator, false);
        return this.fetchLimitedFields(asset);
    }

    async getAllApplicantsOfOrganization(ctx) {
        let resultsIterator = await ctx.stub.getStateByRange('', '');
        let asset = await this.getAllApplicantResults(resultsIterator, false);

        let organizationId = await this.getOrganization(ctx) ;
        const permissionedAssets = [];
        for (let i = 0; i < asset.length; i++) {
            const obj = asset[i];
            if ('permissionGranted' in obj.Record && obj.Record.permissionGranted.includes(organizationId)) {
                permissionedAssets.push(asset[i].Record);
            }
        }

        return permissionedAssets;
    }

    async getPermissionedApplicantHistory(ctx, applicantId){
        let role = await this.getUserRole(ctx);
        if(role !== 'viceAdmin'){
            return;
        }

        let organizationId = await this.getOrganization(ctx);
        let applicant = await this.getApplicant(ctx, applicantId);
        
        if(applicant.permissionGranted.includes(organizationId)){
            return await this.getApplicantHistory(ctx, applicantId);
        }
    }

    async getMyHistory(ctx){
        let role = await this.getUserRole(ctx);
        if(role !== 'applicant'){
            return;
        }

        let applicantId = await this.getUserIdentity(ctx);
        return await this.getApplicantHistory(ctx, applicantId);
    }


    async getApplicantHistory(ctx, applicantId) {
        let resultsIterator = await ctx.stub.getHistoryForKey(applicantId);
        let asset = await this.getAllApplicantResults(resultsIterator, true);

        return asset;
    }

    async getAllApplicantResults(iterator, isHistory) {
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
        // let identity = await this.getIdentity(ctx);
        // identity = identity.split('/')[1].split('=');
        // return identity[1].toString('utf8');
        
        const ClientIdentity = require('fabric-shim').ClientIdentity;
        let cid = new ClientIdentity(ctx.stub);

        let msp = cid.getMSPID();
        return msp.toLowerCase().slice(0, msp.length - 3);
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

    async hasMyPermission(ctx, organizationId){
        if(await this.getUserRole(ctx) === 'applicant'){
            let userId = await this.getUserIdentity(ctx);
            let applicant = await this.getApplicant(ctx, userId);
            return applicant.permissionGranted.includes(organizationId)
        }
        else
            throw new Error("Unauthorized access");
    }

    async hasPermission(ctx, applicantId){
        if(await this.getUserRole(ctx) === 'viceAdmin'){
            let organizationId = await this.getOrganization(ctx);
            let applicant = await this.getApplicant(ctx, applicantId);
            return applicant.permissionGranted.includes(organizationId)
        }
        else
            throw new Error("Unauthorized access");
    }

    fetchLimitedFields = (asset, includeTimeStamp = false) => {
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
                documentIds : obj.Record.documentIds,
                currentOrganization : obj.Record.currentOrganization,
                organizationsEnrolledIn : obj.Record.organizationsEnrolledIn,
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
module.exports = ApplicantContract;