import React from "react";
import ReactDOM from "react-dom";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const App = ({}) => {
  const [data, setData] = useState([
    { time: 0, uv: 4000 },
    { time: 1, uv: 3000 },
    { time: 2, uv: 5000 },
    { time: 3, uv: 4000 },
    { time: 4, uv: 7000 },
    { time: 5, uv: 4000 },
    { time: 6, uv: 7000 },
    { time: 7, uv: 4000 },
    { time: 8, uv: 7000 },
    { time: 9, uv: 4000 },
    { time: 10, uv: 7000 },
    { time: 11, uv: 4000 },
    { time: 12, uv: 7000 },
  ]);
  const hs = () => {
    setData((currentData) => [
      ...currentData,
      {
        time: currentData[currentData.length - 1].time + 1,
        uv: Math.random() * 6000,
      },
    ]);
    //if there are more than 20 data, delete first object

    if (data.length > 20) {
      setData((currentData) => [...currentData.slice(1)]);
    }
  };

  // 2. render the line chart using the state
  return (
    <div>
      <button onClick={hs}>add</button>
      <ResponsiveContainer width="99%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis dataKey="uv" />
          <Line dataKey="uv" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default App;
