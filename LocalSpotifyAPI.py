from quart import Quart, jsonify, request
from quart_cors import cors
import winsdk.windows.media.control as wmc
import datetime


app = Quart(__name__)
app = cors(app, allow_origin="*")

last_fetch = datetime.datetime.now()
data = None


async def get_playback_status():
    sessions = await wmc.GlobalSystemMediaTransportControlsSessionManager.request_async()
    current_session = sessions.get_current_session()

    if current_session:
        media_properties = await current_session.try_get_media_properties_async()
        
        title = media_properties.title
        artist = media_properties.artist
        is_playing = current_session.get_playback_info().playback_status == wmc.GlobalSystemMediaTransportControlsSessionPlaybackStatus.PLAYING
        
        return {"title": title, "artist": artist, "is_playing": is_playing}
    
    return {"title": "No song playing", "artist": "", "is_playing": False}


@app.route('/requestMedia')
async def requestMediaBypass():
    global last_fetch
    global data
    if ((datetime.datetime.now() - last_fetch) < datetime.timedelta(milliseconds=500)):
        print("reused")
        return data
    last_fetch = datetime.datetime.now()
    data = jsonify(await get_playback_status())
    print("Fresh!")
    return data

@app.route('/requestMediaBypass')
async def requestMedia():
    global data
    data = jsonify(await get_playback_status())
    print("Bypassed!")
    return data


@app.route('/controlMedia', methods=['POST'])
async def controlMedia():
    command = await request.get_json()
    #print("Received command:", command)
    action = command['action']
    #print("Action:", action)

    sessions = await wmc.GlobalSystemMediaTransportControlsSessionManager.request_async()
    current_session = sessions.get_current_session()

    if action == "play_pause":
        #print("PLAY/PAUSE")
        await current_session.try_toggle_play_pause_async()
        return jsonify({"status": "Played/Paused song"}), 200
    elif action == "next":
        #print("NEXT")
        await current_session.try_skip_next_async()
        return jsonify({"status": "skipped to next song"}), 200
    elif action == "previous":
        #print("PREVIOUS")
        await current_session.try_skip_previous_async()
        return jsonify({"status": "skipped to previous song"}), 200
    else:
        return jsonify({"error": "Unknown/No command"}), 400


if __name__ == "__main__":
    app.run(port=5000)