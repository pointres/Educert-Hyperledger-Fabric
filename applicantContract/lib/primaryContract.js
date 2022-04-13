/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
let initApplicant = require('./initLedger.json');

class PrimaryContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        for (let i = 0; i < initApplicant.length; i++) {
            initApplicant[i].docType = 'patient';
            await ctx.stub.putState('PID' + i, Buffer.from(JSON.stringify(initApplicant[i])));
            console.info('Added <--> ', initApplicant[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }
   async readApplicant(ctx, aId) {
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
   async applicantExists(ctx, aId) {
        const buffer = await ctx.stub.getState(aId);
        return (!!buffer && buffer.length > 0);
    }
    
   async getQueryResultForQueryString(ctx, queryString) {
        let resultsIterator = await ctx.stub.getQueryResult(queryString);
        console.info('getQueryResultForQueryString <--> ', resultsIterator);
        let results = await this.getAllApplicantResults(resultsIterator, false);
        return JSON.stringify(results);
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
}

module.exports = PrimaryContract;
