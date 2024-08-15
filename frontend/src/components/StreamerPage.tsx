import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";

const StreamerPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [stream, setStream] = useState<MediaStream | null>(null);
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
      setViewerCount((prev) => prev + 1);
    });

    socket.on("user-disconnected", ({ id, role }) => {
      console.log(`User disconnected: ${id} as ${role}`);
      setViewerCount((prev) => prev - 1);
    });

    socket.on("chat", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      peerConnection.close();
      peerConnectionRef.current = null;
      socket.emit("stop-stream", roomId);
      socket.off("offer");
      socket.off("user-connected");
      socket.off("user-disconnected");
      socket.off("ice-candidate");
      socket.off("chat");
    };
  }, [roomId]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() === "") return;
    setMessages((prev) => [...prev, message]);
    console.log("Sending message:", message);
    socket.emit("chat", roomId, message);
    setMessage("");
  };
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
      <p>Viewers: {viewerCount}</p>
      <div style={{ display: "flex", gap: "2rem", alignItems: "end" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            style={{ width: "800px", height: "450px" }}
          />
          <button
            style={{ maxWidth: "150px", paddingBlock: "8px" }}
            onClick={startStream}
          >
            Start Streaming
          </button>
        </div>
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
              height: "auto",
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

export default StreamerPage;
