import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";

const WatcherPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

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

    socket.on("user-connected", () => {
      setViewerCount((prev) => prev + 1);
    });

    socket.on("user-disconnected", () => {
      setViewerCount((prev) => prev - 1);
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
    socket.on("chat", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      peerConnection.close();
      peerConnectionRef.current = null;
      socket.off("user-connected");
      socket.off("user-disconnected");
      socket.off("offer");
      socket.off("ice-candidate");
      socket.off("receive-chat");
      socket.emit("leave-room", roomId);
    };
  }, [roomId]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() === "") return;
    setMessages((prev) => [...prev, message]);
    socket.emit("chat", roomId, message);
    setMessage("");
  };

  return (
    <div>
      <h2>Watching Room: {roomId}</h2>
      <p>Viewers: {viewerCount}</p>
      <div style={{ display: "flex", gap: "2rem", alignItems: "end" }}>
        <video
          ref={videoRef}
          autoPlay
          controls
          style={{ width: "800px", height: "450px" }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            maxWidth: "50%",
            marginBlock: "1rem",
          }}
        >
          <h3>Messages</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              maxHeight: "200px",
              overflowY: "auto",
              paddingBlock: "8px",
              minWidth: "400px",
            }}
          >
            {messages.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
          <form onSubmit={onSubmit}>
            <input
              style={{ paddingBlock: "6px", paddingInline: "4px" }}
              type="text"
              placeholder="Enter a message"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default WatcherPage;
