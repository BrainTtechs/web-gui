/* App.js */
import React, { Component } from "react";
import CanvasJSReact from "./canvasjs.react";
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
var dataPoints1 = [];
var dataPoints2 = [];
var updateInterval = 1000;
const MAX_DATA_POINTS = 20;
//initial values
var yValue1 = 408;
var yValue2 = 350;
var xValue = 0.5;
class Chart extends Component {
  constructor() {
    super();
    this.updateChart = this.updateChart.bind(this);
    this.toggleDataSeries = this.toggleDataSeries.bind(this);
  }
  componentDidMount() {
    setInterval(this.updateChart, updateInterval);
  }
  toggleDataSeries(e) {
    if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    this.chart.render();
  }
  isInteger(N) {
    // Convert float value
    // of N to integer
    let X = Math.floor(N);
    let temp2 = N - X;

    // If N is not equivalent
    // to any integer
    if (temp2 > 0) {
      return false;
    }
    return true;
  }

  updateChart() {
    xValue += 0.5;
    yValue1 = Math.floor(Math.random() * (508 - 300 + 1) + 400);
    yValue2 = Math.floor(Math.random() * (450 - 240 + 1) + 340);
    dataPoints1.push({
      x: xValue,
      y: yValue1,
    });
    if (!this.isInteger(xValue) && xValue !== 0) dataPoints1.pop();
    if (dataPoints1.length > MAX_DATA_POINTS) {
      dataPoints1.shift();
    }
    dataPoints2.push({
      x: xValue,
      y: yValue2,
    });
    if (!this.isInteger(xValue)) dataPoints2.pop();
    if (dataPoints2.length > MAX_DATA_POINTS) {
      dataPoints2.shift();
    }
    this.chart.options.data[0].legendText = "850 nm -> " + yValue1;
    this.chart.options.data[1].legendText = "740 nm -> " + yValue2;
    this.chart.render();
  }
 
  render() {
    const options = {
      zoomEnabled: true,
      theme: "light2",
      height: this.props.height,
      title: {},
      axisX: {},
      axisY: {
        suffix: "",
      },
      toolTip: {
        shared: true,
      },
      legend: {
        cursor: "pointer",
        verticalAlign: "top",
        fontSize: 18,
        fontColor: "dimGrey",
        itemclick: this.toggleDataSeries,
      },
      data: [
        {
          type: "line",
          xValueFormatString: "# seconds",
          yValueFormatString: "0",
          showInLegend: true,
          name: "850nm",
          dataPoints: dataPoints1,
        },
        {
          type: "line",
          xValueFormatString: "# seconds",
          yValueFormatString: "0",
          showInLegend: true,
          name: "740nm",
          dataPoints: dataPoints2,
        },
      ],
    };
    return (
      <div>
        <CanvasJSChart options={options} onRef={(ref) => (this.chart = ref)} />
        {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
      </div>
    );
  }
}
export default Chart;
