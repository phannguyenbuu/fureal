const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required!"],
        trim: true,
        unique: [true, "Email must be unique"],
        minLength: [5, "Email must be have 5 characters!"],
        lowercase: true
    },
    password: {
        type: String,
        trim: true,
        select: false
    },
    forgotPasswordCode: {
        type: String,
        select: false
    },
    forgotPasswordCodeValidation: {
        type: Number,
        select: false
    },
    googleId: {
        type: String,
        select: false
    },
    name: {
        type: String,
        required: [true, "Name must be provided!"]
    },
    isBan: {
        type: Boolean
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', ''],
        default: ''
    },
    dob: {
        type: String
    },
    menh: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("users", userSchema)