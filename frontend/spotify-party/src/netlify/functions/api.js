const express = require('express');

const app = express();

const path = require('path');

const axios = require('axios');

const url = require('url');

const cors = require('cors');
const serverless = require('serverless-http');
const router = express.Router();

if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
})

function handleResponseData(response, accessToken) {
    const data = response.data;
    const responseData = {
        data,
        "refreshed_token": accessToken
    };
    return responseData;
}

async function getToken(res, req) {
    const queryObject = url.parse(req.url, true).query;

    var accessToken = queryObject.access_token;

    if(queryObject.expired === 'true') {
        console.log(queryObject.refresh_token);
        accessToken = await refreshAccessToken(res, queryObject.refresh_token);
    }
    return accessToken;
}

router.get("/callback", (req, res) => {
    if(req.query.code) {
        handleCodeAuthorization(req, res);
        return;
    }
    res.send("no code given");
    console.log("test", process.env.redirect_uri);
})

async function refreshAccessToken(res, refreshToken) {
    console.log("given refresh token: " + refreshToken);
    var accessTokenRefreshed = null;
    await axios({
        method: "POST",
        url: "https://accounts.spotify.com/api/token?grant_type=refresh_token&refresh_token=" + refreshToken + "&client_id=" + process.env.client_id,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${new Buffer.from(`${process.env.client_id}:${process.env.client_secret}`).toString('base64')}`
        },
    }).then(response => {
        accessTokenRefreshed = response.data.access_token;
        console.log("refreshed access token. receieved data: " + accessTokenRefreshed);
        return accessTokenRefreshed;
    }).catch(error => {
        console.log(error.response);
        res.status(error.response.status);
        res.send(error.response.status + " - an error occurred.");
    })
    return accessTokenRefreshed;
}

function handleCodeAuthorization(req, res) {
    console.log("handling code");
    axios({
        method: 'post',
        url: `https://accounts.spotify.com/api/token?grant_type=authorization_code&code=${req.query.code}&redirect_uri=${process.env.redirect_uri}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${new Buffer.from(`${process.env.client_id}:${process.env.client_secret}`).toString('base64')}`
        }
    }).then((response) => {
        console.log(`statusCode: ${response.statusCode}`);

        const data = response.data;

        const accessTokenEncoded = encodeURIComponent(data.access_token);
        const refreshTokenEncoded = encodeURIComponent(data.refresh_token);
        const timestamp = Date.timestamp;

        const params = `?access_token=${accessTokenEncoded}&refresh_token=${refreshTokenEncoded}&timestamp=${timestamp}`;

        res.redirect(`${process.env.frontend_uri}${params}`);
        return;
    }).catch((error) => {
        res.send(`error`);
        console.log(error);
    })
}

router.get('/login', (req, res) => {
    const SCOPE = 'user-read-private user-read-email user-modify-playback-state user-read-currently-playing user-read-playback-state';
    res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + process.env.client_id +
    '&scope=' + encodeURIComponent(SCOPE) + 
    '&redirect_uri=' + encodeURIComponent(process.env.redirect_uri))
});

router.get('/login-create', (req, res) => {
    const SCOPE = 'user-read-private user-read-email user-modify-playback-state user-read-currently-playing user-read-playback-state';
    res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + process.env.client_id +
    '&scope=' + encodeURIComponent(SCOPE) + 
    '&redirect_uri=' + encodeURIComponent(process.env.redirect_uri))
})

router.get('/api/queueSong', async (req, res) => {
    const queryObject = url.parse(req.url, true).query;

    const songURI = queryObject.song_uri;
    const deviceID = queryObject.device_id;
    const accessToken = await getToken(res, req);

    axios({
        method: "POST",
        url: "https://api.spotify.com/v1/me/player/queue?uri=" + songURI + "&device_id=" + deviceID,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        const responseData = handleResponseData(response, accessToken);
        res.send(responseData);
    }).catch((error) => {
        console.log(error.response);
        res.status(error.response.status);
        res.send(error.response.status + " - an error occurred.");
    })
})

router.get('/api/songData', async (req, res) => {
    const queryObject = url.parse(req.url, true).query;

    const songURI = queryObject.song_uri;
    const accessToken = await getToken(res, req);
    var songID = '';
    try{
        songID = songURI.split(":")[2];
    }catch(e) {
        res.send("invalid song URI");
        return;
    }

    axios({
        method: "GET",
        url: "https://api.spotify.com/v1/tracks/" + songID,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        const responseData = handleResponseData(response, accessToken);
        res.send(responseData);
    }).catch((error) => {
        console.log(error.response);
        res.status(error.response.status);
        res.send(error.response.status + " - an error occurred.");
    })
})

router.get('/api/skip-song', async (req, res) => {
    const queryObject = url.parse(req.url, true).query;

    const deviceID = queryObject.device_id;

    const accessToken = await getToken(res, req);

    axios({
        method: "POST",
        url: "https://api.spotify.com/v1/me/player/next?device_id=" + deviceID,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        const responseData = handleResponseData(response, accessToken);
        res.send(responseData);
    }).catch((error) => {
        console.log(error.response);
        res.status(error.response.status);
        res.send(error.response.status + " - an error occurred.");
    })
})

router.get('/api/song-data-bulk', async (req, res) => {
    const queryObject = url.parse(req.url, true).query;

    const songIDs = queryObject.ids;

    const accessToken = await getToken(res, req);

    axios({
        method: "GET",
        url: "https://api.spotify.com/v1/tracks?ids=" + songIDs,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        const responseData = handleResponseData(response, accessToken);
        res.send(responseData);
    }).catch((error) => {
        console.log(error.response);
        res.status(error.response.status);
        res.send(error.response.status + " - an error occurred.");
    })
})

router.get("/api/user-playlists", async(req, res) => {
    const accessToken = await getToken(res, req);

    axios({
        method: "GET",
        url: "https://api.spotify.com/v1/me/playlists",
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        const responseData = handleResponseData(response, accessToken);
        res.send(responseData);
    }).catch((error) => {
        console.log(error.response);
        res.status(error.response.status);
        res.send(error.response.status + " - an error occurred.");
    })
})

router.get("/api/get-playlist", async(req, res) => {
    const queryObject = url.parse(req.url, true).query;

    const href = queryObject.href;
    const accessToken = await getToken(res, req);

    axios({
        method: "GET",
        url: href,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        const responseData = handleResponseData(response, accessToken);
        res.send(responseData);
    }).catch((error) => {
        console.log(error.response);
        res.status(error.response.status);
        res.send(error.response.status + " - an error occurred.");
    })
})

router.get("/api/user-devices", async(req, res) => {
    const accessToken = await getToken(res, req);

    axios({
        method: "GET",
        url: "https://api.spotify.com/v1/me/player/devices",
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        const responseData = handleResponseData(response, accessToken);
        res.send(responseData);
    }).catch((error) => {
        console.log(error.response);
        res.status(error.response.status);
        res.send(error.response.status + " - an error occurred.");
    })
})

router.get('/api/currently-playing', async (req, res) => {
    const accessToken = await getToken(res, req);

    axios({
        method: "GET",
        url: "https://api.spotify.com/v1/me/player/currently-playing",
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        const responseData = handleResponseData(response, accessToken);
        res.send(responseData);
    }).catch((error) => {
        console.log(error.response);
        res.status(error.response.status);
        res.send(error.response.status + " - an error occurred.");
    })
})

if (process.env.NODE_ENV === 'production') {
    console.log("production");
    app.use(express.static(path.join(__dirname, '../frontend/spotify-party/build')));
    router.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, '../frontend/spotify-party/build', 'index.html'));
    });
}

app.use('/.netlify/functions/api', router);

module.exports.handler = serverless(app);