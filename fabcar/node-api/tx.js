const { getCCP } = require("./buildCCP");
const { Wallets, Gateway } = require('fabric-network');
const path = require("path");
const walletPath = path.join(__dirname, "wallet");
const {buildWallet} =require('./AppUtils')


/*
{
    org:Org1MSP,
    channelName:"mychannel",
    chaincodeName:"basic",
    userId:"aditya"
    data:{
        id:"asset1",
        color:"red",
        size:5,
        appraisedValue:200,
        owner:"TOM"
    }
}

*/
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
    console.log(result);
    return result;
}


exports.createApplicant = async (request) => {
    console.log(request.user);
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
    console.log(data.userId);
    console.log(data.email);
    console.log(data.password);
    console.log(data.name);
    console.log(data.address);
    console.log(data.pin);
    console.log(data.state);
    console.log(data.country);
    console.log(data.contact);
    console.log(data.dateOfBirth);



    //todo add args
    let result = await contract.submitTransaction('createApplicant',data.userId, data.email, data.password, data.name, data.address, data.pin, data.state, data.country, data.contact, data.dateOfBirth);
    console.log(result);
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
    console.log(result);
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

    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
    
    let result = await contract.submitTransaction('grantAccessToOrganization',request.data.organizationId);
    console.log(result);
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
    console.log(result);
    return result;
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

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);

    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
    
    let result = await contract.submitTransaction('getPermissionedApplicant',request.data.applicantId);
    console.log(result);
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
        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);

    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
    
    let result = await contract.submitTransaction('getPermissionedApplicantHistory',request.data.applicantId);
    console.log(result);
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
//     console.log(result);
//     return result;
// }

exports.getCurrentApplicantsEnrolled = async (request) => {
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
    
    let result = await contract.submitTransaction('getCurrentApplicantsEnrolled');
    console.log(result);
    return result;
}
/*
{
    org:Org1MSP,
    channelName:"mychannel",
    chaincodeName:"basic",
    userId:"aditya"
    data:{
        id:"asset1",
        color:"red",
        size:5,
        appraisedValue:200,
        owner:"TOM"
    }
}

*/
/*exports.updateAsset=async (request) => {
    let org = request.org;
    let num = Number(org.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: false } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);

    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
    let data=request.data;
    let result = await contract.submitTransaction('UpdateAsset',data.ID,data.color,data.size,data.owner,data.appraisedValue);
    return (result);
}*/



/*
{
    org:Org1MSP,
    channelName:"mychannel",
    chaincodeName:"basic",
    userId:"aditya"
    data:{
        id:"asset1",
        color:"red",
        size:5,
        appraisedValue:200,
        owner:"TOM"
    }
}
*/
/*exports.deleteAsset=async (request) => {
    let org = request.org;
    let num = Number(org.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: false } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);

    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
    let data=request.data;
    let result = await contract.submitTransaction('DeleteAsset',data.id);
    return (result);
}*/


/*
{
    org:Org1MSP,
    channelName:"mychannel",
    chaincodeName:"basic",
    userId:"aditya"
    data:{
        id:"asset1",
        newOwner:"TOM"
    }
}
*/


/*exports.TransferAsset=async (request) => {
    let org = request.org;
    let num = Number(org.match(/\d/g).join(""));
    const ccp = getCCP(num);

    const wallet = await buildWallet(Wallets, walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: request.userId,
        discovery: { enabled: true, asLocalhost: false } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);

    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
    let data=request.data;
    let result = await contract.submitTransaction('TransferAsset',data.id,data.newOwner);
    return JSON.parse(result);
}*/