import 'moment-duration-format';
import moment from 'moment';
import React from 'react';
import { format } from 'd3-format';
import _ from 'underscore';

import { TimeSeries, TimeRange, avg, percentile, median } from 'pondjs';

import {
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
  Brush
} from 'react-timeseries-charts';

const speedFormat = format('.1f');

class MultiChannelChart extends React.Component {
  constructor(props) {
    super(props);
    const initialRange = new TimeRange([0 * 60 * 1000, 1 * 60 * 1000]);
    const { channels, channelNames, displayChannels, rollupLevels } =
      this.props;

    this.state = {
      ready: false,
      mode: 'channels',
      channels,
      channelNames,
      displayChannels,
      rollupLevels,
      rollup: '1m',
      tracker: null,
      timerange: initialRange,
      brushrange: initialRange
    };
  }

  handleTrackerChanged = (t) => {
    this.setState({ tracker: t });
  };

  // Handles when the brush changes the timerange
  handleTimeRangeChange = (timerange) => {
    if (this.props.disableTimerange) return;
    const { channels } = this.state;
    const { baseChannel } = this.props;

    if (timerange) {
      this.setState({ timerange, brushrange: timerange });
    } else if (channels[baseChannel].range) {
      this.setState({
        timerange: channels[baseChannel].range?.(),
        brushrange: null
      });
    }
  };

  handleChartResize = (width) => {
    this.setState({ width });
  };

  handleActiveChange = (channelName) => {
    const channels = this.state.channels;
    channels[channelName].show = !channels[channelName].show;
    this.setState({ channels });
  };

  renderChart = () => {
    if (this.state.mode === 'multiaxis') {
      return this.renderMultiAxisChart();
    } else if (this.state.mode === 'channels') {
      return this.renderChannelsChart();
    } else if (this.state.mode === 'rollup') {
      return this.renderBoxChart();
    }
    return <div>No chart</div>;
  };

  renderChannelsChart = () => {
    const {
      timerange,
      displayChannels,
      channels,
      maxTime,
      minTime,
      minDuration
    } = this.state;
    const { style, baselineStyles } = this.props;

    const durationPerPixel = timerange.duration() / 800 / 1000;
    const rows = [];

    for (let channelName of displayChannels) {
      const charts = [];
      let series = channels[channelName].series;
      _.forEach(channels[channelName].rollups, (rollup) => {
        if (rollup.duration < durationPerPixel * 2) {
          series = rollup.series.crop(timerange);
        }
      });

      charts.push(
        <LineChart
          key={`line-${channelName}`}
          axis={`${channelName}_axis`}
          series={series}
          columns={[channelName]}
          style={style}
          breakLine
        />
      );
      charts.push(
        <Baseline
          key={`baseline-${channelName}`}
          axis={`${channelName}_axis`}
          style={baselineStyles.speed}
          value={channels[channelName].avg}
        />
      );

      // Get the value at the current tracker position for the ValueAxis
      let value = '--';
      if (this.state.tracker) {
        const approx =
          (+this.state.tracker - +timerange.begin()) /
          (+timerange.end() - +timerange.begin());
        const ii = Math.floor(approx * series.size());
        const i = series.bisect(new Date(this.state.tracker), ii);
        const v = i < series.size() ? series.at(i).get(channelName) : null;
        if (v) {
          value = parseInt(v, 10);
        }
      }

      // Get the summary values for the LabelAxis

      const summary = [
        { label: 'Max', value: speedFormat(channels[channelName].max) },
        { label: 'Avg', value: speedFormat(channels[channelName].avg) }
      ];

      rows.push(
        <ChartRow
          height="100"
          visible={channels[channelName].show}
          key={`row-${channelName}`}
        >
          <LabelAxis
            id={`${channelName}_axis`}
            label={channels[channelName].label}
            values={summary}
            min={channels[channelName].min - 1 || 0}
            max={channels[channelName].max + 1}
            width={140}
            type="linear"
            format=",.1f"
          />
          <Charts>{charts}</Charts>
          <ValueAxis
            id={`${channelName}_valueaxis`}
            value={value}
            detail={channels[channelName].units}
            width={120}
            min={0}
            max={35}
          />
        </ChartRow>
      );
    }

    return (
      <ChartContainer
        timeRange={this.state.timerange}
        format="relative"
        showGrid={false}
        enablePanZoom
        maxTime={maxTime}
        minTime={minTime}
        minDuration={minDuration}
        trackerPosition={this.state.tracker}
        onTimeRangeChanged={this.handleTimeRangeChange}
        onChartResize={(width) => this.handleChartResize(width)}
        onTrackerChanged={this.handleTrackerChanged}
      >
        {rows}
      </ChartContainer>
    );
  };

  renderBoxChart = () => {
    const {
      timerange,
      displayChannels,
      channels,
      maxTime,
      minTime,
      minDuration
    } = this.state;
    const { style, baselineStyles } = this.props;

    const rows = [];

    for (let channelName of displayChannels) {
      const charts = [];
      const series = channels[channelName].series;

      charts.push(
        <BoxChart
          key={`box-${channelName}`}
          axis={`${channelName}_axis`}
          series={series}
          column={channelName}
          style={style}
          aggregation={{
            size: this.state.rollup,
            reducers: {
              outer: [percentile(5), percentile(95)],
              inner: [percentile(25), percentile(75)],
              center: median()
            }
          }}
        />
      );
      charts.push(
        <Baseline
          key={`baseline-${channelName}`}
          axis={`${channelName}_axis`}
          style={baselineStyles.speed}
          value={channels[channelName].avg}
        />
      );

      // Get the value at the current tracker position for the ValueAxis
      let value = '--';
      if (this.state.tracker) {
        const approx =
          (+this.state.tracker - +timerange.begin()) /
          (+timerange.end() - +timerange.begin());
        const ii = Math.floor(approx * series.size());
        const i = series.bisect(new Date(this.state.tracker), ii);
        const v = i < series.size() ? series.at(i).get(channelName) : null;
        if (v) {
          value = parseInt(v, 10);
        }
      }

      // Get the summary values for the LabelAxis
      const summary = [
        { label: 'Max', value: speedFormat(channels[channelName].max) },
        { label: 'Avg', value: speedFormat(channels[channelName].avg) }
      ];

      rows.push(
        <ChartRow
          height="100"
          visible={channels[channelName].show}
          key={`row-${channelName}`}
        >
          <LabelAxis
            id={`${channelName}_axis`}
            label={channels[channelName].label}
            values={summary}
            min={channels[channelName].min - 1 || 0}
            max={channels[channelName].max + 1}
            width={140}
            type="linear"
            format=",.1f"
          />
          <Charts>{charts}</Charts>
          <ValueAxis
            id={`${channelName}_valueaxis`}
            value={value}
            detail={channels[channelName].units}
            width={80}
            min={0}
            max={35}
          />
        </ChartRow>
      );
    }

    return (
      <ChartContainer
        timeRange={this.state.timerange}
        format="relative"
        showGrid={false}
        enablePanZoom
        maxTime={maxTime}
        minTime={minTime}
        minDuration={minDuration}
        trackerPosition={this.state.tracker}
        onTimeRangeChanged={this.handleTimeRangeChange}
        onChartResize={(width) => this.handleChartResize(width)}
        onTrackerChanged={this.handleTrackerChanged}
      >
        {rows}
      </ChartContainer>
    );
  };

  renderMultiAxisChart() {
    const {
      timerange,
      displayChannels,
      channels,
      maxTime,
      minTime,
      minDuration
    } = this.state;
    const { style } = this.props;

    const durationPerPixel = timerange.duration() / 800 / 1000;

    // Line charts
    const charts = [];
    for (let channelName of displayChannels) {
      let series = channels[channelName].series;
      _.forEach(channels[channelName].rollups, (rollup) => {
        if (rollup.duration < durationPerPixel * 2) {
          series = rollup.series.crop(timerange);
        }
      });

      charts.push(
        <LineChart
          key={`line-${channelName}`}
          axis={`${channelName}_axis`}
          visible={channels[channelName].show}
          series={series}
          columns={[channelName]}
          style={style}
          breakLine
        />
      );
    }

    // Tracker info box
    const trackerInfoValues = displayChannels
      .filter((channelName) => channels[channelName].show)
      .map((channelName) => {
        const fmt = format(channels[channelName].format);

        let series = channels[channelName].series.crop(timerange);

        let v = '--';
        if (this.state.tracker) {
          const i = series.bisect(new Date(this.state.tracker));
          const vv = series.at(i).get(channelName);
          if (vv) {
            v = fmt(vv);
          }
        }

        const label = channels[channelName].label;
        const value = `${v} ${channels[channelName].units}`;

        return { label, value };
      });

    // Axis list
    const axisList = [];
    for (let channelName of displayChannels) {
      const label = channels[channelName].label;
      const max = channels[channelName].max + 1;
      const min = channels[channelName].min - 1;
      const format = channels[channelName].format;
      const id = `${channelName}_axis`;
      const visible = channels[channelName].show;
      axisList.push(
        <YAxis
          id={id}
          key={id}
          visible={visible}
          label={label}
          min={min}
          max={max}
          width={70}
          type="linear"
          format={format}
        />
      );
    }

    return (
      <ChartContainer
        timeRange={this.state.timerange}
        format="relative"
        trackerPosition={this.state.tracker}
        onTrackerChanged={this.handleTrackerChanged}
        trackerShowTime
        enablePanZoom
        maxTime={maxTime}
        minTime={minTime}
        minDuration={minDuration}
        onTimeRangeChanged={this.handleTimeRangeChange}
      >
        <ChartRow
          height="200"
          trackerInfoValues={trackerInfoValues}
          trackerInfoHeight={10 + trackerInfoValues.length * 16}
          trackerInfoWidth={140}
        >
          {axisList}
          <Charts>{charts}</Charts>
        </ChartRow>
      </ChartContainer>
    );
  }

  renderBrush = () => {
    const { channels } = this.state;
    const { style, baseChannel } = this.props;

    return (
      <ChartContainer
        timeRange={channels[baseChannel].series.range()}
        format="relative"
        trackerPosition={this.state.tracker}
      >
        <ChartRow height="100" debug={false}>
          <Brush
            timeRange={this.state.brushrange}
            allowSelectionClear
            onTimeRangeChanged={this.handleTimeRangeChange}
          />
          <YAxis
            id="axis1"
            label={baseChannel}
            min={0}
            max={channels[baseChannel].max}
            width={70}
            type="linear"
            format="d"
          />
          <Charts>
            <AreaChart
              axis="axis1"
              style={style.areaChartStyle()}
              columns={{ up: [baseChannel], down: [] }}
              series={channels[baseChannel].series}
            />
          </Charts>
        </ChartRow>
      </ChartContainer>
    );
  };

  renderMode = () => {
    const linkStyle = {
      fontWeight: 600,
      color: 'grey',
      cursor: 'default'
    };

    const linkStyleActive = {
      color: 'steelblue',
      cursor: 'pointer'
    };

    return (
      <div className="col-md-6" style={{ fontSize: 14, color: '#777' }}>
        <span
          style={this.state.mode !== 'multiaxis' ? linkStyleActive : linkStyle}
          onClick={() => this.setState({ mode: 'multiaxis' })}
        >
          Multi-axis
        </span>
        <span> | </span>
        <span
          style={this.state.mode !== 'channels' ? linkStyleActive : linkStyle}
          onClick={() => this.setState({ mode: 'channels' })}
        >
          Channels
        </span>
        {/* <span> | </span> */}
        {/* <span
          style={this.state.mode !== 'rollup' ? linkStyleActive : linkStyle}
          onClick={() => this.setState({ mode: 'rollup' })}
        >
          Rollups
        </span> */}
      </div>
    );
  };

  renderModeOptions = () => {
    const linkStyle = {
      fontWeight: 600,
      color: 'grey',
      cursor: 'default'
    };

    const linkStyleActive = {
      color: 'steelblue',
      cursor: 'pointer'
    };

    if (this.state.mode === 'multiaxis') {
      return <div />;
    } else if (this.state.mode === 'channels') {
      return <div />;
    } else if (this.state.mode === 'rollup') {
      return (
        <div className="col-md-6" style={{ fontSize: 14, color: '#777' }}>
          <span
            style={this.state.rollup !== '5s' ? linkStyleActive : linkStyle}
            onClick={() => this.setState({ rollup: '10s' })}
          >
            1m
          </span>
          <span> | </span>
          <span
            style={this.state.rollup !== '10s' ? linkStyleActive : linkStyle}
            onClick={() => this.setState({ rollup: '10s' })}
          >
            5m
          </span>
          <span> | </span>
          <span
            style={this.state.rollup !== '15s' ? linkStyleActive : linkStyle}
            onClick={() => this.setState({ rollup: '15s' })}
          >
            15m
          </span>
        </div>
      );
    }
    return <div />;
  };

  render() {
    const { data, baseChannel } = this.props;
    setTimeout(() => {
      const { channelNames, channels, displayChannels, rollupLevels } =
        this.state;

      const points = data;

      // Make the TimeSeries here from the points collected above
      for (let channelName of channelNames) {
        // The TimeSeries itself, for this channel
        const series = new TimeSeries({
          name: channels[channelName].name,
          columns: ['time', channelName],
          points: points[channelName]
        });

        if (_.contains(displayChannels, channelName)) {
          const rollups = _.map(rollupLevels, (rollupLevel) => {
            return {
              duration: parseInt(rollupLevel.split('s')[0], 10),
              series: series.fixedWindowRollup({
                windowSize: rollupLevel,
                aggregation: { [channelName]: { [channelName]: avg() } }
              })
            };
          });

          // Rollup series levels
          channels[channelName].rollups = rollups;
        }

        // Raw series
        channels[channelName].series = series;

        // Some simple statistics for each channel
        channels[channelName].avg = parseInt(series.avg(channelName), 10);
        channels[channelName].min = parseInt(series.min(channelName), 10);
        channels[channelName].max = parseInt(series.max(channelName), 10);
      }

      // Min and max time constraints for pan/zoom, along with the smallest timerange
      // the user can zoom into. These are passed into the ChartContainers when we come to
      // rendering.

      const minTime = channels[baseChannel].series.range().begin();
      const maxTime = channels[baseChannel].series.range().end();
      const minDuration = 10 * 60 * 1000;

      this.setState({ ready: true, channels, minTime, maxTime, minDuration });
    }, 0);

    const { ready, channels, displayChannels } = this.state;
    const { style } = this.props;

    if (!ready) {
      return <div>{`Building rollups...`}</div>;
    }
    const chartStyle = {
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#DDD',
      paddingTop: 10,
      marginBottom: 10
    };

    const brushStyle = {
      boxShadow: 'inset 0px 2px 5px -2px rgba(189, 189, 189, 0.75)',
      background: '#FEFEFE',
      paddingTop: 10
    };

    // Generate the legend
    const legend = displayChannels.map((channelName) => ({
      key: channelName,
      label: channels[channelName].label,
      disabled: !channels[channelName].show
    }));

    return (
      <div>
        <div className="row">
          {this.renderMode()}
          {this.renderModeOptions()}
        </div>
        <div className="row">
          <div className="col-md-12">
            <hr />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <Legend
              type={this.state.mode === 'rollup' ? 'swatch' : 'line'}
              style={style}
              categories={legend}
              onSelectionChange={this.handleActiveChange}
            />
          </div>

          <div className="col-md-6">
            {this.state.tracker
              ? `${moment.duration(+this.state.tracker).format()}`
              : '-:--:--'}
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <hr />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12" style={chartStyle}>
            <Resizable>
              {ready ? this.renderChart() : <div>Loading.....</div>}
            </Resizable>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12" style={brushStyle}>
            <Resizable>{ready ? this.renderBrush() : <div />}</Resizable>
          </div>
        </div>
      </div>
    );
  }
}

export default MultiChannelChart;
