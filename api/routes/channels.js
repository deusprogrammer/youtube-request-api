const express = require('express');
const Channels = require('../models/channels');
const Users = require('../models/users');
let router = express.Router();

const AUTH_URL = "https://accounts.google.com/o/oauth2/token";
const CHANNEL_ID_URL = "https://www.googleapis.com/youtube/v3/channels?mine";
const USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const CLIENT_ID = process.env.YT_CLIENT_ID;
const CLIENT_SECRET = process.env.YT_CLIENT_SECRET;
const REDIRECT_URI = process.env.YT_REDIRECT_URI;

const refreshAccessToken = async (refreshToken) => {
    let params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refreshToken', refreshToken);
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);

    let res = await axios.post(AUTH_URL, params, {responseType: "json"});

    return res.data;
}

const getChannelId = async (accessToken) => {
    let res = await axios.get(CHANNEL_ID_URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    return res.data.items[0].id;
}

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