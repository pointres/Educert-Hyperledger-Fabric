const Joi = require('joi');
const mongoose = require('mongoose');

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
        minlength: 5,
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
    const schema = {
        userId: Joi.string().min(5).max(255).required(),
        password: Joi.string().min(5).max(1024).required(),
        organization: Joi.string().min(5).max(1024).required(),
        role: Joi.string().min(2).max(10).required()
    };
    return Joi.validate(user, schema);
}

exports.User = User;
exports.validateUser = validateUser;