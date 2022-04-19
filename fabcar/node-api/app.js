const express = require("express");
const app = express();
var morgan = require('morgan')
app.use(morgan('combined'))
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyparser = require("body-parser");
const { registerAdmin, registerUser, userExist } = require("./registerUser");
const { createApplicant, verifyDocument,changeCurrentOrganization, grantAccessToOrganization, revokeAccessFromOrganization, createVerifiedDocument, createSelfUploadedDocument, updateApplicantPersonalDetails } =require('./tx')
const { getMyDetails, getDocumentsSignedByOrganization, getPermissionedApplicant, getPermissionedApplicantHistory, getCurrentApplicantsEnrolled, getDocumentsByApplicantId, getMyDocuments } =require('./query')
const {User, validateUser} = require('./models/user')
const config_1 = require("config")

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
            let {userId, password, organization} = req.body;

            const {error} = validateUser(req.body);
            if(error) return res.status(400).send(error.details[0].message);

            let user = await User.findOne({ userId : userId, organization: organization, role:"viceAdmin"});
            if(user) return res.status(400).send("User already registered");

            user = new User({
                userId, password, organization, role:"viceAdmin"
            });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password,salt);
            await user.save();

        //generating certificate
        //todo check if admin is loggedIn and not the viceadmin jo currently likha hai
            let result = await registerUser({ OrgMSP: organization, userId, role: "viceAdmin" });
            res.send(result);
        }
        else{
            res.status(401).send("Unauthorized access")
        }
    } 
    catch (error) {
        res.status(500).send(error)
    }
});

app.post("/registerApplicant", auth, async (req, res) => {
    try {
        
        if(req.user.role === "viceAdmin"){
            let applicantId = req.body.userId;
            let password = req.body.password = "Secure@2022";
            let organization = req.body.organization;
            let role = req.body.role = "applicant";
            //generate certif
            
            let result = await registerUser({ OrgMSP: organization, userId: applicantId, role});
            
            //register applicant in mongo
            const {error} = validateUser({userId:applicantId, password, organization, role});
            if(error) return res.status(400).send(error.details[0].message);

            let user = await User.findOne({ userId : applicantId,organization: organization, role: role });
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
            result = await createApplicant(req);
            return res.send(result);
        }
        else (
        res.status(500).send("Unauthorized Access!")
        )
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
        let { userId, password, organization, role } = req.body;
        const {error} = validateUser(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ userId : userId, organization: organization, role: role });
        if(!user) return res.status(400).send("Incorrect Username or Password");

        const validPassword = await bcrypt.compare(password, user.password );
        if(!validPassword) return res.status(400).send("Incorrect Username or Password");

        const token = jwt.sign({ userId: user.userId, organization : user.organization, role: user.role}, config_1.get('jwtPrivateKey'));
        
        res.send(token);

    } 
    catch (error) {
        res.status(500).send(error)
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
            res.send(result);
        }
        else{
            res.status(402).send("Unauthorized operation");
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
            let result = await getPermissionedApplicant(payload);
            res.send(result);
        }
        else{
            res.status(402).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(402).send("Unauthorized operation");
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
            res.status(402).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});


app.post("/getCurrentApplicantsEnrolled",auth, async (req, res) => {
    try {
        if(req.user.role === 'viceAdmin'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": applicantChaincode,
                "userId": req.user.userId,
            }
            let result = await getCurrentApplicantsEnrolled(payload);
            res.send(result);
        }
        else{
            res.status(402).send("Unauthorized operation");
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
            let result = await getDocumentsByApplicantId(payload);
            res.send(result);
        }
        else{
            res.status(402).send("Unauthorized operation");
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
            res.send(result);
        }
        else{
            res.status(402).send("Unauthorized operation");
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
            res.send(result);
        }
        else{
            res.status(402).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});


//**************APPLICANT POST FUNCTIONS******************** */

app.post("/updateApplicantPersonalDetails", auth, async (req, res) => {
    try{
        if(req.user.role === 'applicant'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": applicantChaincode,
                "userId": req.user.userId,
                "data": req.body.data
            }
            let result = await updateApplicantPersonalDetails(payload);
            res.send(result);
        }
        else{
            res.status(402).send("Unauthorized operation");
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
            res.send(result);
        }
        else{
            res.status(402).send("Unauthorized operation");
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
            res.send(result);
        }
        else{
            res.status(402).send("Unauthorized operation");
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
            res.send(result);
        }
        else{
            res.status(402).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

//**************DOCUMENT POST FUNCTIONS******************** */


app.post("/createVerifiedDocument",auth, async (req, res) => {
    try {
        if(req.user.role === 'viceAdmin'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": documentChaincode,
                "userId": req.user.userId,
                "data":req.body.data
            }
            let result = await createVerifiedDocument(payload);
            res.send(result);
        }
        else{
            res.status(402).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post("/createSelfUploadedDocument",auth, async (req, res) => {
    try {
        if(req.user.role === 'applicant'){
            let payload = {
                "organization": req.user.organization,
                "channelName": channelName,
                "chaincodeName": documentChaincode,
                "userId": req.user.userId,
                "data":req.body.data
            }
            let result = await createSelfUploadedDocument(payload);
            res.send(result);
        }
        else{
            res.status(402).send("Unauthorized operation");
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
            res.send(result);
        }
        else{
            res.status(402).send("Unauthorized operation");
        }
    } catch (error) {
        res.status(500).send(error);
    }
})