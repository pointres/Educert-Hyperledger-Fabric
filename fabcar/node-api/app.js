const express = require("express");
const app = express();
var morgan = require('morgan')
app.use(morgan('combined'))
const bcrypt = require('bcrypt');
const bodyparser = require("body-parser");
const { registerAdmin, registerUser, userExist } = require("./registerUser");
const { verifyDocument } =require('./tx')
const { getApplicant } =require('./query')
const {User, validateUser} = require('./models/viceAdmin')

const chaincodeName = "applicant-asset-transfer";
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

app.post("/registerAdmin", async (req, res) => {
    try {
        let org = req.body.org;
        let result = await registerAdmin({ OrgMSP: org });
        res.send(result);
    } 
    catch (error) {
        res.status(500).send(error)
    }
});

app.post("/registerViceAdmin", auth, async (req, res) => {
    try {
        if(req.user.role === 'admin'){
            let organization = req.body.organization;
            let userId = req.body.userId;
            let password = req.body.password;
            let role = req.body.role;
            const {error} = validateUser(req.body);
            if(error) return res.status(400).send(error.details[0].message);

            let user = await User.findOne({ userId : userId });
            if(user) return res.status(400).send("User already registered");

            user = new User({
                userId, password, organization, role
            });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password,salt);
            await user.save();

        //generating certificate
        //todo check if admin is loggedIn and not the viceadmin jo currently likha hai
            let result = await registerUser({ OrgMSP: org, userId: userId, role: "viceAdmin" });
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
            //register applicant in mongo
            let org = req.body.org;
            let userId = req.body.userId;
            await registerUser({ OrgMSP: org, userId: userId, role: "applicant" });
            
            //generate certif and register applicant in blockchain
            let applicantId = req.body.applicantinfoSignup.applicantinfoSignup.applicantId;
            let email = req.body.applicantinfoSignup.email;
            let password = req.body.applicantinfoSignup.password;
            let name = req.body.applicantinfoSignup.fullName;
            let address = req.body.applicantinfoSignup.address;
            let pin = req.body.applicantinfoSignup.pincode;
            let state = req.body.applicantinfoSignup.stateOfApplicant;
            let country = req.body.applicantinfoSignup.country;
            let contact = req.body.applicantinfoSignup.contactNumber;
            let dateOfBirth = req.body.applicantinfoSignup.dob;

            let result = await createApplicant({ applicantId, email, password, name, address, pin, state, country, contact, dateOfBirth });
            return res.send(result);
        }
    } 
    catch (error) {
        res.status(500).send(error)
    }
});


app.post("/login", async (req, res) => {
    try {
        let role = req.body.role;
        if(role === 'admin'){

        }
        else if(role === 'viceAdmin'){
            
        }
        else{

        }
        let org = req.body.org;
        let result = await registerAdmin({ OrgMSP: org });
        res.send(result);

    } 
    catch (error) {
        res.status(500).send(error)
    }
});

app.post("/verifyDocument",auth, async (req, res) => {
    try {
        if(request.user.role === 'viceAdmin'){
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



// app.post("/updateAsset", async (req, res) => {
//     try {


//         let payload = {
//             "org": req.body.org,
//             "channelName": channelName,
//             "chaincodeName": chaincodeName,
//             "userId": req.body.userId,
//             "data": req.body.data
//         }

//         let result = await updateAsset(payload);
//         res.send(result)
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })


// app.post("/transferAsset", async (req, res) => {

//     try {

//         let payload = {
//             "org": req.body.org,
//             "channelName": channelName,
//             "chaincodeName": chaincodeName,
//             "userId": req.body.userId,
//             "data": req.body.data
//         }

//         let result = await TransferAsset(payload);
//         res.send(result)
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })


// app.post("/deleteAsset", async (req, res) => {
//     try {
//         let payload = {
//             "org": req.body.org,
//             "channelName": channelName,
//             "chaincodeName": chaincodeName,
//             "userId": req.body.userId,
//             "data": req.body.data
//         }

//         let result = await deleteAsset(payload);
//         res.send(result)
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })


app.get('/getApplicant/:applicantId/search', async (req, res) => {
    try {
        let payload = {
            "org": req.query.org,
            "channelName": channelName,
            "chaincodeName": chaincodeName,
            "userId": req.query.userId,
            "applicantId":req.params.applicantId
        }

        let result = await getApplicant(payload);
        res.send(result);
        console.log(result)
    } catch (error) {
        res.send(error)
    }
});

// app.get('/getAssetHistory', async (req, res) => {
//     try {
//         let payload = {
//             "org": req.query.org,
//             "channelName": channelName,
//             "chaincodeName": chaincodeName,
//             "userId": req.query.userId,
//             "data": {
//                 id: req.query.id
//             }
//         }

//         let result = await GetAssetHistory(payload);
//         res.json(result)
//     } catch (error) {
//         res.status(500).send(error)
//     }

// });