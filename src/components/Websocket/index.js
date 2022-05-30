import React, { useState } from 'react';
import useWebSocket from 'react-use-websocket';
import MainPage from '../MainPage';

const WebSocket = () => {
  const [socketUrl, setSocketUrl] = useState('ws://localhost:8080');

  const { sendMessage, lastMessage, readyState, getWebSocket } =
    useWebSocket(socketUrl);


  return (
    <MainPage
      socketUrl={socketUrl}
      lastMessage={lastMessage}
      {...{ readyState, getWebSocket, sendMessage }}
    />
  );
};

export default WebSocket;
