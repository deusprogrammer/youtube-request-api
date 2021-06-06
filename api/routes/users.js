import Users from '../models/users';
import {getAccessToken, getUserInfo} from '../utils/GoogleHelper';

const express = require('express');
var router = express.Router();



const randomUuid = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

router.route("/")
    .get(async (request, response) => {
        try {
            let users = await Users.find({});

            users = users.map((user) => {
                return {
                    ytUserId: user.ytUserId,
                    ytUsername: user.ytUsername,
                    ytAvatarUrl: user.ytAvatarUrl
                }
            });

            return response.json(users);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    })
    .post(async (request, response) => {
        try {
            let code = request.body.code;
            let {access_token, refresh_token, id_token} = await getAccessToken(code);
            let userInfo = await getUserInfo(access_token);

            console.log("ACCESS TOKEN:  " + access_token);
            console.log("REFRESH TOKEN: " + refresh_token);
            console.log("USER INFO:     " + JSON.stringify(userInfo, null, 5));

            let user = await Users.findOne({ytUserId: userInfo.sub});

            // If no user found, create one
            if (!user) {
                let newUser = {
                    sharedSecretKey: randomUuid(),
                    accessToken: access_token,
                    refreshToken: refresh_token,
                    ytUserId: userInfo.sub,
                    ytUsername: userInfo.name,
                    ytAvatarUrl: userInfo.picture
                }
    
                user = await Users.create(newUser);
            }

            return response.json({
                ytUserId: user.ytUserId,
                ytUsername: user.ytUsername,
                ytAvatarUrl: user.ytAvatarUrl,
                jwt: id_token
            });
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    });

router.route("/:id")
    .get(async (request, response) => {
        try {
            let user = await Users.findOne({ytUserId: request.params.id});

            return response.json({
                ytUserId: user.ytUserId,
                ytUsername: user.ytUsername,
                ytAvatarUrl: user.ytAvatarUrl
            });
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    });

export default router;