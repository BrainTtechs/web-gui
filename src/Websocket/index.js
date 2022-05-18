import React, { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import DataChart from '../Chart/DataChart';
import { COMMANDS } from './config';

// const mock = require('./Chart/sensor-example.json');

const WebSocket = () => {
  const [socketUrl, setSocketUrl] = useState('ws://192.168.43.243/ws');
  const [messageHistory, setMessageHistory] = useState([]);
  const [counter, setCounter] = useState(0);
  const [stop, setStop] = useState(false);
  const [data, setData] = useState({
    time: [],
    p1_740: [],
    p2_740: [],
    p3_740: [],
    p4_740: [],
    p1_850: [],
    p2_850: [],
    p3_850: [],
    p4_850: []
  });

  const { sendMessage, lastMessage, readyState, getWebSocket } =
    useWebSocket(socketUrl);

  const save = () => {
    function download(content, fileName, contentType) {
      var a = document.createElement('a');
      var file = new Blob([content], { type: contentType });
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
    }
    download(JSON.stringify(messageHistory), 'history.json', 'text/plain');
  };

  useEffect(() => {
    if (stop) {
      getWebSocket().close();
      save();
      return;
    }
    if (lastMessage !== null) {
      const d = JSON.parse(lastMessage.data);
      setMessageHistory((prev) => prev.concat(d));
      //   console.log({ d });
      const limit = 100;
      if (d.led === 740) {
        const f = (a) => {
          return a.slice(-limit);
        };

        setData({
          ...data,
          time: [...data.time, counter],
          p1_740: [...f(data.p1_740), d.adc1],
          p2_740: [...f(data.p2_740), d.adc2],
          p3_740: [...f(data.p3_740), d.adc3],
          p4_740: [...f(data.p4_740), d.adc4]
        });
        if (counter < limit) setCounter(counter + 1);
      } else {
        // setData({
        //   ...data,
        //   time: [...data.time, counter],
        //   p1_850: [...data.p1_850, d.adc1],
        //   p2_850: [...data.p2_850, d.adc2],
        //   p3_850: [...data.p3_850, d.adc3],
        //   p4_850: [...data.p4_850, d.adc4]
        // });
      }
    }
  }, [lastMessage, setMessageHistory]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
  }[readyState];

  //   console.log({ data });
  console.log('render');

  const x = lastMessage ? JSON.parse(lastMessage.data) : {};
  console.log({ x });

  useEffect(() => {
    const l = window.addEventListener('keypress', (e) => {
      console.log(e);
      if (e.key === ' ') {
        sendMessage(COMMANDS.START);
      }
      if (e.key === 'Enter') {
        setStop(true);
      }
    });
  }, []);

  return (
    <div>
      <div>Websocket status: {connectionStatus}</div>
      <button
        onClick={() => sendMessage(COMMANDS.START)}
        disabled={readyState !== ReadyState.OPEN}
      >
        Start
      </button>
      <button
        onClick={() => setStop(true)}
        disabled={readyState !== ReadyState.OPEN}
      >
        Stop
      </button>
      {lastMessage ? (
        <pre style={{ fontSize: '40px' }}>
          {x.adc1} {x.adc2} {x.adc3} {x.adc4}
        </pre>
      ) : null}
      <div>
        {data?.time && data.time.length > 1 && (
          <DataChart data={data} disableTimerange={!stop} />
        )}
      </div>
      {/* <div>{<DataChart data={mock} />}</div> */}
    </div>
  );
};

export default WebSocket;
