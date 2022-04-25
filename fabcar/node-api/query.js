const { getCCP } = require("./buildCCP");
const { Wallets, Gateway } = require('fabric-network');
const path = require("path");
const walletPath = path.join(__dirname, "wallet");
const { buildWallet } = require('./AppUtils')


//**************GET FUNCTIONS***************** */


//**************GET APPLICANT FUNCTIONS******************** */

exports.getMyDetails = async (request) => {
    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);
    const wallet = await buildWallet(Wallets, walletPath);
	
    const gateway = new Gateway();
	
    await gateway.connect(ccp, {
        wallet,
        identity:request.userId,
        discovery: { enabled: true, asLocalhost: true }
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);
    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
	
    let result = await contract.evaluateTransaction("getMyDetails");
    return JSON.parse(result);
}

exports.getPermissionedApplicant = async (request) => {
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

    const network = await gateway.getNetwork(request.channelName);

    const contract = network.getContract(request.chaincodeName);
    
    let result = await contract.submitTransaction('getPermissionedApplicant',request.data);
    return result;
}

exports.getPermissionedApplicantHistory = async (request) => {
    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: true } 
    });

    
    const network = await gateway.getNetwork(request.channelName);

    const contract = network.getContract(request.chaincodeName);
    
    let result = await contract.submitTransaction('getPermissionedApplicantHistory',request.data.applicantId);
    
    return result;
}

exports.getCurrentApplicantsEnrolled = async (request) => {
    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: true } 
    });

    const network = await gateway.getNetwork(request.channelName);
    const contract = network.getContract(request.chaincodeName);
    let result = await contract.submitTransaction('getCurrentApplicantsEnrolled'); 
    return result;
}

exports.getAllApplicantsOfOrganization = async (request) => {
    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: true } 
    });

    const network = await gateway.getNetwork(request.channelName);
    const contract = network.getContract(request.chaincodeName);
    let result = await contract.submitTransaction('getAllApplicantsOfOrganization'); 
    return result;
}


exports.hasMyPermission = async (request) => {
    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: true } 
    });

    
    const network = await gateway.getNetwork(request.channelName);

    const contract = network.getContract(request.chaincodeName);
    
    let result = await contract.evaluateTransaction('hasMyPermission',request.data.organizationId);
    
    return result;
}



//**************GET DOCUMENT FUNCTIONS******************** */


exports.getDocumentsByApplicantId = async (request) => {
    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: true } 
    });

    const network = await gateway.getNetwork(request.channelName);

    let contract = network.getContract("applicant-asset-transfer");
    
    let hasPermission = await contract.evaluateTransaction('hasPermission', request.data);
    if(hasPermission){
        contract = network.getContract('document-asset-transfer');
        let result = await contract.evaluateTransaction('getDocumentsByApplicantId', request.data);
        
        return result;
    }
    else{
        throw new Error('Unauthorized Access');
    }
    
}


exports.getMyDocuments = async (request) => {
    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: true } 
    });

    const network = await gateway.getNetwork(request.channelName);
    const contract = network.getContract(request.chaincodeName);
    let result = await contract.evaluateTransaction('getMyDocuments');
    return result;    
}


exports.getDocumentsSignedByOrganization = async (request) => {
    let organization = request.organization;
    let num = Number(organization.match(/\d/g).join(""));
    const ccp = getCCP(num);
    const wallet = await buildWallet(Wallets, walletPath);
	
    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity:request.userId,
        discovery: { enabled: true, asLocalhost: true }
    });
	
    const network = await gateway.getNetwork(request.channelName);
    const contract = network.getContract(request.chaincodeName);
    let result = await contract.evaluateTransaction("getDocumentsSignedByOrganization");
    return JSON.parse(result);
}