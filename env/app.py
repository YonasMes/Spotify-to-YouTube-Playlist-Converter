from flask import Flask, request, jsonify
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from youtube import YouTube
from flask_cors import CORS
import json
import os
from dotenv import load_dotenv, dotenv_values

app = Flask(__name__)
CORS(app)

load_dotenv()

# Replace with your client secrets file and API key
CLIENT_FILE = 'client_secrets.json'
app.config['YOUTUBE_API_KEY'] = os.getenv('API_KEY')

# Initialize the YouTube class
yt = YouTube(CLIENT_FILE)

def create_playlist_and_add_video_from_json(data):
    try:
        playlist_title = data.get('playlist_title', 'My Playlist Title')
        playlist_description = data.get('playlist_description', 'This is a description of my playlist')
        songs = data.get('songs', [])

        # Authenticate and initialize YouTube service
        yt.init_service(force_reauth=True)

        # Create a playlist
        response_playlist = yt.create_playlist(playlist_title, playlist_description, 'public')

        if not response_playlist:
            raise Exception('Failed to create playlist.')

        playlist_id = response_playlist.get('id')
        print(f'Created playlist "{playlist_title}" with ID {playlist_id}')

        youtube = build('youtube', 'v3', developerKey=os.getenv('API_KEY'))

        for song in songs:
            video_query = f"{song['name']} {song['artist']}"
            try:
                search_response = youtube.search().list(
                    q=video_query,
                    part='id,snippet',
                    type='video',
                    maxResults=1
                ).execute()

                items = search_response.get('items', [])
                if not items:
                    print(f'No videos found for {video_query}')
                    continue

                video_id = items[0]['id']['videoId']
                video_title = items[0]['snippet']['title']
                print(f'Found video "{video_title}" with ID {video_id}')

                yt.service.playlistItems().insert(
                    part='snippet',
                    body={
                        'snippet': {
                            'playlistId': playlist_id,
                            'resourceId': {
                                'kind': 'youtube#video',
                                'videoId': video_id
                            }
                        }
                    }
                ).execute()

                print(f'Added video "{video_title}" to the playlist.')

            except HttpError as e:
                print(f'An error occurred during search or insert: {e}')

    except Exception as e:
        print(f'An error occurred in create_playlist_and_add_video_from_json: {e}')
        raise

@app.route('/api/create_youtube_queue', methods=['POST'])
def create_youtube_queue():
    try:
        data = request.json
        print(f'Received data: {data}')
        create_playlist_and_add_video_from_json(data)
        return jsonify({"message": "Playlist created and videos added successfully!"}), 200
    except Exception as e:
        print(f'An error occurred in create_youtube_queue: {e}')
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)


