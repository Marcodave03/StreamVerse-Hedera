import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RoomList from './components/RoomList';
import StreamerPage from './components/StreamerPage';
import WatcherPage from './components/WatcherPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoomList />} />
        <Route path="/stream/:roomId" element={<StreamerPage />} />
        <Route path="/room/:roomId" element={<WatcherPage />} />
      </Routes>
    </Router>
  );
};

export default App;
