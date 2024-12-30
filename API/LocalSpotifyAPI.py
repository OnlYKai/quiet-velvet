from quart import Quart, websocket, jsonify, request
from quart_cors import cors
from functools import wraps
import winsdk.windows.media.control as wmc
import asyncio
import json
from pycaw.pycaw import AudioUtilities

app = Quart(__name__)
app = cors(app, allow_origin='*')

session_manager = None
connections = set()

data = {'title': 'No song playing!', 'artist': '???', 'playing': False, 'favorite': False}
track_id = None










import os
import webbrowser
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from spotipy.cache_handler import CacheFileHandler
from spotipy.exceptions import SpotifyException

# Configuration
client_id = 'ID_HERE'
client_secret = 'SECRET_HERE'
redirect_uri = 'http://localhost:5000/callback'
scope = 'user-read-currently-playing,user-library-read,user-library-modify'

# Initialize the CacheFileHandler to save the token locally
cache_handler = CacheFileHandler(cache_path='.cache')

# Set up Spotify OAuth with the CacheFileHandler
sp_oauth = SpotifyOAuth(
    client_id=client_id,
    client_secret=client_secret,
    redirect_uri=redirect_uri,
    scope=scope,
    cache_handler=cache_handler,
)

# Initialize Spotify client
sp = spotipy.Spotify(auth_manager=sp_oauth)



async def set_favorite():
    if track_id == None:
        return
    await check_for_cache()
    if not data['favorite']:
        try:
            sp.current_user_saved_tracks_add(tracks=(track_id,))
        except SpotifyException as e:
            if e.http_status == 401: # Invalid token
                await try_refresh_token()
                sp.current_user_saved_tracks_add(tracks=(track_id,))
    else:
        try:
            sp.current_user_saved_tracks_delete(tracks=(track_id,))
        except SpotifyException as e:
            if e.http_status == 401: # Invalid token
                await try_refresh_token()
                sp.current_user_saved_tracks_delete(tracks=(track_id,))



async def get_favorite_status():
    await check_for_cache()
    try:
        is_favorite = sp.current_user_saved_tracks_contains(tracks=(track_id,))
    except SpotifyException as e:
        if e.http_status == 401: # Invalid token
            await try_refresh_token()
            is_favorite = sp.current_user_saved_tracks_contains(tracks=(track_id,))

    print('FAVORITE', is_favorite)
    return is_favorite



async def get_currently_playing():
    await check_for_cache()
    try:
        track = sp.currently_playing()
    except SpotifyException as e:
        if e.http_status == 401: # Invalid token
            await try_refresh_token()
            track = sp.currently_playing()

    global track_id
    if track:
        track_id = track['item']['id']
        print('ID:' + track_id)
    else:
        track_id = None
        print('No track is currently playing.')
        raise ValueError("track id None")



# Check if tokens are cached and cache them if they aren't
async def check_for_cache():
    if not cache_handler.get_cached_token(): # Create file if needed
        auth_url = sp_oauth.get_authorize_url()
        webbrowser.open(auth_url)
        # Wait until token is cached by the callback route
        while not cache_handler.get_cached_token():
            await asyncio.sleep(0.5)

# Try to refresh access token if it's invalid, and recreate everything if refresh token fails
async def try_refresh_token():
    try:
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token']) # Refresh token
    except: # probably an invalid refresh token
        os.remove('.cache')
        auth_url = sp_oauth.get_authorize_url()
        webbrowser.open(auth_url)
        # Wait until token is cached by the callback route
        while not cache_handler.get_cached_token():
            await asyncio.sleep(0.5)

# Callback for automatic token caching
@app.route('/callback')
async def callback():
    code = request.args.get('code')
    if code:
        sp_oauth.get_access_token(code)
        print('Spotify token obtained and cached.')
    return '''
    <html>
        <body onload='window.close();'>
            <p>You can close this window now.</p>
        </body>
    </html>
    '''










def collect_websocket(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        global connections
        connections.add(websocket._get_current_object())
        print()
        print('New Connection!')
        await send_playback_status()
        try:
            return await func(*args, **kwargs)
        finally:
            connections.remove(websocket._get_current_object())
    return wrapper





async def send_playback_status():
    #print('Sending:', data)
    global connections
    message = json.dumps(data)
    for connection in connections:
        try:
            await connection.send(message)
            print(f'Sent to: {id(connection)}')
        except Exception as e:
            print(f'Send error: {e}')



async def check_playback_status(force):
    global data
    global track_id

    #print('POLLING2')

    current_session = session_manager.get_current_session()
    if current_session:
        if current_session.source_app_user_model_id != 'Spotify.exe':
            return

        media_properties = await current_session.try_get_media_properties_async()
        title = media_properties.title
        artist = media_properties.artist
        playing = current_session.get_playback_info().playback_status == wmc.GlobalSystemMediaTransportControlsSessionPlaybackStatus.PLAYING

        print(playing)

        if title == '' or artist == '':
            return

        if data['title'] != title or data['artist'] != artist or data['playing'] != playing or force:
            print()
            print('New Data!')

            try: # Getting currently playing track's id
                await get_currently_playing()
            except:
                print('error checking currently playing, retrying...') # Play and Pause and check again for track id

                spotify = None

                await current_session.try_play_async()

                while spotify == None:
                    sessions = AudioUtilities.GetAllSessions()
                    for session in sessions:
                        if session.Process and session.Process.name() == 'Spotify.exe':
                            spotify = session.SimpleAudioVolume
                            spotify.SetMute(True, None)
                            print('Mute')
                            break

                await asyncio.sleep(0.5)
                await current_session.try_pause_async()
                await asyncio.sleep(0.5)

                spotify.SetMute(False, None)
                print('Unmute')

                try: # Getting currently playing track's id
                    await get_currently_playing()
                except:
                    print('error checking currently playing, final!')
                    title = 'No song playing!'
                    artist = '???'
                    playing = False
                    track_id = None

            print(track_id)
            if track_id:
                try: # Checking if it's favorited
                    favorite = await get_favorite_status()
                except:
                    print('error checking favorite')
                    favorite = [False]
            else:
                favorite = [False]

            data = {'title': title, 'artist': artist, 'playing': playing, 'favorite': favorite[0]}
            print(data)
            await send_playback_status()

    elif data != {'title': 'No song playing!', 'artist': '???', 'playing': False, 'favorite': False}:
        data = {'title': 'No song playing!', 'artist': '???', 'playing': False, 'favorite': False}
        track_id = None
        await send_playback_status()



async def poll_playback_status():
    while True:
        print('POLLING1')
        await check_playback_status(False)
        await asyncio.sleep(1)










async def quick_update():
    await asyncio.sleep(0.6)
    await check_playback_status(False)



@app.before_serving
async def startup():
    global session_manager
    session_manager = await wmc.GlobalSystemMediaTransportControlsSessionManager.request_async()
    print('Set session_manager!')
    asyncio.create_task(poll_playback_status())



@app.websocket('/mediaWebSocket')
@collect_websocket
async def ws():
    try:
        while True:
            await websocket.receive()
    except Exception as e:
        print(f'WebSocket error: {e}')



@app.route('/favoriteSong')
async def favoriteSong():
    if data == {'title': 'No song playing!', 'artist': '???', 'playing': False, 'favorite': False}:
        await send_playback_status()
        return 'Can\'t favorite no song...'
    await set_favorite()
    await check_playback_status(True)
    return ''



@app.route('/controlMedia', methods=['POST'])
async def controlMedia():
    command = await request.get_json()
    action = command.get('action')

    sessions = await wmc.GlobalSystemMediaTransportControlsSessionManager.request_async()
    current_session = sessions.get_current_session()

    if action == 'play_pause':
        print('PLAY/PAUSE')
        await current_session.try_toggle_play_pause_async()
        asyncio.create_task(quick_update())
        return ''

    elif action == 'next':
        print('NEXT')
        await current_session.try_skip_next_async()
        asyncio.create_task(quick_update())
        return ''

    elif action == 'previous':
        print('PREVIOUS')
        await current_session.try_skip_previous_async()
        asyncio.create_task(quick_update())
        return ''

    else:
        return jsonify({'error': 'Unknown/No command'}), 400





if __name__ == '__main__':
    app.run(port=5000)