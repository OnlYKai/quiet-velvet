import * as utils from '../utils.js'
import React, {useEffect, useState} from 'react';

const SpotifyWidget = ({showSpotifyControls, showLikeButton}) => {
    const [song, setSong] = useState('Connecting...');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    //const [isOverflowing, setIsOverflowing] = useState(false);
    const isLargeScreen = window.innerWidth > 1600;
    
    
    
    // Establish WebSocket connection
    useEffect(() => {
        let ws;
        let isClosing = false;
        
        const connect = () => {
            ws = new WebSocket('ws://localhost:5000/mediaWebSocket');

            ws.onopen = () => {
                setSong('Connected');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setSong(`${data.title} - ${data.artist}`);
                setIsPlaying(data.playing);
                setIsFavorite(data.favorite);
            };

            ws.onclose = () => {
                setSong('Connecting...');
                setIsPlaying(false);
                setIsFavorite(false);
                if (!isClosing)
                    setTimeout(connect, 5000);
            };

            ws.onerror = (error) => {
                setSong('Connection Error: ' + error);
                setIsPlaying(false);
                setIsFavorite(false);
            };
        }
        
        connect();

        return () => {
            isClosing = true
            ws.close();
        };
    }, []);
    
    
    
    return (
        <div className="flex-container-gap">
            {showLikeButton && !['Connecting...', 'Connected', 'No song playing! - ???'].includes(song) && !song.includes('Connection Error: ') && (
                <button className={`nf ${isFavorite ? 'nf-cod-heart_filled' : 'nf-cod-heart'} transparent-button heart icon-large bold`}
                        style={{color: 'var(--main-color)'}}
                        onClick={() => utils.favoriteSong(setIsFavorite)}>
                </button>
            )}
            <div className="flex-container-gap" style={(!showSpotifyControls || ['Connecting...', 'Connected', 'No song playing! - ???'].includes(song) || song.includes('Connection Error: ')) ? {marginRight: '7px'} : null}>
                <button className="transparent-button" onClick={() => window.open('spotify:home')}>
                    {/*<i className="nf nf-fa-spotify icon-large"></i>*/}
                    <div className={`${isLargeScreen ? "marquee-container-large" : "marquee-container-small"} lh-large`}>
                        {isLargeScreen ?
                            (song.length > 42 ? (<span className="marquee">{song}       {song}       </span>) : song)
                            :
                            (song.length > 28 ? (<span className="marquee">{song}       {song}       </span>) : song)
                        }
                    </div>
                </button>
                {showSpotifyControls && !['Connecting...', 'Connected', 'No song playing! - ???'].includes(song) && !song.includes('Connection Error: ') && (
                    <div className="box in-box" style={{marginRight: '-2px'}}>
                        <button className="nf nf-md-skip_previous_circle_outline transparent-button icon-large bold" style={{color: 'var(--main-color)'}} onClick={async () => {
                            await utils.controlMedia('previous')
                        }}></button>
                        <button className={`nf ${isPlaying ? 'nf-md-pause_circle_outline' : 'nf-md-play_circle_outline'} transparent-button icon-large bold`} style={{color: 'var(--main-color)'}} onClick={async () => {
                            await utils.controlMedia('play_pause')
                            setIsPlaying(prev => !prev)
                        }}></button>
                        <button className="nf nf-md-skip_next_circle_outline transparent-button icon-large bold" style={{color: 'var(--main-color)'}} onClick={async () => {
                            await utils.controlMedia('next')
                        }}></button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SpotifyWidget;