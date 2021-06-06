const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    ytUserId: {
        type: String,
        required: 'User id is required',
        unique: true
    },
    ytUsername: {
        type: String,
        required: 'User name is required',
        unique: false
    },
    ytAvatarUrl: {
        type: String,
        required: false
    },
    sharedSecretKey: {
        type: String,
        required: 'Shared secret key is required'
    },
    accessToken: {
        type: String
    },
    refreshToken: {
        type: String
    },
    channels: {
        type: Array,
        of: String,
        default: []
    }
});

module.exports = mongoose.model("users", userSchema);