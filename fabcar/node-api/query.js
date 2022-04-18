const { getCCP } = require("./buildCCP");
const { Wallets, Gateway } = require('fabric-network');
const path = require("path");
const walletPath = path.join(__dirname, "wallet");
const { buildWallet } = require('./AppUtils')

/*
{
    org:Org1MSP,
    channelName:"mychannel",
    chaincodeName:"basic",
    userId:"aditya"

}
*/

exports.getApplicant = async (request) => {
    let org = request.org;
    let num = Number(org.match(/\d/g).join(""));
    const ccp = getCCP(num);
    const wallet = await buildWallet(Wallets, walletPath);
	console.log("")
    const gateway = new Gateway();
	console.log(wallet)
    await gateway.connect(ccp, {
        wallet,
        identity:'admin',
        discovery: { enabled: true, asLocalhost: true }
    });
	console.log(request)
    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);
    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
	console.log("")
    let result = await contract.evaluateTransaction("getApplicant",request.applicantId);
    return JSON.parse(result);
}

exports.getDocumentsSignedByOrganization = async (request) => {
    let org = request.org;
    let num = Number(org.match(/\d/g).join(""));
    const ccp = getCCP(num);
    const wallet = await buildWallet(Wallets, walletPath);
	console.log("")
    const gateway = new Gateway();
	console.log(wallet)
    await gateway.connect(ccp, {
        wallet,
        identity:'admin',
        discovery: { enabled: true, asLocalhost: true }
    });
	console.log(request)
    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(request.channelName);
    // Get the contract from the network.
    const contract = network.getContract(request.chaincodeName);
    let result = await contract.evaluateTransaction("getDocumentsSignedByOrganization");
    return JSON.parse(result);
}
/*exports.getPermissionedDocument = async (request) => {
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
  
    const contract = network.getContract(request.chaincodeName);
    let documentId = req.documentId;
    let hasPermission = await contract.evaluateTransaction('hasPermission', data.applicantId);

    if(hasPermission){
        network = await gateway.getNetwork(request.channelName);

    // Get the contract from the network.
        contract = network.getContract('document-asset-transfer');
    
        let result = await contract.submitTransaction('getPermissionedDocument', data.applicantId )
        console.log(result);
        return result;
    }
    else{
        throw new Error('Unauthorized Access');
    }
    
}*/




/*
{
    org:Org1MSP,
    channelName:"mychannel",
    chaincodeName:"basic",
    userId:"aditya"
    data:{
        id:"asset1"
    }
}
*/
/*
exports.GetAssetHistory = async (request) => {
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
    let data = request.data;
    let result = await contract.evaluateTransaction("GetAssetHistory", data.id);
    return JSON.parse(result);
}*/
