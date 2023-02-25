import React from "react";
import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const App = ({data}) => {
  
  

  // 2. render the line chart using the state
  return (
    <div>
      <ResponsiveContainer width="99%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis dataKey="uv" />
          <Line isAnimationActive={false}  dataKey="uv" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default App;
