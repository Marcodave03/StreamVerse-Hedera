import React, { useEffect, useRef, useState } from 'react';
import Peer, { Instance } from 'simple-peer';
import socket from '../socket';
import { useParams } from 'react-router-dom';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [peers, setPeers] = useState<Instance[]>([]);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [role, setRole] = useState<'streamer' | 'watcher'>('streamer');

  useEffect(() => {
    if (!roomId) return;

    socket.emit('join-room', roomId, role);

    socket.on('user-connected', ({ id, role }) => {
      if (role === 'streamer') {
        const peer = createPeer(id, socket.id!, localStreamRef.current);
        setPeers((prevPeers) => [...prevPeers, peer]);
      }
    });

    socket.on('signal', (data: { id: string; signal: Peer.SignalData }) => {
      const peer = peers.find((p) => (p as any).peerId === data.id);
      if (peer) {
        peer.signal(data.signal);
      } else {
        const newPeer = addPeer(data.signal, data.id, localStreamRef.current);
        setPeers((prevPeers) => [...prevPeers, newPeer]);
      }
    });

    socket.on('user-disconnected', ({ id, role }) => {
      setPeers((prevPeers) => prevPeers.filter((p) => (p as any).peerId !== id));
    });

    if (role === 'streamer') {
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then((stream) => {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((error) => console.error("Error accessing screen media.", error));
    }

    return () => {
      socket.off('user-connected');
      socket.off('signal');
      socket.off('user-disconnected');
    };
  }, [roomId, peers, role]);

  const createPeer = (
    userToSignal: string,
    callerId: string,
    stream: MediaStream | null
  ): Instance => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream || undefined,
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

  const addPeer = (
    incomingSignal: Peer.SignalData,
    callerId: string,
    stream: MediaStream | null
  ): Instance => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream || undefined,
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
      <h2>Room: {roomId}</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3>Your Stream</h3>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            style={{ width: '400px', height: '225px' }}
          />
        </div>

        <div>
          <h3>Remote Stream</h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            muted={false}
            style={{ width: '400px', height: '225px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Room;
