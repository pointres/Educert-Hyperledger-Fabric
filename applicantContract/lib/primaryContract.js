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
            throw new Error(`The applicant ${applicantId} does not exist`);
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
            password : asset.password,
            documents : asset.documents,
            permissionGranted : asset.permissionGranted
        });
        return asset;
    }
   async applicantExists(ctx, aId) {
        const buffer = await ctx.stub.getState(aId);
        return (!!buffer && buffer.length > 0);
    }
}

module.exports = FabCar;
