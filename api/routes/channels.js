const express = require('express');
const Channels = require('../models/channels');
const Users = require('../models/users');
let router = express.Router();

router.route("/")
    .get(async (request, response) => {
        try {
            let user = await Users.findOne({ytUserId: request.user.sub});

            if (!user) {
                throw new Error("No user found for this youtube account");
            }

            let channelsOwned = await Channels.find({ownerId: request.user.sub});
            let channelsAccess = user.channels;

            return response.json([...channelsOwned, ...channelsAccess]);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    })
    .post(async (request, response) => {
        try {
            request.body.ownerId = request.user.sub;
            let created = await Channels.create(request.body);
            return response.json(created);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    });

router.route("/:channelId")
    .get(async (request, response) => {
        try {
            let found = await Channels.findOne({_id: request.params.channelId});

            if (!found.ownerId === request.user.sub && !found.authorizedUsers.includes(request.user.sub)) {
                throw new Error("User does not have access to this channel");
            }

            return response.json(found);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    })
    .put(async (request, response) => {
        try {
            let found = await Channels.findOne({_id: request.params.channelId});

            if (!found.ownerId === request.user.sub) {
                throw new Error("User does not have access to this channel");
            }

            let updated = await Channels.updateOne({_id: request.params.channelId}, request.body);

            return response.json(updated);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    });

router.route("/:channelId/requests")
    .put(async (request, response) => {
        try {
            let found = await Channels.findOne({_id: request.params.channelId});

            if (!found.ownerId === request.user.sub && !found.authorizedUsers.includes(request.user.sub)) {
                throw new Error("User does not have access to this channel");
            }

            found.requests = request.body;
            await Channels.updateOne({_id: request.params.channelId}, found);

            return response.json(found);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    });

router.route("/:channelId/requests/current")
    .put(async (request, response) => {
        try {
            let found = await Channels.findOne({_id: request.params.channelId});

            if (!found.ownerId === request.user.sub && !found.authorizedUsers.includes(request.user.sub)) {
                throw new Error("User does not have access to this channel");
            }

            found.currentRequest = request.body;
            await Channels.updateOne({_id: request.params.channelId}, found);

            return response.json(found);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    });

export default router;