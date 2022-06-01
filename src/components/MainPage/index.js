import React, { useState, useEffect, useCallback } from 'react';
import { ReadyState } from 'react-use-websocket';
import Button from '@mui/material/Button';
import DataChart from '../Chart/DataChart';

import { COMMANDS } from './config';
import DownloadModal from './DownloadModal';
import Pulse, { initPulseHistory } from '../Pulse';
import { Fab } from '@mui/material';
import { Add } from '@mui/icons-material';

// const mock = require('./Chart/sensor-example.json');

const getInitialData = () => ({
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

const MainPage = ({
  socketUrl,
  lastMessage,
  readyState,
  getWebSocket,
  sendMessage
}) => {
  const [counter, setCounter] = useState(0);
  const [stop, setStop] = useState(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [nameOfFile, setNameOfFile] = useState('foo');
  const [rating, setRating] = useState(0);
  const [fileData, setFileData] = useState(null);
  const [pulseResetState, setPulseReset] = useState(0);
  const [data, setData] = useState(getInitialData());
  const [value, setValue] = React.useState(0);

  const resetPulse = () => {
    setPulseReset(pulseResetState + 1);
  };

  const handleChange = (event, newValue) => {
    const nonNullValue = newValue === null ? 0 : newValue;
    setValue(nonNullValue);
  };

  const sendMessageToggle = () => {
    if (value === 0) sendMessage(COMMANDS.START_ALTERNATING);
    else if (value === 1) sendMessage(COMMANDS.START_740);
    else if (value === 2) sendMessage(COMMANDS.START_850);
  };

  const initMessageHistory = () => localStorage.setItem('messageHistory', '[');

  useEffect(initMessageHistory, []);

  useEffect(() => {
    if (stop) {
      // getWebSocket().close();
      return;
    }
    if (lastMessage !== null) {
      const d = JSON.parse(lastMessage.data);
      const saved = localStorage.getItem('messageHistory');
      const stringified = JSON.stringify(d) + ',';
      const newHistory = saved?.concat(stringified) || stringified;
      localStorage.setItem('messageHistory', newHistory);
      const limit = 100;
      const f = (a) => {
        return a.slice(-limit);
      };
      if (d.led === 740) {
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
          p1_850: [...f(data.p1_850), d.adc1],
          p2_850: [...f(data.p2_850), d.adc2],
          p3_850: [...f(data.p3_850), d.adc3],
          p4_850: [...f(data.p4_850), d.adc4]
        });
      }
      if (counter < limit) setCounter(counter + 1);
    }
  }, [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
  }[readyState];

  const x = lastMessage ? JSON.parse(lastMessage.data) : {};

  const keyPress = useCallback((e) => {
    console.log(e);
    if (e.key === '1') {
      sendMessage(COMMANDS.START_ALTERNATING);
    } else if (e.key === '2') {
      sendMessage(COMMANDS.START_740);
    } else if (e.key === '3') {
      sendMessage(COMMANDS.START_850);
    } else if (e.key === ' ') {
      // spacebar
      setStop(true);
      handleOpen();
      setNameOfFile('');
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keyup', keyPress);
    return () => document.removeEventListener('keyup', keyPress);
  }, [keyPress]);

  return (
    <div>
      <Button
        style={{ margin: 10 }}
        variant="outlined"
        onClick={() => {
          sendMessageToggle();
          setStop(false);
        }}
        disabled={readyState !== ReadyState.OPEN}
      >
        Start
      </Button>
      <Button
        style={{ margin: 10 }}
        variant="outlined"
        onClick={() => {
          setStop(true);
          handleOpen();
          setNameOfFile('');
        }}
        disabled={readyState !== ReadyState.OPEN}
      >
        Stop
      </Button>
      <div>Websocket status: {connectionStatus}</div>
      <Pulse
        startAdc={() => {
          sendMessageToggle();
          setStop(false);
        }}
        reset={pulseResetState}
      />
      {lastMessage && !stop ? (
        <div>
          <pre style={{ fontSize: '28px' }}>
            <span>
              <Fab sx={{ margin: 1 }} color="error" disabled={x.led !== 740}>
                740
              </Fab>
              <Fab sx={{ margin: 1 }} color="error" disabled={x.led !== 850}>
                850
              </Fab>
            </span>
            <span>
              {x.adc1} {x.adc2} {x.adc3} {x.adc4} {x.rating}
            </span>
          </pre>
        </div>
      ) : null}

      <div>
        {data?.time && data.time.length > 1 && (
          <DataChart data={data} disableTimerange={!stop} waveLength={value} />
        )}{' '}
      </div>
      {/* <div>{<DataChart data={mock} />}</div> */}
      <div>
        <DownloadModal
          setNameOfFile={setNameOfFile}
          nameOfFile={nameOfFile}
          rating={rating}
          setRating={setRating}
          // messageHistory={messageHistory}
          // setMessageHistory={setMessageHistory}
          open={open}
          onSaved={() => {
            setStop(true);
            setOpen(false);
            setRating(0);
            setFileData(null);
            setData();
            initMessageHistory();
            initPulseHistory();
            setData(getInitialData());
            setCounter(0);
            resetPulse();
          }}
          handleClose={handleClose}
        />
      </div>
    </div>
  );
};

export default MainPage;
