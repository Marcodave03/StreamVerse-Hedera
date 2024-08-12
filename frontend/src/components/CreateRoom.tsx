// src/components/CreateRoom.tsx
import React, { useState } from 'react';
import axios from 'axios';

const CreateRoom: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5080/rooms', { roomId });
      setRoomId('');
    } catch (error) {
      console.error("Error creating room", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Room</h2>
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Room ID"
      />
      <button type="submit">Create</button>
    </form>
  );
};

export default CreateRoom;
