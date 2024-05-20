"use client"
import React, { useState } from 'react';

import 'react-mirt/dist/css/react-mirt.css';
import './globals.css';
function AudioTrimmer() {
  const [audioFile, setAudioFile] = useState(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [trimmedAudioBlob, setTrimmedAudioBlob] = useState(null);
  const [error, setError] = useState(null);
  const [isTrimming, setIsTrimming] = useState(false); // Track trimming process

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setAudioFile(selectedFile);
    } else {
      alert('Please select an audio file.');
    }
  };

  const handleStartChange = (e) => {
    setStart(parseInt(e.target.value));
  };

  const handleEndChange = (e) => {
    setEnd(parseInt(e.target.value));
  };

  const handleTrim = async () => {
    if (!audioFile) {
      alert('Please select an audio file.');
      return;
    }
    if (start >= end) {
      alert('End time must be greater than start time.');
      return;
    }

    setIsTrimming(true); // Set trimming state to true

    const audio = new Audio(URL.createObjectURL(audioFile));
    audio.onloadedmetadata = () => {
      if (end > audio.duration) {
        setError('End time cannot exceed the original length of the audio.');
        setIsTrimming(false); // Reset trimming state
        return;
      }
      setError(null);
      trimAudio(audio);
    };
  };

  const trimAudio = async (audio) => {
    const duration = end - start;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audio);
    const dest = audioCtx.createMediaStreamDestination();
    source.connect(dest);
    const mediaRecorder = new MediaRecorder(dest.stream);
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/mp3' });
      setTrimmedAudioBlob(blob);
      setIsTrimming(false);
    };

    mediaRecorder.start();
    audio.currentTime = start;
    audio.play();
    await new Promise((resolve) => setTimeout(resolve, duration * 1000));
    mediaRecorder.stop();
  };

  const handleDownload = () => {
    if (trimmedAudioBlob) {
      const url = URL.createObjectURL(trimmedAudioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trimmed_audio.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert('No trimmed audio to download.');
    }
  };

  return (
    <div className='all'>
        <h1>Audio Cutter</h1>
        <h3>Free editor to trim and cut any audio file online</h3>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <br />
      <div>
        Start Time: <input type="number" value={start} onChange={handleStartChange} />
      </div>
      <div>
        End Time: <input type="number" value={end} onChange={handleEndChange} />
      </div>
        <br />
      <button onClick={handleTrim} disabled={isTrimming}>Trim Audio</button>
      <br />
      <button onClick={handleDownload} disabled={isTrimming}>Download Trimmed Audio</button>
      <br />
      {isTrimming && <div>Please wait...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {trimmedAudioBlob && (
        <audio controls>
          <source src={URL.createObjectURL(trimmedAudioBlob)} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}

export default AudioTrimmer;
