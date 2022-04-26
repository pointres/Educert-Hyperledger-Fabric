const { getCCP } = require("./buildCCP");
const { Wallets, Gateway } = require('fabric-network');
const path = require("path");
const walletPath = path.join(__dirname, "wallet");
const {buildWallet} =require('./AppUtils')



//**************POST FUNCTIONS***************** */


//***************APPLICANT POST FUNCTIONS************* */

exports.createApplicant = async (request) => {

    let organization = request.user.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: request.user.userId,
        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);

    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
    let data=request.body;
    console.log(data)
    await contract.submitTransaction('createApplicant',data.applicantId, data.email, data.password, data.fullName, data.address, data.pincode, data.stateOfApplicant, data.country, data.contactNumber, data.dob);


}


exports.updateMyPersonalDetails = async (request) => {

    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);

    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
    let data = request.data;
   
    await contract.submitTransaction('updateMyPersonalDetails', JSON.stringify(data));
}

exports.updateMyPassword = async (request) => {

    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);

    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
    let data = request.data;
   
    let result = await contract.submitTransaction('updateMyPassword', data.password);
    
    return result;
}


exports.changeCurrentOrganization = async (request) => {
    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);

    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
    
    let result = await contract.submitTransaction('changeCurrentOrganization', request.data.applicantId);
    
    return result;
}



exports.grantAccessToOrganization = async (request) => {
    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);
    const channel = await network.getChannel();
    const mspids = await channel.getMspids();
    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
    
    let result = await contract.submitTransaction('grantAccessToOrganization',request.data.organizationId);
    result.mspids = mspids;
    console.log(result)   
    return result;
}


exports.revokeAccessFromOrganization = async (request) => {
    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);

    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
    
    let result = await contract.submitTransaction('revokeAccessFromOrganization',request.data.organizationId);
    
    return result;
}


// exports.getAllApplicantsOfOrganization = async (request) => {
//     let organization = request.organization;
//     let num = Number(organization.match(/\d/g).join(""));
//     const ccp = getCCP(num);

//     const wallet = await buildWallet(Wallets, walletPath);

//     const gateway = new Gateway();

//     await gateway.connect(ccp, {
//         wallet,
//         identity: request.userId,
//         discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
//     });

//     // Build a network instance based on the channel where the smart contract is deployed
//     const network = await gateway.getNetwork(request.channelName);

//     // Get the contract from the network.
//     const contract = network.getContract(request.chaincodeName);
    
//     let result = await contract.submitTransaction('getAllApplicantsOfOrganization');
//     
//     return result;
// }



//**************DOCUMENT POST FUNCTIONS******************** */

exports.createVerifiedDocument = async (request) => {
    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);
   
    let contract = network.getContract("applicant-asset-transfer");
    let data = request.data;
    let hasPermission = await contract.evaluateTransaction('hasPermission', data.applicantId);

    if(hasPermission){
    // Get the contract from the network.
        let contract = network.getContract('document-asset-transfer');
        
        let result = await contract.submitTransaction('createVerifiedDocument', data.documentId, request.documentHash, data.applicantId, data.applicantName, data.applicantOrganizationNumber, data.documentName, data.description, data.dateOfAccomplishment, data.tenure, data.percentage, data.outOfPercentage, "url");
        
        contract = network.getContract("applicant-asset-transfer");
        await contract.submitTransaction('addDocumentIdToArray', data.applicantId, data.documentId)
        return result;
    }
    else{
        throw new Error('Unauthorized Access');
    }
    
}

exports.createSelfUploadedDocument = async (request) => {
    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);
   
    let data = request.data;

    // Get the contract from the network.
    let contract = network.getContract('document-asset-transfer');
    let result = await contract.submitTransaction('createSelfUploadedDocument', data.documentId, request.documentHash, request.userId, data.applicantName, data.applicantOrganizationNumber, data.organizationId, data.documentName, data.description, data.dateOfAccomplishment, data.tenure, data.percentage, data.outOfPercentage, "url");

    contract = network.getContract("applicant-asset-transfer");
    await contract.submitTransaction('addDocumentIdToArray', request.userId, data.documentId)

    return result;
}


exports.verifyDocument = async (request) => {
    let org = request.org;
    let num = Number(org.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);

    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
    let data=request.data;
    let result = await contract.submitTransaction('verifyDocument',data.documentId);
    
    return result;
}
