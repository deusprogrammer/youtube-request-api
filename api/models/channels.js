const mongoose = require('mongoose');

let channelSchema = new mongoose.Schema({
    ownerId: {
        type: String,
        required: "Owner id must be set!"
    },
    name: {
        type: String,
        required: "Channel name is required!"
    },
    authorizedUsers: {
        type: Array,
        of: String,
        default: []
    },
    requests: {
        type: Array,
        of: {
            igdbId: {
                type: String
            },
            requestor: String
        },
        default: []
    },
    currentRequest: {
        igdbId: {
            type: String
        },
        requestor: String
    }
}, {
    useNestedStrict: true
});

module.exports = mongoose.model("channels", channelSchema);