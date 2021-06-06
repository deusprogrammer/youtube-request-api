const mongoose = require('mongoose');

let channelSchema = new mongoose.Schema({
    authorizedUsers: {
        type: Array,
        of: String,
        default: []
    }
});

module.exports = mongoose.model("channels", channelSchema);