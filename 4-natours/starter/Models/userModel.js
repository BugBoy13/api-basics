const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, `Please tell us your name`],
    },
    email: {
        type: String,
        required: [true, `Please provide your email`],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, `Please provide a valid email`],
    },
    photo: String,
    password: {
        type: String,
        required: [true, `Please provide a password`],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // this only works on CREATE and SAVE!!
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not same',
        },
    },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        // if password is modified
        return next();
    }

    this.password = await bcrypt.hash(this.password, 12);

    // deleting the field
    this.passwordConfirm = undefined; // passwordConfirm is required (required to input, not to persist)
    next();
});

// available on all documents
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
