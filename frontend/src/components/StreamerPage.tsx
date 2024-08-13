import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";

const StreamerPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [stream, setStream] = useState<MediaStream | null>(null);
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

    peerConnection.onnegotiationneeded = async () => {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit("offer", roomId, offer);
      } catch (error) {
        console.error("Error creating or setting offer:", error);
      }
    };

    socket.on("answer", async (answer) => {
      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error("Error setting remote description:", error);
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding received ICE candidate:", error);
      }
    });

    socket.emit("join-room", roomId, "streamer");

    socket.on("user-connected", ({ id, role }) => {
      console.log(`New user connected: ${id} as ${role}`);
      if (role === "watcher") {
        peerConnection.onnegotiationneeded?.(new Event("negotiationneeded"));
      }
    });

    return () => {
      peerConnection.close();
      peerConnectionRef.current = null;
      socket.emit("stop-stream", roomId);
    };
  }, [roomId]);

  const startStream = async () => {
    if (!roomId) return;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true,
      });
      setStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        peerConnectionRef.current?.addTrack(track, stream);
      });
      socket.emit("stream-started", roomId);
    } catch (error) {
      console.error("Error accessing screen media.", error);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div>
      <h2>Streaming in Room: {roomId}</h2>
      <button onClick={startStream}>Start Streaming</button>
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: "800px", height: "450px" }}
      />
    </div>
  );
};

export default StreamerPage;
