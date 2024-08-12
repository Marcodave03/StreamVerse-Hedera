import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string>('');
  const [role, setRole] = useState<'streamer' | 'watcher'>('streamer');
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5080/rooms")
      .then(response => response.json())
      .then(data => setRooms(data))
      .catch(error => console.error("Error fetching rooms:", error));
  }, []);

  const createRoom = () => {
    fetch("http://localhost:5080/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => response.json())
    .then(data => {
      const newRoomId = data.roomId;
      navigate(`/stream/${newRoomId}`);
    })
    .catch(error => console.error("Error creating room:", error));
  };

  const joinRoom = () => {
    navigate(`/room/${roomId}?role=watcher`);
  };

  return (
    <div>
      <h1>Room List</h1>
      <div>
        <h2>Create a Room</h2>
        <button onClick={createRoom}>Start Streaming</button>
      </div>

      <div>
        <h2>Join a Room</h2>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    </div>
  );
};

export default RoomList;
