// StreamContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StreamContextType {
  stream: MediaStream | null;
  setStream: (stream: MediaStream | null) => void;
}

const StreamContext = createContext<StreamContextType | undefined>(undefined);

export const StreamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  return (
    <StreamContext.Provider value={{ stream, setStream }}>
      {children}
    </StreamContext.Provider>
  );
};

export const useStream = () => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error('useStream must be used within a StreamProvider');
  }
  return context;
};
