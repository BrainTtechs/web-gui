import React, { useEffect, useState } from 'react';
import Ring from 'ringjs';

import useWebSocket, { ReadyState } from 'react-use-websocket';
import { COMMANDS } from '../Websocket/config';

import {
  TimeSeries,
  TimeRange,
  TimeEvent,
  Pipeline as pipeline,
  Stream,
  EventOut,
  percentile
} from 'pondjs';

import {
  ScatterChart,
  BarChart,
  AreaChart,
  Baseline,
  BoxChart,
  ChartContainer,
  ChartRow,
  Charts,
  LabelAxis,
  YAxis,
  LineChart,
  ValueAxis,
  Resizable,
  Legend,
  Brush,
  styler
} from 'react-timeseries-charts';

const sec = 1000;
const minute = 60 * sec;
const hours = 60 * minute;

const createFnirs = () => ({
  p1_740: new Ring(100),
  p2_740: new Ring(100),
  p3_740: new Ring(100),
  p4_740: new Ring(100),
  p1_850: new Ring(100),
  p2_850: new Ring(100),
  p3_850: new Ring(100),
  p4_850: new Ring(100)
});

const Realtime = () => {
  const [initialTime, setInitialTime] = useState(new Date());
  //   const [time, setTime] = useState(new Date(2015, 0, 1));
  const [time, setTime] = useState(new Date());
  const [events, setEvents] = useState(createFnirs());
  const {
    sendMessage,
    lastJsonMessage,
    lastMessage,
    readyState,
    getWebSocket
  } = useWebSocket('ws://localhost:8080');
  //  = useWebSocket('ws://192.168.43.243/ws');

  useEffect(() => {
    setTimeout(() => sendMessage(COMMANDS.START_740), 1000);
  }, []);

  //   console.log({lastJsonMessage});

  useEffect(() => {
    const stream = new Stream();

    // const t = new Date();

    // Raw events
    if (lastJsonMessage) {
      console.log({ lastJsonMessage });
      const timestamp = lastMessage.timeStamp;
      // console.log(new Date(a));
      const t = new Date(initialBeginTime.getTime() + timestamp);
      const newEvents = events;
      if (lastJsonMessage.led == 740) {
        newEvents.p1_740.push(new TimeEvent(t, lastJsonMessage.adc1));
        newEvents.p2_740.push(new TimeEvent(t, lastJsonMessage.adc2));
        newEvents.p3_740.push(new TimeEvent(t, lastJsonMessage.adc3));
        newEvents.p4_740.push(new TimeEvent(t, lastJsonMessage.adc4));
      } else {
        newEvents.p1_850.push(new TimeEvent(t, lastJsonMessage.adc1));
        newEvents.p2_850.push(new TimeEvent(t, lastJsonMessage.adc2));
        newEvents.p3_850.push(new TimeEvent(t, lastJsonMessage.adc3));
        newEvents.p4_850.push(new TimeEvent(t, lastJsonMessage.adc4));
      }
      setEvents(newEvents);
      setTime(t);
    }

    // Let our aggregators process the event
    // stream.addEvent(event);
  }, [lastJsonMessage]);

  useEffect(() => {
    const interval = setInterval(() => sendMessage('1'), 5000);
    return () => clearInterval(interval);
  }, []);

  const latestTime = `${time}`;

  const fiveMinuteStyle = {
    value: {
      normal: { fill: '#619F3A', opacity: 0.2 },
      highlight: { fill: '619F3A', opacity: 0.5 },
      selected: { fill: '619F3A', opacity: 0.5 }
    }
  };

  const scatterStyle = {
    value: {
      normal: {
        fill: 'steelblue',
        opacity: 0.5
      }
    }
  };

  //
  // Create a TimeSeries for our raw, 5min and hourly events
  //

  const p1_740Series = new TimeSeries({
    name: 'p1_740',
    events: events.p1_740.toArray()
  });
  const p2_740Series = new TimeSeries({
    name: 'p2_740',
    events: events.p2_740.toArray()
  });
  const p3_740Series = new TimeSeries({
    name: 'p3_740',
    events: events.p3_740.toArray()
  });
  const p4_740Series = new TimeSeries({
    name: 'p4_740',
    events: events.p3_740.toArray()
  });
  const p1_850Series = new TimeSeries({
    name: 'p1_740',
    events: events.p1_740.toArray()
  });
  const p2_850Series = new TimeSeries({
    name: 'p2_740',
    events: events.p2_740.toArray()
  });
  const p3_850Series = new TimeSeries({
    name: 'p3_740',
    events: events.p3_740.toArray()
  });
  const p4_850Series = new TimeSeries({
    name: 'p4_740',
    events: events.p3_740.toArray()
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
  const timeWindow = 10 * sec;

  let beginTime;
  const endTime = new Date(time.getTime() + 200);
  if (endTime.getTime() - timeWindow < initialBeginTime.getTime()) {
    beginTime = initialBeginTime;
  } else {
    beginTime = new Date(endTime.getTime() - timeWindow);
  }
  const timeRange = new TimeRange(beginTime, endTime);

  const series = [
    {
      series: p1_740Series,
      color: '#d32f2f'
    },
    {
      series: p2_740Series,
      color: '#1976d2'
    },
    {
      series: p3_740Series,
      color: 'green'
    },
    {
      series: p4_740Series,
      color: '#9c27b0'
    },
    {
      series: p1_850Series,
      color: '#ed6c02'
    },
    {
      series: p2_850Series,
      color: '#0288d1'
    },
    {
      series: p3_850Series,
      color: '#2e7d32'
    },
    {
      series: p4_850Series,
      color: 'steelblue'
    }
  ];

  const charts = series.map((s) => (
    <ChartRow height="100">
      <YAxis id="y" label="Value" min={0} max={4097} width="70" type="linear" />
      <Charts>
        {/* <LineChart axis="y" series={s} style={style} /> */}
        <LineChart
          axis="y"
          series={s.series}
          style={{ value: { normal: { stroke: s.color, strokeWidth: 3 } } }}
        />
      </Charts>
    </ChartRow>
  ));

  const dateStyle = {
    fontSize: 12,
    color: '#AAA',
    borderWidth: 1,
    borderColor: '#F4F4F4'
  };

  // const style = styler([
  //   { key: 'perc50', color: '#C5DCB7', width: 1, dashed: true },
  //   { key: 'perc90', color: '#DFECD7', width: 2 }
  // ]);

  return (
    <div>
      <div className="row">
        <div className="col-md-8">
          <span style={dateStyle}>{latestTime}</span>
          <span>{readyState}</span>
        </div>
      </div>
      <hr />
      <div className="row">
        <div className="col-md-12">
          <Resizable>
            <ChartContainer timeRange={timeRange}>{charts}</ChartContainer>
          </Resizable>
        </div>
      </div>
    </div>
  );
};

// Export example
export default Realtime;
