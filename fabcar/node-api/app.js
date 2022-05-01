const express = require("express");
const app = express();
var morgan = require('morgan')
app.use(morgan('combined'))
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyparser = require("body-parser");
const { registerAdmin, registerUser, userExist } = require("./registerUser");
const { createApplicant, verifyDocument,changeCurrentOrganization, grantAccessToOrganization, revokeAccessFromOrganization, createVerifiedDocument, createSelfUploadedDocument, updateMyPersonalDetails, updateMyPassword } =require('./tx')
const { getMyDetails, getDocumentsSignedByOrganization, getPermissionedApplicant, getPermissionedApplicantHistory, getCurrentlyEnrolledApplicants, getDocumentsByApplicantId, getMyDocuments , hasMyPermission , getAllApplicantsOfOrganization} =require('./query')
const {User, validateUser} = require('./models/user')
const config_1 = require("config")
// const { imageHash }= require('image-hash');
const imageHash = require('node-image-hash');

const uuid = require('uuid');

var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      console.log("me here");
      console.log(req.body);

    cb(null, "temp_image");
  },
  filename: function (req, file, cb) {
      console.log("grgrg");
      console.log(req.body);
      let uuid1 = uuid.v4();
      req.uuid = uuid1;
      //let tempJSON = JSON.parse(req.body.data);
    cb(null, uuid1);
  },
});


const fs = require("fs");
const path = require("path");
 
// Creating server to accept request

 
// Listening to the PORT: 3000

var upload = multer({ storage: storage }).array("file");
// var upload = multer({storage: storage});

const { BlobServiceClient, BlobSASPermissions } = require('@azure/storage-blob');


const applicantChaincode = "applicant-asset-transfer";
const documentChaincode = "document-asset-transfer";
const channelName = "mychannel"

const mongodbPort = "3001";
var cors = require('cors');
const { response, request } = require("express");
const e = require("express");
const auth = require("./middleware/auth");

app.use(cors())
app.use(bodyparser.json());

app.listen(4000, () => {
    console.log("server started");

})




//**************LOGIN/SIGNUP FUNCTIONS******************** */


app.post("/registerAdmin", async (req, res) => {
    try {
        let organization = req.body.organization;
        let user = new User({
            userId: "admin", password: "adminpw", organization, role:"admin"
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password,salt);
        await user.save();
        let result = await registerAdmin({ OrgMSP: organization });
        res.send(result);
    } 
    catch (error) {
        res.status(500).send(error)
    }
});

app.post("/registerViceAdmin", auth, async (req, res) => {
    try {
        if(req.user.role === 'admin'){
            let {userId, password} = req.body;
            req.body.organization = req.user.organization;
            console.log(req.body.organization)
            // req.body.role = 'viceAdmin';
            const {error} = validateUser(req.body);
            if(error) return res.status(400).send(error.details[0].message);

            let user = await User.findOne({ userId : userId, organization: req.user.organization, role:"viceAdmin"});
            if(user) return res.status(400).send("User already registered");

            user = new User({
                userId, password, organization: req.user.organization, role:"viceAdmin"
            });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password,salt);
            await user.save();

        //generating certificate
        //todo check if admin is loggedIn and not the viceadmin jo currently likha hai
            let result = await registerUser({ OrgMSP: req.user.organization, userId, role: "viceAdmin" });
            res.send(result);
        }
        else{
            res.status(403).send("Unauthorized access")
        }
    } 
    catch (error) {
        res.status(500).send(error)
    }
});

app.post("/registerApplicant", auth, async (req, res) => {
    try {
        
        if(req.user.role === "viceAdmin"){
            let applicantId = req.body.applicantId;
            let password = req.body.password = "Secure@2022";
            let organization = req.user.organization;
            let role = "applicant";
            //generate certif
            console.log(req.body)
            await registerUser({ OrgMSP: organization, userId: applicantId, role});
            
            //register applicant in mongo
            const {error} = validateUser({userId:applicantId, password, organization});
            if(error) return res.status(400).send(error.details[0].message);

            let user = await User.findOne({ userId : applicantId, organization: organization, role: role });
            if(user) return res.status(400).send("User already registered");
            
            user = new User({
                userId:applicantId, password, organization, role
            });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password,salt);
            await user.save();


            //register applicant in blockchain
            
            //let result = await createApplicant({ applicantId, email, password, name, address, pin, state, country, contact, dateOfBirth });
            req.channelName =  channelName;
            req.chaincodeName = applicantChaincode;
            req.body.password = user.password;
            let result = await createApplicant(req);
            if(result.ok)
                return res.send('Applicant Created Successfully');
            else
                return res.send(400).send(result.error);
        }
        else {
            res.status(403).send("Unauthorized Access!");
        }
    } 
    catch (error) {
        res.status(500).send(error)
    }
});


app.post("/login", async (req, res) => {
    try {

        /* req.body->{
            organization, role, userId, password
        }
        */

        
            // user = await User.findOne({ userId : userId });
            /*let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": applicantChaincode,
                "userId": userId
            }
            let result = await getMyDetails(payload);
            if(result.ok)
                res.send(result.data);
            else
                res.status(500).send(result.error);*/
        
        let { userId, password, organization } = req.body;
        const {error} = validateUser(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ userId : userId });
        if(user.role !== 'applicant')
            user = await User.findOne({ userId : userId, organization: organization });
            
        if(!user) return res.status(400).send("Invalid Credentials");

        const validPassword = await bcrypt.compare(password, user.password );
        if(!validPassword) return res.status(400).send("Invalid Credentials");

        const token = jwt.sign({ userId: user.userId, organization : user.organization, role: user.role}, config_1.get('jwtPrivateKey'));
        res.header('x-auth-token', token).send(token);

    } 
    catch (error) {
        res.status(500).send(error)
    }
});


app.post("/getViceAdmins",auth, async (req, res) => {
    try {
        if(req.user.role === 'admin'){
            let result = await User.find({organization:req.user.organization, role:'viceAdmin'})
            res.send(result);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});


//**************GET APPLICANT FUNCTIONS******************** */


app.post('/getMyDetails', auth, async (req, res) => {
    try {
        if(req.user.role === 'applicant'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": applicantChaincode,
                "userId": req.user.userId
            }
            let result = await getMyDetails(payload);
            if(result.ok)
                res.send(result.data);
            else
                res.status(500).send(result.error);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }

    } catch (error) {
        res.send(error)
    }
});

app.post("/getPermissionedApplicant",auth, async (req, res) => {
    try {
        if(req.user.role === 'viceAdmin'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": applicantChaincode,
                "userId": req.user.userId,
                "data": req.body.data,
            }
            console.log(payload)
            let result = await getPermissionedApplicant(payload);
            if(result.ok)
                res.send(result.data);
            else
                res.status(500).send(result.error);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(403).send("Error in operation");
    }
});

app.post("/getPermissionedApplicantHistory",auth, async (req, res) => {
    try {
        if(req.user.role === 'viceAdmin'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": applicantChaincode,
                "userId": req.user.userId,
                "data": req.body.data,
            }
            let result = await getPermissionedApplicantHistory(payload);
            res.send(result);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});


app.post("/getCurrentlyEnrolledApplicants",auth, async (req, res) => {
    try {
        if(req.user.role === 'viceAdmin'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": applicantChaincode,
                "userId": req.user.userId,
            }
            let result = await getCurrentlyEnrolledApplicants(payload);
            if(result.ok)
                res.send(result.data);
            else
                res.status(500).send(result.error);

        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});


app.post("/getAllApplicantsOfOrganization",auth, async (req, res) => {
    try {
        if(req.user.role === 'viceAdmin'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": applicantChaincode,
                "userId": req.user.userId,
            }
            let result = await getAllApplicantsOfOrganization(payload);

             if(result.ok)
                res.send(result.data);
            else
                res.status(500).send(result.error);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});



//**************GET DOCUMENT FUNCTIONS******************** */


app.post("/getDocumentsByApplicantId",auth, async (req, res) => {
    try {
        if(req.user.role === 'viceAdmin'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": documentChaincode,
                "userId": req.user.userId,
                "data":req.body.data
            }
            console.log(payload)
            let result = await getDocumentsByApplicantId(payload);
            if(result.ok)
                res.send(result.data);
            else
                res.status(500).send(result.error);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post("/getMyDocuments",auth, async (req, res) => {
    try {
        if(req.user.role === 'applicant'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": documentChaincode,
                "userId": req.user.userId
            }
            let result = await getMyDocuments(payload);
            if(result.ok)
                res.send(result.data);
            else
                res.status(500).send(result.error);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post("/getDocumentsSignedByOrganization",auth, async (req, res) => {
    try {
        if(req.user.role === 'viceAdmin'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": documentChaincode,
                "userId": req.user.userId
            }
            let result = await getDocumentsSignedByOrganization(payload);
            if(result.ok)
                res.send(result.data);
            else
                res.status(500).send(result.error);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});


//**************APPLICANT POST FUNCTIONS******************** */

app.post("/updateMyPersonalDetails", auth, async (req, res) => {
    try{
        if(req.user.role === 'applicant'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": applicantChaincode,
                "userId": req.user.userId,
                "data": req.body.data
            }
            let result = await updateMyPersonalDetails(payload);
            if(result.ok)
                res.send("Update Successful");
            else
                res.status(500).send(result.error);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    }catch (error){
        res.status(500).send(error);
    }
});


app.post("/updateMyPassword", auth, async (req, res) => {
    try{
        if(req.user.role === 'applicant'){
            let user = await User.findOne({ userId : req.user.userId, role: req.user.role });
            const validPassword = await bcrypt.compare(req.body.data.oldPassword, user.password );
            if(!validPassword) return res.status(400).send("Incorrect Old Password");

            const salt = await bcrypt.genSalt(10);
            let newPassword = await bcrypt.hash(req.body.data.newPassword, salt);
            req.body.data.password = newPassword;
            await User.updateOne({"userId" : req.user.userId},{$set:{password:newPassword}});

            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": applicantChaincode,
                "userId": req.user.userId,
                "data": req.body.data
            }
            let result = await updateMyPassword(payload);
            
            if(result.ok)
                res.send("Update Successful");
            else
                res.status(500).send(result.error);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    }catch (error){
        res.status(500).send(error);
    }
});


app.post("/changeCurrentOrganization",auth, async (req, res) => {
    try {
        if(req.user.role === 'viceAdmin'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": applicantChaincode,
                "userId": req.user.userId,
                "data": req.body.data,
            }
            let result = await changeCurrentOrganization(payload);
            
            if(result.ok)
                res.send(result.data);
            else
                res.status(500).send(result.error);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post("/grantAccessToOrganization",auth, async (req, res) => {
    try {
        if(req.user.role === 'applicant'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": applicantChaincode,
                "userId": req.user.userId,
                "data": req.body.data,
            }
            let result = await grantAccessToOrganization(payload);
            
            if(result.ok)
                res.send("Granted access");
            else
                res.status(500).send(result.error);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});



app.post("/revokeAccessFromOrganization",auth, async (req, res) => {
    try {
        if(req.user.role === 'applicant'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": applicantChaincode,
                "userId": req.user.userId,
                "data": req.body.data,
            }
            let result = await revokeAccessFromOrganization(payload);
            if(result.ok)
                res.send("Revoked Access");
            else
                res.status(500).send(result.error);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post("/hasMyPermission",auth, async (req, res) => {
    try {
        if(req.user.role === 'applicant'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": applicantChaincode,
                "userId": req.user.userId,
                "data": req.body.data,
            }
            let result = await hasMyPermission(payload);
            
            if(result.ok)
                res.send(result.data);
            else
                res.status(500).send(result.error);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

//**************DOCUMENT POST FUNCTIONS******************** */

// Create the BlobServiceClient object which will be used to create a container client
var createContainerAndUpload = async (cn, filename, documentId) =>  {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
        "DefaultEndpointsProtocol=https;AccountName=blockchainimagestore;AccountKey=qA3cp9TRxlCYqz7sTQPN0c/cKaDukEGepGRbjNOEPBWZHtVSalBaOpYIgaNQlrAMUrG8jRJwJYIDshYCN7GZGA==;EndpointSuffix=core.windows.net"
    );
    // console.log(blobServiceClient.generateAccountSasUrl())
    
    // Create a unique name for the container
    const containerName = cn;
    
    console.log("\nCreating container...");
    console.log("\t", containerName);
    
    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // Create the container
    // if(containerClient)
    // {
    //     const createContainerResponse = await containerClient.create();
    //     console.log(
    //         "Container was created successfully. requestId: ",
    //         createContainerResponse.requestId
    //     );
    // }
    await containerClient.createIfNotExists();


    // Create a unique name for the blob
    const blobName = documentId;

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log("\nUploading to Azure storage as blob:\n\t", blobName);

    // Upload data to the blob
    var filePath = path.join(__dirname,"temp_image", filename);
    const data = fs.readFileSync(filePath);
    const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
    console.log(
        "Blob was uploaded successfully. requestId: ",
        uploadBlobResponse.requestId
    );

    fs.unlinkSync(filePath);

    console.log(blockBlobClient);
}

app.post("/createVerifiedDocument",auth, async (req, res) => {
    console.log("req");
    console.log(req);

    try {
        if(req.user.role === 'viceAdmin'){

            upload(req, res, async function (err) {


                if (err instanceof multer.MulterError) {
                  return res.status(500).json(err);
                  // A Multer error occurred when uploading.
                } else if (err) {
                  return res.status(500).json(err);
                  // An unknown error occurred when uploading.
                }
                console.log("body");

                // console.log(req.body);
                let filename = req.uuid;
                const fBuffer = fs.readFileSync(path.join(__dirname,"temp_image", filename));
                let documentHash;


                await imageHash
                    .hash(fBuffer, 8, 'hex')
                    .then((hash) => {
                    documentHash = hash.hash; // '83c3d381c38985a5'
                    console.log(documentHash);
                    console.log(hash.type); // 'blockhash8'
                    });


                // imageHash({data: fBuffer}, 16, true, (error, data) => {
                //         if(error) throw error;
                //         console.log(data);
                //         documentHash = data;
                //     });
                
                console.log(documentHash);
                let details = JSON.parse(req.body.data);
                let payload = {
                    "organization": req.user.organization,
                    "channelName": channelName,
                    "chaincodeName": documentChaincode,
                    "userId": req.user.userId,
                    "data": details,
                    "documentHash":documentHash
                }
                console.log(req.uuid);
                let result = await createVerifiedDocument(payload);
                
                // console.log(req.files);
                // res.send(result);
                if(result.ok){
                    createContainerAndUpload(details.applicantId, filename, details.documentId);
                    res.send("Created document");
                }
                else
                    res.status(500).send(result.error);
                // res.send(result);
                // Everything went fine.
              });
            //res.send(result);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

app.post("/createSelfUploadedDocument",auth, async (req, res) => {
    try {
        if(req.user.role === 'applicant'){


            upload(req, res, async function (err) {
                if (err instanceof multer.MulterError) {
                  return res.status(500).json(err);
                  // A Multer error occurred when uploading.
                } else if (err) {
                  return res.status(500).json(err);
                  // An unknown error occurred when uploading.
                }

                // console.log(req.body);
                let filename = req.uuid;
                const fBuffer = fs.readFileSync(path.join(__dirname,"temp_image", filename));
                let documentHash;

                await imageHash
                    .hash(fBuffer, 8, 'hex')
                    .then((hash) => {
                    documentHash = hash.hash; // '83c3d381c38985a5'
                    console.log(documentHash);
                    console.log(hash.type); // 'blockhash8'
                    });

                console.log(documentHash);
                let details = JSON.parse(req.body.data);
                let payload = {
                    "organization": req.user.organization,
                    "channelName": channelName,
                    "chaincodeName": documentChaincode,
                    "userId": req.user.userId,
                    "data": details,
                    "documentHash":documentHash
                }
                console.log(req.uuid);
                let result = await createSelfUploadedDocument(payload);

                // console.log(req.files);
                if(result.ok){
                    createContainerAndUpload(req.user.userId, filename, details.documentId);
                    res.send("Created document");
                }
                // res.status(200).send(req.files);
                else
                    res.status(500).send(result.error);
                // Everything went fine.
              });
            //res.send(result);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post("/verifyDocument",auth, async (req, res) => {
    try {
        if(req.user.role === 'viceAdmin'){
            let payload = {
                "org": req.user.organization,
                "channelName": channelName,
                "chaincodeName": documentChaincode,
                "userId": req.user.userId,
                "data": req.body.data
            }
            let result = await verifyDocument(payload);
            if(result.ok)
                res.send("Document verified successfully");
            else
                res.status(500).send(result.error);
        }
        else{
            res.status(403).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
})