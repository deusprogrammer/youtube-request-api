import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';

import games from './api/routes/games';
import channels from './api/routes/channels';
import users from './api/routes/users';
import me from './api/routes/me';
import requests from './api/routes/requests';

import Users from './api/models/users';
import {refreshAccessToken} from './api/utils/GoogleHelper';

const jwt = require('jsonwebtoken');
var jwksClient = require('jwks-rsa');

var client = jwksClient({
    jwksUri: 'https://www.googleapis.com/oauth2/v3/certs'
});
  
function getKey(header, callback){
    client.getSigningKey(header.kid, function(err, key) {
        if (err) {
            console.error("FUCK: " + err);
        }
        var signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

let app = express();
let port = process.env.PORT || 8080;

app.use(cors());
app.options('*', cors());
app.use(express.json({}));

// Mongoose instance connection url connection
const databaseUrl = process.env.YT_DB_URL;
mongoose.Promise = global.Promise;

/*
 * Connect to database
*/

let connectWithRetry = function() {
    return mongoose.connect(databaseUrl, function(err) {
        if (err) {
            console.warn('Failed to connect to mongo on startup - retrying in 5 sec');
            setTimeout(connectWithRetry, 5000);
        }
    });
};
connectWithRetry();

app.set('etag', false);
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

const jwtAuth = async (req, res, next) => {
    if (req.headers['authorization']) {
        let [ type, auth ] = req.headers['authorization'].split(' ');
        console.log("MOTHERFUCKER: " + auth);
        if (type == 'Bearer') {
            jwt.verify(
                auth,
                getKey,
                (err, decoded) => {
                    if (err) {
                        // If error is expired token...then verify and return a new token.
                        if (err.name === "TokenExpiredError") {
                            jwt.verify(
                                auth,
                                getKey,
                                {
                                    ignoreExpiration: true
                                }, async (err, decoded) => {
                                    if (err) {
                                        res.status('401').json({error: true, message: 'Invalid jwt token'});
                                        return;
                                    }

                                    let user = await Users.findOne({ytUserId: decoded.sub});
                                    let {id_token} = await refreshAccessToken(user.refreshToken);

                                    res.status('401').json({error: false, message: "JWT expired.  Please use refreshed token.", newJwt: id_token})
                                    return;
                                });
                            return;
                        }

                        console.log('JWT Error', err);
                        res.status('401').json({error: true, message: 'Invalid authorization'});
                        return;
                    }

                    req.user = decoded;
                    next();
                }
            );

            return;
        }

        res.status('401').json({error: true, message: 'Invalid authorization header'});
    } else {
        res.status('401').json({error: true, message: 'Missing authorization header'});
    }
};

/*
 * Routes 
 */
app.use('/channels', jwtAuth, channels);
app.use('/me', jwtAuth, me);
app.use('/users', users);
app.use('/games', games);
app.use('/public/channels', requests);

app.listen(port);
console.log('YouTube Request RESTful API server started on: ' + port);