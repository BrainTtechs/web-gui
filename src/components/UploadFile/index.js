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
  
  // const mock = require('./Chart/sensor-example.json');
  
  const dataFormat = {
    time: [],
    p1_740: [],
    p2_740: [],
    p3_740: [],
    p4_740: [],
    p1_850: [],
    p2_850: [],
    p3_850: [],
    p4_850: []
  };
  
  const UploadFile = () => {
    const [fileData, setFileData] = useState(null);
  
    const [data, setData] = useState(dataFormat);
  
    const uploadFile = (event) => {
      let file = event.target.files[0];
      if (file) {
        var reader = new FileReader();
        var jsonData = [];
        reader.onload = function (event) {
          jsonData = JSON.parse(event.target.result);
          setFileData(jsonData);
        };
        reader.readAsText(file);
      }
    };
  
    useEffect(() => {
      if (fileData !== null) {
        const a = fileData.reduce((values, data, idx) => {
          values.time.push(idx + 1);
          if (data.led == 740) {
            values.p1_740.push(data.adc1);
            values.p2_740.push(data.adc2);
            values.p3_740.push(data.adc3);
            values.p4_740.push(data.adc4);
          } else {
            values.p1_850.push(data.adc1);
            values.p2_850.push(data.adc2);
            values.p3_850.push(data.adc3);
            values.p4_850.push(data.adc4);
          }
          return values;
        }, dataFormat);
        a.time = Array.from(
          { length: a.p1_740.length },
          (_, index) => index + 1
        );
  
        // if (counter < limit) setCounter(counter + 1);
        console.log({ a });
        setData(a);
      }
    }, [fileData]);
  
    console.log('render');
  
    return (
      <div>
        <div>
          <input type="file" id="upload-button" onChange={uploadFile} />
        </div>
        {data?.time && data.time.length > 1 && (
          <DataChart data={data} disableTimerange={false} />
        )}
      </div>
    );
  };
  
  export default UploadFile;
  