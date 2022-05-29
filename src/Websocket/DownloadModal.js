import useWebSocket, { ReadyState } from 'react-use-websocket';
import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ReactStars from 'react-rating-stars-component';
import { Button } from '@mui/material';

function DownloadModal({
  rating,
  setRating,
  setNameOfFile,
  nameOfFile,
  open,
  handleClose,
  messageHistory,
  setMessageHistory
}) {
  const [socketUrl, setSocketUrl] = useState('ws://192.168.43.91:8080');

  const { sendMessage, lastMessage, readyState, getWebSocket } =
    useWebSocket(socketUrl);

  const onNameChange = (e) => setNameOfFile(e.target.value);

  const ratingChanged = (newRating) => {
    setRating(newRating);
  };

  const styleModal = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3
  };
  const save = () => {
    function download(content, fileName, contentType) {
      var a = document.createElement('a');
      var file = new Blob([content], { type: contentType });
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
    }

    const saved = localStorage.getItem('messageHistory');
    const newHistory = saved?.slice(0, -1).concat(']');
    console.log({ newHistory });
    const d = JSON.parse(newHistory);

    const savedPulse = localStorage.getItem('pulseHistory');
    const newHistoryPulse = savedPulse?.slice(0, -1).concat(']');
    console.log({ newHistoryPulse });
    const dPulse = JSON.parse(newHistoryPulse);

    download(
      JSON.stringify({
        data: d,
        pulse: dPulse,
        rating: rating
      }),
      nameOfFile + '.json',
      'text/plain'
    );
    handleClose();
  };
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={styleModal}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Do you want to download the history?
          </Typography>

          <Button
            style={{
              fontSize: '5px',
              margin: '0px',
              padding: '0px',
              height: '24px'
            }}
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </Button>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h4">
            Rate Commercials : {'  '}
          </Typography>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <ReactStars
            count={10}
            onChange={ratingChanged}
            size={28}
            activeColor="#ffd700"
            style={{ margin: '0px', padding: '0px' }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '1.5rem'
          }}
        >
          <TextField
            value={nameOfFile}
            onChange={onNameChange}
            size="small"
            id="outlined-basic"
            label="Name"
            variant="outlined"
          />
          <Button
            onClick={() => {
              save();
            }}
          >
            Download
          </Button>
        </div>
      </Box>
    </Modal>
  );
}

export default DownloadModal;
