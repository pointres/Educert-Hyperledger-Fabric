const express = require("express");
const app = express();
var morgan = require('morgan')
app.use(morgan('combined'))
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
            let {userId, password, organization, role} = req.body;
            
            const {error} = validateUser(req.body);
            if(error) return res.status(400).send(error.details[0].message);

            let user = await User.findOne({ userId : userId, organization: organization, role:role });
            if(user) return res.status(400).send("User already registered");

            user = new User({
                userId, password, organization, role
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

            let applicantId = req.body.applicantinfoSignup.applicantId;
            let email = req.body.applicantinfoSignup.email;
            let name = req.body.applicantinfoSignup.fullName;
            let address = req.body.applicantinfoSignup.address;
            let pin = req.body.applicantinfoSignup.pincode;
            let state = req.body.applicantinfoSignup.stateOfApplicant;
            let country = req.body.applicantinfoSignup.country;
            let contact = req.body.applicantinfoSignup.contactNumber;
            let dateOfBirth = req.body.applicantinfoSignup.dob;
            let password = "Secure@2022";
            let role = "applicant";
            //generate certif
            let organization = req.body.organization;
            await registerUser({ OrgMSP: organization, userId: applicantId, role});
            
            //register applicant in mongo
            const {error} = validateUser(req.body);
            if(error) return res.status(400).send(error.details[0].message);

            let user = await User.findOne({ userId : applicantId,organization: organization, role: role });
            if(user) return res.status(400).send("User already registered");
            
            user = new User({
                userId:applicantId, password, organization, role
            });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password,salt);
            await user.save();


            //egister applicant in blockchain
            
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

        const token = jwt.sign({ userId: user.userId, organization : user.organization, role: user.role}, config.get('jwtPrivateKey'));
        
        res.send(token);

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