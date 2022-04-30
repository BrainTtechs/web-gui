import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import MultiChannelChart from './Chart';
import Chart from './Chart';
import DataChart from './Chart/DataChart';

const mock =  require('./Chart/sensor-example.json')

export const WebSocketDemo = () => {
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState('ws://192.168.43.61/ws');
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

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (stop) return;
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
      const d = JSON.parse(lastMessage.data);
      //   console.log({ d });
      if (d.led === 740) {
        setData({
          ...data,
          time: [...data.time, counter],
          p1_740: [...data.p1_740, d.adc1],
          p2_740: [...data.p2_740, d.adc2],
          p3_740: [...data.p3_740, d.adc3],
          p4_740: [...data.p4_740, d.adc4]
        });
        setCounter(counter + 1);
      } else {
        setData({
          ...data,
          time: [...data.time, counter],
          p1_850: [...data.p1_850, d.adc1],
          p2_850: [...data.p2_850, d.adc2],
          p3_850: [...data.p3_850, d.adc3],
          p4_850: [...data.p4_850, d.adc4]
        });
      }
    }
  }, [lastMessage, setMessageHistory]);

  const handleClickChangeSocketUrl = useCallback(
    () => setSocketUrl('wss://demos.kaazing.com/echo'),
    []
  );

  //const handleClickSendMessage = useCallback(() => sendMessage('Hello'), []);
  const handleClickSendMessage = useCallback(() => sendMessage('yey'), []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
  }[readyState];

  //   console.log({ data });

  return (
    <div>
      <div>Websocket status: {connectionStatus}</div>
      <button
        onClick={handleClickSendMessage}
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
      {/* {lastMessage ? <div>Last message: {lastMessage.data}</div> : null} */}
      <div>
        {data?.time && data.time.length > 1 && <DataChart data={data} />}
      </div>
      {/* <div>{<DataChart data={mock} />}</div> */}
    </div>
  );
};
