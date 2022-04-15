/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');


async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('applicant-asset-transfer');
        const documentContract = network.getContract('document-asset-transfer');




        // const result1 = await contract.evaluateTransaction('getApplicant', "1814073");
        // console.log(`Transaction has been evaluated, result is: ${result1.toString()}`);

        // const result2 = await contract.submitTransaction('createApplicant', "1814100", "1@a.com", "12345", "biktrem", "andheri", "400058", "maharashtra","india", "1234567890", "22-03-2000", "somaiya", "Annoja");
        // console.log(`Transaction has been evaluated, result is: ${result2.toString()}`);
        
        // const result3 = await contract.submitTransaction('updateApplicantPersonalDetails',"1814100", "reynolds", "1@a.com", "andheri", "400058", "maharashtra", "india", "1234567890");
        // console.log(`Transaction has been evaluated, result is: ${result3.toString()}`);

        // const result4 = await contract.submitTransaction('changeCurrentOrganization',"1814073", "org2", "teacher2");
        // console.log(`Transaction has been evaluated, result is: ${result4.toString()}`);

        // const result5 = await contract.submitTransaction('grantAccessToOrganization',"1814100", "org2");
        // console.log(`Transaction has been evaluated, result is: ${result5.toString()}`);

        // const result6 = await contract.submitTransaction('revokeAccessFromOrganization',"1814100", "somaiya");
        // console.log(`Transaction has been evaluated, result is: ${result6.toString()}`);

        // const result7 = await contract.submitTransaction('addDocumentIdToArray',"1814073","docid1","Ujwalbhawishya");
        // console.log(`Transaction has been evaluated, result is: ${result7.toString()}`);

        // const result8 = await contract.evaluateTransaction('getPermissionedApplicant', "1814073", "org1");
        // console.log(`Transaction has been evaluated, result is: ${result8.toString()}`);

        // const result9 = await contract.evaluateTransaction('applicantExists',"1814073");
        // console.log(`Transaction has been evaluated, result is: ${result9.toString()}`);

        // const result10 = await contract.evaluateTransaction('getAllApplicants');
        // console.log(`Transaction has been evaluated, result is: ${result10.toString()}`);

        // const result11 = await contract.evaluateTransaction('getApplicantHistory',"1814073");
        // console.log(`Transaction has been evaluated, result is: ${result11.toString()}`);

        const result22 = await contract.evaluateTransaction('getCurrentApplicantsEnrolled');
        console.log(`Transaction has been evaluated, result is: ${result22.toString()}`);




        // const result12 = await documentContract.evaluateTransaction('getDocument', "docid5");
        // console.log(`Transaction has been evaluated, result is: ${result12.toString()}`)

        // const result13 = await documentContract.evaluateTransaction('getPermissionedDocument', "docid2");
        // console.log(`Transaction has been evaluated, result is: ${result13.toString()}`)

        // const result14 = await documentContract.evaluateTransaction('documentExists','docid2');
        // console.log(`Transaction has been evaluated, result is: ${result14.toString()}`)

        // const result15 = await documentContract.submitTransaction('createVerifiedDocument', "docid4", "1814078", "sanyam", "333", "12345", "org2", "Transcript", "All sems", "31-06-2022", "4", "8.5", "10", "drive/folder", "teacher13");
        // console.log(`Transaction has been evaluated, result is: ${result15.toString()}`)

        // const result16 = await documentContract.submitTransaction('createSelfUploadedDocument', "docid5", "1814078", "sanyam", "999", "12345", "org2", "Cert", "Workshop", "28-04-2021", "4", "7", "10", "drive/folder");
        // console.log(`Transaction has been evaluated, result is: ${result16.toString()}`)

        // const result17 = await documentContract.submitTransaction('verifyDocument',"docid5", "Zinkronte");
        // console.log(`Transaction has been evaluated, result is: ${result17.toString()}`)

        // const result18 = await documentContract.evaluateTransaction('getDocumentsByApplicantId',"1814078");
        // console.log(`Transaction has been evaluated, result is: ${result18.toString()}`)

        // const result19 = await documentContract.evaluateTransaction('getDocumentsSignedByOrganization',"12345");
        // console.log(`Transaction has been evaluated, result is: ${result19.toString()}`)

        // const result20 = await documentContract.evaluateTransaction('getAllDocuments');
        // console.log(`Transaction has been evaluated, result is: ${result20.toString()}`)

        // const result21 = await documentContract.evaluateTransaction('getDocumentHistory', "docid5");
        // console.log(`Transaction has been evaluated, result is: ${result21.toString()}`)


        // Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
