const api_url = process.env.NODE_ENV === "production" ? process.env.SERVER_URL : "http://localhost:4000"

/*
Build URL for frontend to request data from backend.
 */
function buildURL(path, firstParam) {
    const firstChar = firstParam ? "&" : "?"
    return api_url + path + firstChar + "access_token=" + localStorage.getItem("access-token") + "&refresh_token=" + localStorage.getItem("refresh-token") + "&expired=" + isTokenExpired();
}

/*
Checks if the token is expired given the timestamp stored in memory.
*/
function isTokenExpired() {
    return Date.now() - localStorage.getItem("timestamp") > 2000000;
}

/*
Handles the data received from the backend, refreshes the access token if the token has expired.
*/
function handleData(data) {
    var handledData = data;
    if(isTokenExpired()) {
      localStorage.setItem("access-token", data.refreshed_token);
      localStorage.setItem("timestamp", Date.now());
    }
    return handledData.data;
}

async function request(url, expectingResponse) {
    
    const response = await fetch(url);
    
    if(response.status >= 400 && response.status < 600) {
        console.error("bad server reseponse: " + response.status);
        console.error(response.statusText);
        throw Error("bad response");
    }

    if(expectingResponse) {
        const data = await response.json();
        const handledData = handleData(data);

        return handledData;
    }
}

export const getSongID = (songURL) => {
    const split = songURL.split("track/")[1];
    const split2 = split.split("?")[0];
    return split2;
}

export const isLoggedInToSpotify = () => {
    if(localStorage.getItem("access-token") === null || localStorage.getItem("access-token") === "undefined") {
        return false;
    }
    return true;
}

export const queueSong = async (songURL, deviceId) => {

    const songID = getSongID(songURL);

    const songURI = "spotify:track:" + songID;

    const url = buildURL("/api/queueSong?song_uri=" + songURI + "&device_id=" + deviceId, true);

    var handledData = await request(url, true);

    return handledData;
}

export const skipSong = async (deviceId) => {
    const url = buildURL("/api/skip-song?device_id=" + deviceId, true);

    var handledData = await request(url, true);

    return handledData;
}

export const getUserDevices = async () => {
    const url = buildURL("/api/user-devices", false);

    var handledData = await request(url, true);

    return handledData;
}

export const getUserPlaylists = async () => {
    const url = buildURL("/api/user-playlists", false);

    var handledData = await request(url, true);

    return handledData;
}

export const getPlaylist = async (href) => {
    const url = buildURL("/api/get-playlist?href=" + href, true);

    var handledData = await request(url, true);

    return handledData;
}

export const getSongData = async (songURL) => {

    const songID = getSongID(songURL)

    const songURI = "spotify:track:" + songID;

    const url = buildURL("/api/songData?song_uri=" + songURI, true);

    // var handledData = await request(url, true);

    // return handledData;

    return request(url, true).then((data) => {
        return data;
    }, (error) => {
        return Promise.reject("Error finding song data");
    })
}

export const getSongDataArray = async (songURLArray) => {
    var queryString = "ids="
    var index = 0;
    for(const url of songURLArray) {
        queryString += getSongID(url);
        if(index < songURLArray.length - 1) {
            queryString += "%2C";
        }
        index += 1;
    }

    const url = buildURL("/api/song-data-bulk?" + queryString, true);

    var handledData = await request(url, true);

    return handledData;
}

export const getCurrentPlayingSongData = async () => {
    const url = buildURL("/api/currently-playing", false);

    var handledData = await request(url, true);

    return handledData;
}