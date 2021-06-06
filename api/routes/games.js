const express = require('express');
var router = express.Router();

import axios from 'axios';

let TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
let TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

let TWITCH_URL = `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;

let createTwitchAccessToken = async () => {
    let res = await axios.post(TWITCH_URL);

    return res.data.access_token;
}

let accessToken = null;
(async () => {
    accessToken = await createTwitchAccessToken();
})();

router.route("/")
    .get(async (request, response) => {
        let tryAgain = 0;
        while (tryAgain < 3) {
            try {
                let res = await axios.post(`https://api.igdb.com/v4/games`, 
                    `fields: id, name, cover.url; search: "${request.query.search}"; limit: ${request.query.pageSize}; offset: ${request.query.page * request.query.pageSize};`, 
                    {
                        headers: {
                            "Authorization": `Bearer ${accessToken}`,
                            "Client-ID": TWITCH_CLIENT_ID
                        }
                    });

                tryAgain = 3;

                return response.json(res.data.map((result) => {
                    return {
                        id: result.id,
                        name: result.name,
                        coverUrl: result.cover ? `https:${result.cover.url}` : null
                    };
                }));
            } catch (error) {
                if (error.response && [401, 403].includes(error.response.status)) {
                    accessToken = await createTwitchAccessToken();
                    tryAgain++;
                    continue;
                }

                tryAgain = 3;

                console.error(error);
                response.status(500);
                return response.send(error);
            }
        }
    });

router.route("/:id")
    .get(async (request, response) => {
        let tryAgain = 0;
        while (tryAgain < 3) {
            try {
                let res = await axios.post(`https://api.igdb.com/v4/games`, 
                    `where: id = ${request.params.id}; fields: id, name, cover.url;`, 
                    {
                        headers: {
                            "Authorization": `Bearer ${accessToken}`,
                            "Client-ID": TWITCH_CLIENT_ID
                        }
                    });

                tryAgain = 3;

                if (res.data.length <= 0) {
                    response.status(404);
                    response.send();
                }

                return response.json(res.data.map((result) => {
                    return {
                        id: result.id,
                        name: result.name,
                        coverUrl: result.cover ? `https:${result.cover.url}` : null
                    };
                })[0]);
            } catch (error) {
                if (error.response && [401, 403].includes(error.response.status)) {
                    accessToken = await createTwitchAccessToken();
                    tryAgain++;
                    continue;
                }

                tryAgain = 3;

                console.error(error);
                response.status(500);
                return response.send(error);
            }
        }
    });

export default router;