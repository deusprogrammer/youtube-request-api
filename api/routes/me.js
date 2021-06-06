import Users from '../models/users';

const express = require('express');
var router = express.Router();

router.route("/")
    .get(async (request, response) => {
        try {
            let ytUserId = request.user.sub;
            let user = await Users.findOne({ytUserId});

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