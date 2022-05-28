import React, {
  useState,
  useEffect,
  useCallback,
  showModal,
  setShowModal
} from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import DataChart from '../Chart/DataChart';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { COMMANDS } from '../Websocket/config';
import Realtime from '.';

import {
  TimeSeries,
  TimeRange,
  TimeEvent,
  Pipeline as pipeline,
  Stream,
  EventOut,
  percentile
} from 'pondjs';

// const mock = require('./Chart/sensor-example.json');

const WebSocket = () => {
  // const [socketUrl, setSocketUrl] = useState("ws://192.168.43.243/ws");
  const [socketUrl, setSocketUrl] = useState('ws://localhost:8080'); // simulation config
  const [messageHistory, setMessageHistory] = useState([]);
  const [counter, setCounter] = useState(0);
  const [stop, setStop] = useState(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [nameOfFile, setNameOfFile] = useState('');
  const [fileData, setFileData] = useState(null);

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

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    const nonNullValue = newValue === null ? 0 : newValue;
    setValue(nonNullValue);
  };

  const sendMessageToggle = () => {
    if (value === 0) sendMessage(COMMANDS.START_ALTERNATING);
    else if (value === 1) sendMessage(COMMANDS.START_740);
    else if (value === 2) sendMessage(COMMANDS.START_850);
  };

  const { sendMessage, lastMessage, readyState, getWebSocket } =
    useWebSocket(socketUrl);

  const uploadFile = (event) => {
    let file = event.target.files[0];
    if (file) {
      var reader = new FileReader();
      var jsonData = [];
      reader.onload = function (event) {
        jsonData = JSON.parse(event.target.result);
        setFileData(jsonData);
        setCounter(counter + 1);
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (fileData !== null) {
      const d = fileData[counter];
      const limit = 100;
      if (d.led == 740) {
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
      if (counter < limit) setCounter(counter + 1);
    }
  }, [counter]);

  useEffect(() => {
    if (stop) {
      getWebSocket().close();
      return;
    }
    if (lastMessage !== null) {
      console.log({ lastMessage });
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
      if (counter < limit) setCounter(counter + 1);
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

  const keyPress = useCallback(
    (e) => {
      console.log(e);
      if (e.key === '1') {
        sendMessage(COMMANDS.START_ALTERNATING);
      } else if (e.key === '2') {
        sendMessage(COMMANDS.START_740);
      } else if (e.key === '3') {
        sendMessage(COMMANDS.START_850);
      } else if (e.key === 'Enter') {
        setStop(true);
      }
    },
    [setShowModal, showModal]
  );

  useEffect(() => {
    document.addEventListener('keyup', keyPress);
    return () => document.removeEventListener('keyup', keyPress);
  }, [keyPress]);

  const getNewEvent = (t) => {
    const base = Math.sin(t.getTime() / 10000000) * 350 + 500;
    const val = parseInt(base + Math.random() * 1000, 10);
    console.log({ t });
    return new TimeEvent(t, val);
  };

  const getStream = (x) => {
    console.log(x);
  };

  return (
    <div>
      <div>Websocket status: {connectionStatus}</div>
      <Button
        style={{ margin: 10 }}
        variant="outlined"
        onClick={() => sendMessageToggle()}
        disabled={readyState !== ReadyState.OPEN}
      >
        Start
      </Button>
      <Realtime event2={getNewEvent} />
    </div>
  );
};

export default WebSocket;
