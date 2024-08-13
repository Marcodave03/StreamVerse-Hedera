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
    if (roomId) {
      navigate(`/room/${roomId}?role=${role}`);
    } else {
      alert("Please enter a valid room ID.");
    }
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
        <div>
          <h2>Select Role</h2>
          <select value={role} onChange={(e) => setRole(e.target.value as 'streamer' | 'watcher')}>
            <option value="streamer">Streamer</option>
            <option value="watcher">Watcher</option>
          </select>
        </div>
        <button onClick={joinRoom}>Join Room</button>
      </div>

      <div>
        <h2>Available Rooms</h2>
        <ul>
          {rooms.map((room) => (
            <li key={room}>
              {room}
              <button onClick={() => navigate(`/room/${room}?role=watcher`)}>Join</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoomList;
