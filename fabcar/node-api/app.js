const express = require("express");
const app = express();
var morgan = require('morgan')
app.use(morgan('combined'))
const bodyparser = require("body-parser");
const { registerAdmin, registerUser, userExist } = require("./registerUser");
const { verifyDocument } =require('./tx')
const { getApplicant } =require('./query')

const chaincodeName = "applicant-asset-transfer";
const documentChaincode = "document-asset-transfer";
const channelName = "mychannel"

var cors = require('cors');
const { response } = require("express");
const e = require("express");
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


app.post("/registerViceAdmin", async (req, res) => {
    try {
        let org = req.body.org;
        let userId = req.body.userId;
        //todo check if admin is loggedIn
        if(req.body.role === "admin"){
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

app.post("/registerApplicant", async (req, res) => {
    try {
        let org = req.body.org;
        let userId = req.body.userId;
        if(req.body.role === "viceAdmin"){
            let result = await registerUser({ OrgMSP: org, userId: userId, role: "applicant" });
            res.send(result);
        }
    } 
    catch (error) {
        res.status(500).send(error)
    }
});


app.post("/createApplicant", async (req, res) => {

    try {
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
        res.send(result);

    } catch (error) {
        res.status(500).send(error)
    }

});

app.post("/verifyDocument", async (req, res) => {
    try {

        let payload = {
            "org": req.body.org,
            "channelName": channelName,
            "chaincodeName": documentChaincode,
            "userId": req.body.userId,
            "data": req.body.data
        }

        let result = await verifyDocument(payload);
        res.send(result);
    } catch (error) {
        res.status(500).send(error)
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