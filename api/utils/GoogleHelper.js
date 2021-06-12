import axios from 'axios';

const AUTH_URL = "https://accounts.google.com/o/oauth2/token";
const CHANNEL_ID_URL = "https://www.googleapis.com/youtube/v3/channels?mine";
const USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const CLIENT_ID = process.env.YT_CLIENT_ID;
const CLIENT_SECRET = process.env.YT_CLIENT_SECRET;
const REDIRECT_URI = process.env.YT_REDIRECT_URI;

export const getAccessToken = async (code) => {
    console.log("URI: " + REDIRECT_URI);

    let params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('redirect_uri', REDIRECT_URI);

    let res = await axios.post(AUTH_URL, params, {responseType: "json"});

    return res.data;
}

export const refreshAccessToken = async (refreshToken) => {
    let params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);

    let res = await axios.post(AUTH_URL, params, {responseType: "json"});

    return res.data;
}

export const getChannelId = async (accessToken) => {
    let res = await axios.get(CHANNEL_ID_URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    return res.data.items[0].id;
} 

export const getUserInfo = async (accessToken) => {
    let res = await axios.get(USER_INFO_URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    return res.data;
}