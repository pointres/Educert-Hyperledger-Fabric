const express = require("express");
const app = express();
var morgan = require('morgan')
app.use(morgan('combined'))
const bodyparser = require("body-parser");
const { registerUser, userExist } = require("./registerUser");
const { verifyDocument } =require('./tx')
const { getApplicant } =require('./query')

const chaincodeName = "applicant-asset-transfer";
const channelName = "mychannel"

var cors = require('cors')
app.use(cors())
app.use(bodyparser.json());

app.listen(4000, () => {
    console.log("server started");

})

app.post("/register", async (req, res) => {

    try {
        let org = req.body.org;
        let userId = req.body.userId;
        let result = await registerUser({ OrgMSP: org, userId: userId });
        res.send(result);

    } catch (error) {
        res.status(500).send(error)
    }
});


/* app.post("/verifyDocument", async (req, res) => {
    try {


        let payload = {
            "org": req.body.org,
            "channelName": channelName,
            "chaincodeName": chaincodeName,
            "userId": req.body.userId,
            "data": req.body.data
        }

        let result = await verifyDocument(payload);
        res.send(result)
    } catch (error) {
        res.status(500).send(error)
    }
}) */



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
        res.json(result);
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