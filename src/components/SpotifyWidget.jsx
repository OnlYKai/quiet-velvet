import * as utils from '../utils.js'
import config from "../config.js";
import React, {useEffect, useState} from 'react';

const SpotifyWidget = ({ showSettings, setShowSettings, isFavorite, setIsFavorite }) => {
    const [song, setSong] = useState('fetching...');
    const [isOverflowing, setIsOverflowing] = useState(false);
    const isLargeScreen = window.innerWidth > 1600;
    
    

    async function updateSong(bypass) {
        const song = config.useLocalSpotifyAPI ? await utils.getCurrentSongLocal(bypass) : await utils.getCurrentSong();
        setSong(song);
    }
    
    useEffect(() => {
        updateSong(true);
        const intervalID = config.useLocalSpotifyAPI ? setInterval(updateSong, config.localPollingRate) : setInterval(updateSong, config.officialPollingRate);
        return () => {
            clearInterval(intervalID);
        }
    }, []);
    
    
    
    const style = {
        textDecoration: 'none',
        color: 'var(--font-color)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }
    const settingsStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5em',
        //paddingRight: '10px',
    }
    const iconStyle = {
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'var(--font-color)',
        borderRadius: '50%',
        fontSize: '13px',
        paddingTop: '0px',
        paddingBottom: '0px',
    }

    const heartStyle = {
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '50%',
        paddingRight: '7px',
        fontSize: '15px',
        paddingTop: '0px',
        paddingBottom: '0px',
    }
    const bigIcons = {
        fontSize: '15px',
        paddingTop: '0px',
        paddingBottom: '0px',
    }
    
    
    
    return (
        <div classname="spotify-container" style={style}
             onMouseEnter={() => {(config.extendOnHover === 'both' || config.extendOnHover === 'spotify') ? setShowSettings(true) : null}}
             onMouseLeave={() => {(config.extendOnHover === 'both' || config.extendOnHover === 'spotify') ? setShowSettings(false) : null}}
        >
            <button className={`${isFavorite ? 'nf nf-cod-heart_filled' : 'nf nf-cod-heart'} clean-button`}
                    style={{color: isFavorite ? 'var(--main-color)' : 'var(--font-color)', ...heartStyle}}
                    onClick={() => utils.favorite(setIsFavorite)}>
            </button>
            <button className="clean-button" onClick={() => window.open('spotify:home')} style={style}>
                <i className="nf nf-fa-spotify" style={bigIcons}></i>
                <div className={isLargeScreen ? "marquee-container-large" : "marquee-container-small"}>
                    {song.length > 38 ? (<span className="marquee">{song}       {song}       </span>) : song}
                </div>
            </button>
            {showSettings && !['fetching...', 'ERR: bad response', 'ERR: failed to connect'].includes(song) ?
                <div style={settingsStyle}>
                    <button className="nf nf-md-skip_previous clean-button" style={iconStyle} onClick={async () => {
                        config.useLocalSpotifyAPI ? await utils.sendCommand('previous') : await utils.previousSong();
                        setTimeout(async () => config.useLocalSpotifyAPI ? await updateSong(true) : null, 100);
                        setTimeout(async () => config.useLocalSpotifyAPI ? await updateSong(true) : null, 500);
                        setTimeout(async () => config.useLocalSpotifyAPI ? null : await updateSong(), 1000);
                    }}></button>
                    <button className="nf nf-md-play_pause clean-button" style={iconStyle} onClick={async () => {
                        config.useLocalSpotifyAPI ? await utils.sendCommand('play_pause') : await utils.playPause();
                        setTimeout(async () => config.useLocalSpotifyAPI ? await updateSong(true) : null, 100);
                        setTimeout(async () => config.useLocalSpotifyAPI ? await updateSong(true) : null, 500);
                        setTimeout(async () => config.useLocalSpotifyAPI ? null : await updateSong(), 1000);
                    }}></button>
                    <button className="nf nf-md-skip_next clean-button" style={iconStyle} onClick={async () => {
                        config.useLocalSpotifyAPI ? await utils.sendCommand('next') : await utils.skipSong();
                        setTimeout(async () => config.useLocalSpotifyAPI ? await updateSong(true) : null, 100);
                        setTimeout(async () => config.useLocalSpotifyAPI ? await updateSong(true) : null, 500);
                        setTimeout(async () => config.useLocalSpotifyAPI ? null : await updateSong(), 1000);
                    }}></button>
                </div>
                : null}
        </div>
    );
}

export default SpotifyWidget;