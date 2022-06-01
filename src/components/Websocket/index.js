import React, { useState } from 'react';
import useWebSocket from 'react-use-websocket';
import MainPage from '../MainPage';

const WebSocket = () => {
  // const [socketUrl, setSocketUrl] = useState('ws://localhost:8080');
  const [socketUrl, setSocketUrl] = useState('ws://192.168.43.243/ws');

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
