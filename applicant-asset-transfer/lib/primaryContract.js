/**
 * @author Varsha Kamath
 * @email varsha.kamath@stud.fra-uas.de
 * @create date 2021-01-23 21:50:38
 * @modify date 2021-01-30 19:52:41
 * @desc [Primary Smartcontract to initiate ledger with applicant details]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const { Contract } = require('fabric-contract-api');
let Applicant = require('./Applicant.js');
let initApplicants = require('./initLedger.json');

class PrimaryContract extends Contract {

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
            documentId : asset.documentId,
            document : asset.document,
            permissionGranted : asset.permissionGranted,
            updatedBy : asset.updatedBy,
        });
        return asset;
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