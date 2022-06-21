import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import db from "../../utils/db";
import { ref, set, onValue, off } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import {
  SaveOutlined,
  ThumbDownAltOutlined,
  ThumbUpAltOutlined,
} from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Button, Stack } from "@mui/material";

import { toast } from "react-toastify";

function DownloadModal({
  setNameOfFile,
  nameOfFile,
  open,
  handleClose,
  onSaved,
  messageHistory,
  setMessageHistory,
}) {
  const onNameChange = (e) => setNameOfFile(e.target.value);
  const [uploading, setUploading] = useState(false);

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

  const guess = () => {
    /*const id = uuidv4();
    console.log({ id });
    const { fnirs, pulse } = getData();

    const mlPromise = () =>
      new Promise((resolve) => {
        const listener = onValue(ref(db, 'result'), (snapshot) => {
          if (snapshot.exists()) {
            const result = snapshot.val();
            if (result.id === id) {
              console.log(result.rating);
              resolve(result.rating);
            }
          }
        });
        setTimeout(() => off(ref(db, 'result'), listener), 20000);
      });

    set(ref(db, 'queue'), {
      id,
      data: fnirs,
      pulse
    })
      .then(() => {
        toast.promise(mlPromise, {
          pending: 'Machine Learning Algorithm is running...',
          success: {
            render({ data }) {
              if (data == 0) {
                return (
                  <Stack direction="row">
                    <div style={{ margin: 12 }}>
                      <ThumbDownAltOutlined />
                    </div>
                    <span>
                      Seems like this commercial <br />
                      <b>did not</b> have an impact on you.
                    </span>
                  </Stack>
                );
              }
              if (data == 1) {
                return (
                  <Stack direction="row">
                    <div style={{ margin: 12 }}>
                      <ThumbUpAltOutlined />
                    </div>
                    <span>
                      Wow, you are influenced by this commercial.
                    </span>
                  </Stack>
                );
              }
              return `Result: ${data}`;
            },
            icon: false,
            type: toast.info
            // icon: <CheckCircleOutlineIcon />
          },
          error: 'Error'
        });
      })
      .catch((error) => {
        toast.error(error);
        console.log(error);
      });*/
  };

  const upload = () => {
    // set(ref(db, '/'), {});
    // return;
    setUploading(true);

    const id = uuidv4();
    console.log({ id });
    const { fnirs, pulse } = getData();
    set(ref(db, "fooo/" + id), {
      data: fnirs,
      pulse: pulse,
    })
      .then(() => {
        setUploading(false);
        toast.success("Data saved succesfully!");
        console.log("Data saved succesfully!");
        // handleClose();
        onSaved();
      })
      .catch((error) => {
        toast.error(error);
        console.log(error);
      });
  };

  const getData = () => {
    const saved = localStorage.getItem("messageHistory");
    const newHistory =
      saved === "[" ? saved.concat("]") : saved?.slice(0, -1).concat("]");
    const fnirs = JSON.parse(newHistory);

    const savedPulse = localStorage.getItem("pulseHistory");
    const newHistoryPulse =
      savedPulse === "["
        ? savedPulse.concat("]")
        : savedPulse?.slice(0, -1).concat("]");
    const pulse = JSON.parse(newHistoryPulse);

    //TODO : video id will be saved to database

    return { fnirs, pulse };
  };

  /*const save = () => {
    function download(content, fileName, contentType) {
      var a = document.createElement("a");
      var file = new Blob([content], { type: contentType });
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
    }

    const { fnirs, pulse } = getData();

    download(
      JSON.stringify({
        data: fnirs,
        pulse: pulse,
      }),
      nameOfFile + ".json",
      "text/plain"
    );
    // handleClose();

    onSaved();
  };*/
  return (
    // <Modal
    //   open={open}
    //   onClose={handleClose}
    //   aria-labelledby="modal-modal-title"
    //   aria-describedby="modal-modal-description"
    // >
    //   <Box sx={styleModal}>
    //     <div
    //       style={{
    //         display: "flex",
    //         justifyContent: "end",
    //         alignItems: "center",
    //       }}
    //     >
    //       <Button
    //         style={{
    //           fontSize: "5px",
    //           margin: "0px",
    //           padding: "0px",
    //           height: "24px",
    //           justifyContent: "flex-end",
    //           minWidth: "min-content",
    //         }}
    //         onClick={handleClose}
    //       >
    //         <CloseIcon fontSize="small" />
    //       </Button>
    //     </div>
    //     <div
    //       style={{
    //         display: "flex",
    //         justifyContent: "center",
    //         alignItems: "center",
    //       }}
    //     >
    //       <TextField
    //         value={nameOfFile}
    //         onChange={onNameChange}
    //         size="small"
    //         id="outlined-basic"
    //         label="Name"
    //         variant="outlined"
    //         sx={{
    //           width: "100%",
    //           marginTop: "10px",
    //         }}
    //       />
    //     </div>
    //     <div
    //       style={{
    //         display: "flex",
    //         justifyContent: "center",
    //         marginTop: "1.5rem",
    //       }}
    //     >
    //       <Stack direction="row" spacing={1}>
    //         <Button
    //           variant="outlined"
    //           onClick={() => {
    //             save();
    //           }}
    //         >
    //           Download
    //         </Button>
    //         <LoadingButton
    //           onClick={upload}
    //           disabled={nameOfFile !== ""}
    //           loading={uploading}
    //           loadingPosition="start"
    //           startIcon={<SaveOutlined />}
    //           variant="outlined"
    //         >
    //           Save
    //         </LoadingButton>
    //         <LoadingButton
    //           onClick={guess}
    //           disabled={false}
    //           loading={false}
    //           loadingPosition="start"
    //           variant="outlined"
    //         >
    //           Predict
    //         </LoadingButton>
    //       </Stack>
    //     </div>
    //   </Box>
    // </Modal>
    <div>
      </div>
  );
}

export default DownloadModal;
