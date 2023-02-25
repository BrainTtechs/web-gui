import React, { useEffect, useState } from "react";
import Ring from "ringjs";

import useWebSocket, { ReadyState } from "react-use-websocket";
import { COMMANDS } from "../MainPage/config";
import Typography from "@mui/material/Typography";
import {
  TimeSeries,
  TimeRange,
  TimeEvent,
  Pipeline as pipeline,
  Stream,
  EventOut,
  percentile,
} from "pondjs";

const sec = 1000;
const minute = 60 * sec;
const hours = 60 * minute;

export const initPulseHistory = () => localStorage.setItem("pulseHistory", "[");

const Pulse = ({ startAdc, reset, bpm, setBpm }) => {
  const [initialTime, setInitialTime] = useState(new Date());

  //   const [time, setTime] = useState(new Date(2015, 0, 1));
  const [time, setTime] = useState(new Date());
  const [started, setStarted] = useState(false);
  const [events, setEvents] = useState(new Ring(100));

  const {
    sendMessage,
    lastJsonMessage,
    lastMessage,
    readyState,
    getWebSocket,
  } = useWebSocket("ws://192.168.43.61:80/ws");

  useEffect(initPulseHistory, []);
  useEffect(() => lastMessage?.data && setBpm(lastMessage.data), [lastMessage]);

  const resetState = () => {
    setTime(new Date());
    setStarted(false);
    setEvents(new Ring(100));
    initPulseHistory();
    setBpm("--");
  };

  useEffect(resetState, [reset]);

  useEffect(() => {
    const stream = new Stream();

    // const t = new Date();

    // Raw events
    if (lastMessage?.data) {
      console.log({ lastMessage });

      const saved = localStorage.getItem("pulseHistory");
      const stringified = lastMessage.data + ",";
      const newHistory = saved?.concat(stringified) || stringified;
      localStorage.setItem("pulseHistory", newHistory);
      if (!started) {
        startAdc();
        setStarted(true);
      }

      const timestamp = lastMessage.timeStamp;
      // console.log(new Date(a));
      const t = new Date(initialBeginTime.getTime() + timestamp);
      const newEvents = events;
      if (lastMessage) {
        newEvents.push(new TimeEvent(t, parseInt(lastMessage.data)));
      }
      setEvents(newEvents);
      setTime(t);
    }

    // Let our aggregators process the event
    // stream.addEvent(event);
  }, [lastJsonMessage]);

  const latestTime = `${time}`;

  const fiveMinuteStyle = {
    value: {
      normal: { fill: "#619F3A", opacity: 0.2 },
      highlight: { fill: "619F3A", opacity: 0.5 },
      selected: { fill: "619F3A", opacity: 0.5 },
    },
  };

  const scatterStyle = {
    value: {
      normal: {
        fill: "steelblue",
        opacity: 0.5,
      },
    },
  };

  //
  // Create a TimeSeries for our raw, 5min and hourly events
  //

  const pulseSeries = new TimeSeries({
    name: "raw",
    events: events.toArray(),
  });

  //   console.log(events.toArray());

  //   const eventSeries = new TimeSeries({
  //     name: 'raw',
  //     events: events.toArray()
  //   });

  // Timerange for the chart axis
  //   const initialBeginTime = new Date(2015, 0, 1);
  const initialBeginTime = initialTime;
  //   const timeWindow = 3 * hours;
  const timeWindow = 30 * sec;

  const dateStyle = {
    fontSize: 12,
    color: "#AAA",
    borderWidth: 1,
    borderColor: "#F4F4F4",
  };

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return (
    <div>
      <div className="row">
        <div className="col-md-8">
          <Typography variant="h5" style={{ textAlign: "start", color:(readyState === ReadyState.OPEN ? "green" : readyState === ReadyState.CLOSED ? "red" : "inherit")}}>
            &nbsp; Pulsemeter: &nbsp;{connectionStatus}
          </Typography>
          <div></div>
        </div>
      </div>
    </div>
  );
};

// Export example
export default Pulse;
