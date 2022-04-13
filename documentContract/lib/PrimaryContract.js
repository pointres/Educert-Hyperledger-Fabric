'use strict';

const { Contract } = require('fabric-contract-api');
let initDocument = require('./initLedger.json');

class PrimaryContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        for (let i = 0; i < initDocument.length; i++) {
            initDocument[i].docType = 'document';
            await ctx.stub.putState('DID' + i, Buffer.from(JSON.stringify(initDocument[i])));
            console.info('Added <--> ', initDocument[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }
   async readDocument(ctx, dId) {
        const exists = await ctx.stub.getState(aId);
        if (!exists || exists.length == 0) {
            throw new Error(`The document ${aId} does not exist`);
        }

        const buffer = await ctx.stub.getState(aId);
        let asset = JSON.parse(buffer.toString());
        return asset;
    }
    
    async getQueryResultForQueryString(ctx, queryString) {
        let resultsIterator = await ctx.stub.getQueryResult(queryString);
        console.info('getQueryResultForQueryString <--> ', resultsIterator);
        let results = await this.getAllDocumentResults(resultsIterator, false);
        return JSON.stringify(results);
    }
    
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
}

module.exports = PrimaryContract;
