import config from './config.js';

const updateAccessToken = async () => {
    if (!config.spotifyRefreshToken || !config.spotifyClientId || !config.spotifyClientSecret) {
        console.error("Missing required keys for refreshing access token");
        return;
    }
    const url = "https://accounts.spotify.com/api/token";
    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: config.spotifyRefreshToken,
            client_id: config.spotifyClientId,
            client_secret: config.spotifyClientSecret,
        }).toString(),
    };

    try {
        const response = await fetch(url, payload);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            console.error(await response.text()); // Log the response body for more details
            return;
        }

        const data = await response.json();
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
        } else {
            console.error("Invalid response data", data);
        }
    } catch (e) {
        console.error("Failed to update access token", e);
    }
};

const fetchSpotifyApi = async (path, options) => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        console.error("Access token not found");
        return;
    }

    const url = `https://api.spotify.com/v1${path}`;
    const payload = {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
        },
    };

    try {
        const response = await fetch(url, payload);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            console.error(await response.text()); // Log the response body for more details
            return;
        }

        if (response.status === 204) {
            return { is_playing: false };
        }

        return await response.json();
    } catch (e) {
        console.error("Failed to fetch Spotify API", e);
        throw e;
    }
}

const postSpotifyApi = async (path) => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        console.error("Access token not found");
        return;
    }

    const url = `https://api.spotify.com/v1${path}`;
    const payload = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
        },
        method: 'POST',
    };

    try {
        const response = await fetch(url, payload);
        if (response.status !== 200) {
            console.error(`HTTP error! status: ${response.status}`);
            console.error(await response.text()); // Log the response body for more details
            return false;
        }

        return true;
    } catch (e) {
        console.error("Failed to fetch Spotify API", e);
        throw e;
    }

}

const putSpotifyApi = async (path) => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        console.error("Access token not found");
        return;
    }

    const url = `https://api.spotify.com/v1${path}`;
    const payload = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
        },
        method: 'PUT',
    };

    try {
        const response = await fetch(url, payload);
        if (response.status !== 200) {
            console.error(`HTTP error! status: ${response.status}`);
            console.error(await response.text()); // Log the response body for more details
            return false;
        }

        return true;
    } catch (e) {
        console.error("Failed to fetch Spotify API", e);
        throw e;
    }

}

const fetchCurrentSong = async () => {
    const song = await fetchSpotifyApi('/me/player/currently-playing', { method: 'GET' });
    if (!song) {
        await updateAccessToken();
        return await fetchSpotifyApi('/me/player/currently-playing', { method: 'GET' });
    }
    return song;
};

const skipSong = async () => {
    const response = await postSpotifyApi('/me/player/next');
    if (!response) {
        await updateAccessToken();
        await postSpotifyApi('/me/player/next');
    }
    return "success";
};

const previousSong = async () => {
    const response = await postSpotifyApi('/me/player/previous');
    if (!response) {
        await updateAccessToken();
        await postSpotifyApi('/me/player/previous');
    }
    return "success";
};

const getCurrentSong = async () => {
    try {
        const result = await fetchCurrentSong();
        return result && result.is_playing ? result.item.name : "---";
    } catch (e) {
        return "Error";
    }
};

const playPause = async () => {
    let song = await fetchSpotifyApi('/me/player/currently-playing', { method: 'GET' });
    if (!song || !song.is_playing) {
        await updateAccessToken();
        song = await fetchSpotifyApi('/me/player/currently-playing', { method: 'GET' });
    }
    if (!song) {
        return
    }
    song.is_playing ? await putSpotifyApi('/me/player/pause') : await putSpotifyApi('/me/player/play');
}



const getCurrentSongLocal = async (bypass) => {
    try {
        const response = await fetch(bypass ? 'http://localhost:5000/requestMediaBypass' : 'http://localhost:5000/requestMedia');

        if (!response.ok)
            return 'ERR: bad response';

        const data = await response.json();

        return `${data.title} - ${data.artist}`;
    }
    catch (e) {
        return 'ERR: failed to connect'
    }
}

async function sendCommand(action) {
    try {
        const response = await fetch('http://localhost:5000/controlMedia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action }),
        });

        if (!response.ok)
            throw new Error('bad response while sending command');

        const result = await response.json();

        console.log('Command sent successfully: ' + result);
    }
    catch (e) {
        console.error('Error sending command: ' + e);
    }
}



const favorite = async (setIsFavorite) => {
    setIsFavorite((prev) => !prev);
}



export {
    getCurrentSong,
    skipSong,
    previousSong,
    playPause,
    getCurrentSongLocal,
    sendCommand,
    favorite
};