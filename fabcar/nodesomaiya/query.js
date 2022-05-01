const { getCCP } = require("./buildCCP");
const { Wallets, Gateway } = require('fabric-network');
const path = require("path");
const walletPath = path.join(__dirname, "wallet");
const { buildWallet } = require('./AppUtils')

const { BlobServiceClient, BlobSASPermissions } = require('@azure/storage-blob');
const { hash } = require("bcrypt");
const imageHash = require('node-image-hash');

//**************GET FUNCTIONS***************** */


//**************GET APPLICANT FUNCTIONS******************** */

exports.getMyDetails = async (request) => {
    try {
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
        return { ok:true, data:JSON.parse(result) };
    } catch (error) {
        return { ok: false, error: "Error in contract operation: " + error.message };
    }
    
}

exports.getPermissionedApplicant = async (request) => {
    try {
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
    return { ok:true, data:result };
    } catch (error) {
        return { ok: false, error: "Error in contract operation: " + error.message };
    }
    
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

exports.getCurrentlyEnrolledApplicants = async (request) => {
    try {
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
    let result = await contract.submitTransaction('getCurrentlyEnrolledApplicants'); 
    return {ok:true, data:result};
    } catch (error) {
        return { ok: false, error: "Error in contract operation: " + error.message };
    }
    
}

exports.getAllApplicantsOfOrganization = async (request) => {
    try {
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
    return {ok:true, data:result};
    } catch (error) {
        return { ok: false, error: "Error in contract operation: " + error.message };
    }
}


exports.hasMyPermission = async (request) => {
    try {
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
    
    return {ok:true,data:result};
    } catch (error) {
        return { ok: false, error: "Error in contract operation: " + error.message };
    }
}



//**************GET DOCUMENT FUNCTIONS******************** */


exports.getDocumentsByApplicantId = async (request) => {
    try {
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
        result = await putUrl(JSON.parse(result));
        return {ok:true, data:result};
    }
    else{
        throw new Error('Unauthorized Access');
    }
    } catch (error) {
        return { ok: false, error: "Error in contract operation: " + error.message };
    }    
}

const getDocumentUrls = async (applicantId, documentId) => {
    let blobServiceClient = BlobServiceClient.fromConnectionString(
        "DefaultEndpointsProtocol=https;AccountName=blockchainimagestore;AccountKey=qA3cp9TRxlCYqz7sTQPN0c/cKaDukEGepGRbjNOEPBWZHtVSalBaOpYIgaNQlrAMUrG8jRJwJYIDshYCN7GZGA==;EndpointSuffix=core.windows.net"
    );
    // console.log(blobServiceClient.generateAccountSasUrl());
    // const account = "blockchainimagestore";
    // const sas = blobServiceClient.generateAccountSasUrl();

    // StorageSharedKeyCredentialPolicy s = new StorageSharedKeyCredentialPolicy();


    // blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net${sas}`);
    const containerClient = blobServiceClient.getContainerClient(applicantId);
    const blobClient = containerClient.getBlobClient(documentId);
    const sasOptions = {
        containerName: containerClient.containerName,
        blobName: documentId
    };
        sasOptions.startsOn = new Date();
        sasOptions.expiresOn = new Date(new Date().valueOf() + 3600 * 1000);
        sasOptions.permissions = BlobSASPermissions.parse("r");

    //     sasOptions.identifier = storedPolicyName;
    // }

    let documentUrl = blobClient.generateSasUrl(sasOptions);
    // blobClient.generateSasUrl();
    
    return documentUrl;
}

const putUrl = async (docArray) => {
    for(let i = 0; i < docArray.length; i++){
        let url = await getDocumentUrls(docArray[i].applicantId, docArray[i].documentId);

        let documentHash;
        await imageHash
            .hash(url, 8, 'hex')
            .then((hash) => {
            documentHash = hash.hash; // '83c3d381c38985a5'
            console.log(documentHash);
            console.log(hash.type); // 'blockhash8'
        });
        if(documentHash === docArray[i].documentHash){
            console.log("if");
            docArray[i].documentUrl = url;
        }
        else{
            console.log("else")
            docArray[i].documentUrl = "";
        }
    }
    return docArray;
}

// TODO
exports.getMyDocuments = async (request) => {
    try {
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
    result = await putUrl(JSON.parse(result))
    return {ok:true, data:result};  
    } catch (error) {
        return { ok: false, error: "Error in contract operation: " + error.message };
    }  
}


exports.getDocumentsSignedByOrganization = async (request) => {
    try {
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
        console.log(result);
        result = await putUrl(JSON.parse(result));
        console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
        console.log(result);
        return {ok:true, data:result};
    } catch (error) {
        return { ok: false, error: "Error in contract operation: " + error.message };
        
    }
   
}