import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';

const StreamerPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!roomId) return;

    socket.emit('join-room', roomId, 'streamer');

    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      .then((newStream) => {
        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
        socket.emit('video-data', newStream);
      })
      .catch((error) => console.error("Error accessing screen media.", error));

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      socket.emit('stop-stream', roomId);
    };
  }, [roomId, stream]);

  return (
    <div>
      <h2>Streaming in Room: {roomId}</h2>
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: '800px', height: '450px' }}
      />
    </div>
  );
};

export default StreamerPage;
