const express = require('express');
const Channels = require('../models/channels');
let router = express.Router();

router.route("/:channelId/requests")
    .get(async (request, response) => {
        try {
            let found = await Channels.findOne({_id: request.params.channelId});
            return response.json(found.requests);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    });

router.route("/:channelId/requests/current")
    .get(async (request, response) => {
        try {
            let found = await Channels.findOne({_id: request.params.channelId});
            return response.json(found.currentRequest);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    });

export default router;