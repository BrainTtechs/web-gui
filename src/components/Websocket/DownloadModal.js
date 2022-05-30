import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ReactStars from 'react-rating-stars-component';
import { Button } from '@mui/material';
import db from '../../utils/db';
import { ref, set } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { SaveOutlined } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'react-toastify';

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
  const onNameChange = (e) => setNameOfFile(e.target.value);
  const [uploading, setUploading] = useState(false);

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

  const upload = () => {
    setUploading(true);

    const id = uuidv4();
    const { fnirs, pulse, rating } = getData();
    set(ref(db, 'archive/' + id), {
      data: fnirs,
      pulse,
      rating
    })
      .then(() => {
        console.log('Data saved succesfully');
        setUploading(false);
        toast.success('Data saved succesfully!', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
      })
      .catch((error) => {
        toast.error('Data saved succesfully!', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
      });

    console.log('');
  };

  const getData = () => {
    const saved = localStorage.getItem('messageHistory');
    const newHistory =
      saved === '[' ? saved.concat(']') : saved?.slice(0, -1).concat(']');
    const fnirs = JSON.parse(newHistory);

    const savedPulse = localStorage.getItem('pulseHistory');
    const newHistoryPulse =
      savedPulse === '['
        ? savedPulse.concat(']')
        : savedPulse?.slice(0, -1).concat(']');
    const pulse = JSON.parse(newHistoryPulse);

    return { fnirs, pulse, rating };
  };

  const save = () => {
    function download(content, fileName, contentType) {
      var a = document.createElement('a');
      var file = new Blob([content], { type: contentType });
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
    }

    const { fnirs, pulse, rating } = getData();

    download(
      JSON.stringify({
        data: fnirs,
        pulse: pulse,
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
            justifyContent: 'end',
            alignItems: 'center'
          }}
        >
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
          {rating}
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
            variant="outlined"
            onClick={() => {
              save();
            }}
          >
            Download
          </Button>
          <LoadingButton
            onClick={upload}
            disabled={nameOfFile !== ''}
            loading={uploading}
            loadingPosition="start"
            startIcon={<SaveOutlined />}
            variant="outlined"
          >
            Save
          </LoadingButton>
        </div>
      </Box>
    </Modal>
  );
}

export default DownloadModal;
