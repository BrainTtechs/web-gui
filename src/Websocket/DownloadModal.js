import useWebSocket, { ReadyState } from "react-use-websocket";
import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

function DownloadModal({ setNameOfFile, nameOfFile, open, handleClose}) {
  const [socketUrl, setSocketUrl] = useState("ws://192.168.43.243/ws");

  const { sendMessage, lastMessage, readyState, getWebSocket } =
    useWebSocket(socketUrl);
  const [messageHistory, setMessageHistory] = useState([]);

  const onNameChange = (e) => setNameOfFile(e.target.value);

  const styleModal = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
  };
  const save = () => {
    function download(content, fileName, contentType) {
      var a = document.createElement("a");
      var file = new Blob([content], { type: contentType });
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
    }
    download(
      JSON.stringify(messageHistory),
      nameOfFile + ".json",
      "text/plain"
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Do you want to download the history?
          </Typography>
          <button
            style={{
              fontSize: "5px",
              margin: "0px",
              padding: "0px",
              height: "24px",
            }}
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1.5rem",
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
          <button
            onClick={() => {
              save();
            }}
            disabled={readyState !== ReadyState.OPEN}
          >
            Download
          </button>
        </div>
      </Box>
    </Modal>
  );
}

export default DownloadModal;