import React, { useState } from 'react';
import MainPage from '../MainPage';

const WebSocket = () => {
  // const [socketUrl, setSocketUrl] = useState('ws://localhost:8080');


  return (
    <MainPage
      socketUrl={socketUrl}
      lastMessage={lastMessage}
      {...{ readyState, getWebSocket, sendMessage }}
    />
  );
};

export default WebSocket;