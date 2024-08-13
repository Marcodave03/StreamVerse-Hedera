import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";

const WatcherPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerConnectionRef.current = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", roomId, event.candidate);
      }
    };

    peerConnection.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    socket.emit("join-room", roomId, "watcher");

    socket.on("offer", async (offer) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socket.emit("answer", roomId, answer);
        }
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      try {
        if (
          peerConnectionRef.current &&
          peerConnectionRef.current.signalingState !== "closed"
        ) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      } catch (error) {
        console.error("Error adding received ICE candidate:", error);
      }
    });

    return () => {
      peerConnection.close();
      peerConnectionRef.current = null;
    };
  }, [roomId]);

  return (
    <div>
      <h2>Watching Room: {roomId}</h2>
      <video
        ref={videoRef}
        autoPlay
        controls
        style={{ width: "800px", height: "450px" }}
      />
    </div>
  );
};

export default WatcherPage;
