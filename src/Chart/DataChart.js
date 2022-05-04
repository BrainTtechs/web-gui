import MultiChannelChart from './index';
import { styler } from 'react-timeseries-charts';

const DataChart = ({ data }) => {
  const style = styler([
    { key: 'p1_740', color: '#d32f2f', width: 4 },
    { key: 'p2_740', color: '#1976d2', width: 4 },
    { key: 'p3_740', color: 'green', width: 4 },
    { key: 'p4_740', color: '#9c27b0', width: 4 },
    { key: 'p1_850', color: '#ed6c02', width: 4 },
    { key: 'p2_850', color: '#0288d1', width: 4 },
    { key: 'p3_850', color: '#2e7d32', width: 4 },
    { key: 'p4_850', color: 'steelblue', width: 4 }
  ]);

  const baselineStyles = {
    p1_740: {
      stroke: 'steelblue',
      opacity: 0.5,
      width: 0.25
    }
  };

  const channels = {
    p1_740: {
      units: 'raw',
      label: 'd=5 (740nm)',
      format: 'd',
      series: null,
      show: true
    },
    p2_740: {
      units: 'raw',
      label: 'd=10 (740nm)',
      format: 'd',
      series: null,
      show: true
    },
    p3_740: {
      units: 'raw',
      label: 'd=23 (740nm)',
      format: 'd',
      series: null,
      show: true
    },
    p4_740: {
      units: 'raw',
      label: 'd=28 (740nm)',
      format: 'd',
      series: null,
      show: true
    },
    p1_850: {
      units: 'raw',
      label: 'd=5 (850nm)',
      format: 'd',
      series: null,
      show: true
    },
    p2_850: {
      units: 'raw',
      label: 'd=10 (850nm)',
      format: 'd',
      series: null,
      show: true
    },
    p3_850: {
      units: 'raw',
      label: 'd=23 (850nm)',
      format: 'd',
      series: null,
      show: true
    },
    p4_850: {
      units: 'raw',
      label: 'd=28 (850nm)',
      format: 'd',
      series: null,
      show: true
    }
  };

  const channelNames = [
    'p1_740',
    'p2_740',
    'p3_740',
    'p4_740',
    'p1_850',
    'p2_850',
    'p3_850',
    'p4_850'
  ];

  const getPoints = () => {
    const points = {};
    channelNames.forEach((channel) => {
      points[channel] = [];
    });

    for (let i = 0; i < data.time.length; i += 1) {
      if (i > 0) {
        // const time = data.time[i] * 1000;
        const time = data.time[i] * 580;

        points['p1_740'].push([time, data.p1_740[i]]);
        points['p2_740'].push([time, data.p2_740[i]]);
        points['p3_740'].push([time, data.p3_740[i]]);
        points['p4_740'].push([time, data.p4_740[i]]);
        // points['p1_850'].push([time, data.p1_850[i]]);
        // points['p2_850'].push([time, data.p2_850[i]]);
        // points['p3_850'].push([time, data.p3_850[i]]);
        // points['p4_850'].push([time, data.p4_850[i]]);
      }
    }

    return points;
  };

  return (
    <MultiChannelChart
      data={getPoints()}
      style={style}
      baselineStyles={baselineStyles}
      channels={channels}
      channelNames={channelNames}
      displayChannels={[
        'p1_740',
        'p2_740',
        'p3_740',
        'p4_740'
        // 'p1_850',
        // 'p2_850',
        // 'p3_850',
        // 'p4_850'
      ]}
      rollupLevels={['1s', '2s', '3s']}
      baseChannel={'p1_740'}
    />
  );
};

export default DataChart;
