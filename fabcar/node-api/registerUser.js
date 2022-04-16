const { Wallets } = require("fabric-network");
const FabricCAServices = require('fabric-ca-client');

const { buildCAClient, registerAndEnrollUser, enrollAdmin ,userExist} = require("./CAUtil")
const {  buildWallet } = require("./AppUtils");
const { getCCP } = require("./buildCCP");
const path=require('path');
const { Utils: utils } = require('fabric-common');
let config=utils.getConfig()
config.file(path.resolve(__dirname,'config.json'))
let walletPath;

exports.registerAdmin = async ({ OrgMSP }) => {

    let org = Number(OrgMSP.match(/\d/g).join(""));
    walletPath=path.join(__dirname,"wallet")
    let ccp = getCCP(org)
    const caClient = buildCAClient(FabricCAServices, ccp, `ca.org${org}.example.com`);
    
    /*const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create a new CA client for interacting with the CA.
    const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
    const ca = new FabricCAServices(caURL);*/


    // setup the wallet to hold the credentials of the application user
    const wallet = await buildWallet(Wallets, walletPath);

    console.log("wallet ", wallet)
    // in a real application this would be done on an administrative flow, and only once
    await enrollAdmin(caClient, wallet, OrgMSP);

    // in a real application this would be done only when a new user was required to be added
    // and would be part of an administrative flow
    return {
        wallet
    }
}

exports.registerUser = async ({ OrgMSP, userId, role }) => {

    let org = Number(OrgMSP.match(/\d/g).join(""));
    walletPath=path.join(__dirname,"wallet")
    let ccp = getCCP(org)
    const caClient = buildCAClient(FabricCAServices, ccp, `ca.org${org}.example.com`);
    
    /*const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create a new CA client for interacting with the CA.
    const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
    const ca = new FabricCAServices(caURL);*/


    // setup the wallet to hold the credentials of the application user
    const wallet = await buildWallet(Wallets, walletPath);

    console.log("wallet ", wallet)
    // in a real application this would be done on an administrative flow, and only once

    // in a real application this would be done only when a new user was required to be added
    // and would be part of an administrative flow
    await registerAndEnrollUser(caClient, wallet, OrgMSP, userId, `org${org}.department1`, role);

    return {
        wallet
    }
}


exports.userExist=async({ OrgMSP, userId })=>{
    let org = Number(OrgMSP.match(/\d/g).join(""));
    let ccp = getCCP(org)
    const caClient = buildCAClient(FabricCAServices, ccp, `ca-org${org}`);

    // setup the wallet to hold the credentials of the application user
    const wallet = await buildWallet(Wallets, walletPath);

   const result=await userExist(wallet,userId)
   return result;
}
 