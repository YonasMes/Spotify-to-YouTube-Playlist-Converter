import React, { useState, useEffect } from 'react';
import './AllSongs.css';

const CLIENT_ID = process.env.REACT_APP_client_id;
const REDIRECT_URI = 'http://localhost:3000';

const AllSongs = ({ playlistId }) => {
  const [token, setToken] = useState('');
  const [playlistItems, setPlaylistItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem('token');

    if (!token && hash) {
      token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
      window.location.hash = '';
      window.localStorage.setItem('token', token);
    }

    setToken(token);

    if (token && playlistId) {
      getPlaylistItems(token, playlistId);
    }
  }, [token, playlistId]);

  const getPlaylistItems = async (token, playlistId) => {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=US`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setPlaylistItems(data.items || []);
      setError(null); 
      window.localStorage.setItem('playlistItems', JSON.stringify(data.items));
    } catch (error) {
      console.error('Error fetching playlist items:', error);
      setError('Failed to fetch playlist items. Please log in again.');
    }
  };

  const loginToSpotify = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=playlist-read-private`;
    window.location.href = authUrl;
  };

  const handleLoginAgain = () => {
    // Clear the existing token and redirect to the Spotify login page
    window.localStorage.removeItem('token');
    loginToSpotify();
  };

  const createYouTubeQueue = async () => {
    if(!token || localStorage.length === 0){
      alert('No link was entered or no playlist items found. Please ensure you are logged in and have valid data.');
      return;
    }
    const playlistItems = JSON.parse(window.localStorage.getItem('playlistItems'));
    if (playlistItems && playlistItems.length > 0) {
      try {
        const response = await fetch('http://localhost:5000/api/create_youtube_queue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            playlist_title: 'My Playlist Title',
            playlist_description: 'This is a description of my playlist',
            songs: playlistItems.map(item => ({
              name: item.track.name,
              artist: item.track.artists[0].name
            }))
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data.message);
      } catch (error) {
        console.error('Error creating YouTube queue:', error);
      }
    } else {
      console.error('No playlist items found in localStorage');
    }
  };



  return (
    <div className='card'>
      <button className='Create_queue' onClick={createYouTubeQueue}>Create YouTube Queue</button>
      <button 
  className='Create_queue' 
  onClick={() => window.open('https://accounts.spotify.com/en/login?flow_ctx=ebcf10ec-62e5-440d-aa00-88bf74304f13:1723170857')}
>
  Login to Your Spotify
</button>
      <h1 className='playlist'>Spotify Playlist Songs</h1>
      {!token && <button onClick={loginToSpotify}>Login to Spotify</button>}
      {error && <button onClick={handleLoginAgain}>Log In Again</button>}
      {token && (
        <div>
          {playlistItems.length > 0 ? (
            playlistItems.map((item, index) => (
              <div key={index} className='Songs'>
                <img src={item.track.album.images[0].url} alt={item.track.name} />
                <div className='SongInfo'>
                  <h2>{item.track.name}</h2>
                  <h4>{item.track.artists[0].name}</h4>
                </div>
              </div>
            ))
          ) : (
            <p>No items found in the playlist.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AllSongs;
