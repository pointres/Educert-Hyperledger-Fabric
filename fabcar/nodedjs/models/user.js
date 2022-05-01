const Joi = require('joi');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27018/EduCert",{useUnifiedTopology:true,useNewUrlParser:true},()=>{
    console.log("Connected to mongo server");
})

const User = mongoose.model('User', new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    organization: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 1024
    },
    role: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 10
    }   
}));

function validateUser(user) {
    const schema = Joi.object({
        userId: Joi.string().min(5).max(255).required(),
        password: Joi.string().min(5).max(1024).required(),
        organization: Joi.string().min(1).max(1024).required(),
        // role: Joi.string().min(2).max(10).required()
    });
    return schema.validate(user);
}

exports.User = User;
exports.validateUser = validateUser;