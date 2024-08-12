import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import socket from '../socket';
import { useParams } from 'react-router-dom';

const WatcherPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [peers, setPeers] = useState<Peer.Instance[]>([]);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!roomId) return;

    socket.emit('join-room', roomId, 'watcher');

    socket.on('user-connected', ({ id }) => {
      const peer = createPeer(id);
      setPeers((prevPeers) => [...prevPeers, peer]);
    });

    socket.on('signal', (data: { id: string; signal: Peer.SignalData }) => {
      const peer = peers.find((p) => (p as any).peerId === data.id);
      if (peer) {
        peer.signal(data.signal);
      } else {
        const newPeer = addPeer(data.signal, data.id);
        setPeers((prevPeers) => [...prevPeers, newPeer]);
      }
    });

    socket.on('user-disconnected', ({ id }) => {
      setPeers((prevPeers) => prevPeers.filter((p) => (p as any).peerId !== id));
    });

    return () => {
      socket.off('user-connected');
      socket.off('signal');
      socket.off('user-disconnected');
    };
  }, [roomId, peers]);

  const createPeer = (userToSignal: string): Peer.Instance => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
    });

    (peer as any).peerId = userToSignal;
    peer.on('signal', (signal: Peer.SignalData) => {
      socket.emit('signal', { signal, target: userToSignal });
    });

    peer.on('stream', (stream: MediaStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    return peer;
  };

  const addPeer = (incomingSignal: Peer.SignalData, callerId: string): Peer.Instance => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
    });

    (peer as any).peerId = callerId;
    peer.signal(incomingSignal);

    peer.on('stream', (stream: MediaStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    return peer;
  };

  return (
    <div>
      <h2>Watching Room: {roomId}</h2>
      <video
        ref={remoteVideoRef}
        autoPlay
        muted={false}
        style={{ width: '800px', height: '450px' }}
      />
    </div>
  );
};

export default WatcherPage;
