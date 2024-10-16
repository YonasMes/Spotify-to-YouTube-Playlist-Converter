import React, { useState } from 'react';
import './Home.css';
import AllSongs from './AllSongs';

const Home = () => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistId, setPlaylistId] = useState('');

  const handleInputChange = (event) => {
    setPlaylistUrl(event.target.value);
  };

  const handleSubmit = () => {
    const urlParts = playlistUrl.split('/');
    const id = urlParts[urlParts.length - 1].split('?')[0];
    setPlaylistId(id);
  };

  return (
    <div className='full'>
      <video
        src="https://videos.pexels.com/video-files/4440823/4440823-sd_640_360_25fps.mp4"
        autoPlay
        loop
        playsInline
        muted
      ></video>
      <div className='overlay'></div>
      <div className='home'>
        <div className='container'>
          <input
            className='SearchBar'
            placeholder='Enter the spotify playlist link'
            value={playlistUrl}
            onChange={handleInputChange}
          />
          <button className='submit' onClick={handleSubmit}>
            Submit
          </button>
        </div>
        <AllSongs playlistId={playlistId} />
      </div>
    </div>
  );
};

export default Home;
