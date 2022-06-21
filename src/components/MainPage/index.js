import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import VideoCameraBackIcon from "@mui/icons-material/VideoCameraBack";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import SignalWifi4BarIcon from "@mui/icons-material/SignalWifi4Bar";
import ReactPlayer from "react-player";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Icon } from "@iconify/react";
import ChartX from "../Chart";
import { COMMANDS } from "./config";
import Button from "@mui/material/Button";
import { findDOMNode, render } from "react-dom";
import { toast } from "react-toastify";
import DownloadModal from "./DownloadModal";
import Pulse, { initPulseHistory } from "../Pulse";
import { ReadyState } from "react-use-websocket";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import { SaveOutlined } from "@mui/icons-material";
import useWebSocket from "react-use-websocket";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import LoadingButton from "@mui/lab/LoadingButton";
import { Stack } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

import db from "../../utils/db";
import { ref, set, onValue, off } from "firebase/database";
import Swal from "sweetalert2";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));
var initialTime = null;

export default function MainPage({}) {
  //const [socketUrl, setSocketUrl] = React.useState('ws://192.168.43.243/ws');
  const [socketUrl, setSocketUrl] = React.useState("ws://localhost:8080");

  const { sendMessage, lastMessage, readyState, getWebSocket } =
    useWebSocket(socketUrl);
  const [uploading, setUploading] = React.useState(false);

  const [value, setValue] = React.useState("one");
  const upload = () => {
    // set(ref(db, '/'), {});
    // return;
    setUploading(true);

    const id = uuidv4();
    console.log({ id });
    const { fnirs } = getData(false);
    set(ref(db, "fooo/" + id), {
      data: fnirs,
      rating: videos[value].id,
    }) /**pulse: pulse, */
      .then(() => {
        setUploading(false);
        Swal.fire({
          icon: 'success',
          title: 'Data Saved Successfully',
          confirmButtonColor: "green",   

        })
        handleClose();
      })
      .catch((error) => {
        Swal.fire("Data Cannot Be Saved!", "fail");
        handleClose();
        console.log(error);
      });
  };

  const getInitialData = () => ({
    time: [],
    p1_740: [],
    p2_740: [],
    p3_740: [],
    p4_740: [],
    p1_850: [],
    p2_850: [],
    p3_850: [],
    p4_850: [],
  });

  const [counter, setCounter] = React.useState(0);
  const [stop, setStop] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [nameOfFile, setNameOfFile] = React.useState("");
  const [pulseResetState, setPulseReset] = React.useState(0);
  const [data, setData] = React.useState(getInitialData());
  const [bpm, setBpm] = React.useState("--");
  const [openModalHR, setOpenModalHR] = React.useState(false);
  const [openModalfNIRS, setOpenModalfNIRS] = React.useState(false);

  const initMessageHistory = () => localStorage.setItem("messageHistory", "[");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setStop(true);
    setOpen(false);
    initMessageHistory();
    initPulseHistory();
    setData(getInitialData());
    setCounter(0);
    resetPulse();
    initialTime = null;
  };

  const handlefNirsClose = () => {
    setOpenModalfNIRS(false);
  };

  const handleHRClose = () => {
    setOpenModalHR(false);
  };

  const handleOpenModalfNirs = () => {
    setOpenModalfNIRS(true);
  };

  const handleOpenModalHR = () => {
    setOpenModalHR(true);
  };

  const resetPulse = () => {
    setPulseReset(pulseResetState + 1);
  };

  let player = null;
  const refer = (p) => {
    player = p;
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    handleClose();
  };
  const sendMessageToggle = () => {
    sendMessage(COMMANDS.START_ALTERNATING);
  };

  const videos = {
    one: {
      id: 1,
      title: "one",
    },
    two: {
      id: 2,
      title: "two",
    },
    three: {
      id: 3,
      title: "three",
    },
    four: {
      id: 4,
      title: "four",
    },
  };

  const onStart = () => {
    sendMessageToggle();
    setStop(false);
  };

  const onEnded = () => {
    setStop(true);
    handleOpen();
  };

  React.useEffect(() => {
    if (stop) {
      // getWebSocket().close();
      return;
    }
    if (lastMessage !== undefined && lastMessage !== null) {
      const d = JSON.parse(lastMessage.data);
      const time = new Date().getTime();
      const str = String(time); // 👉️ '6789'
      const num = ((str / 1000) * 10) / 3;
      const t = num.toFixed(1);
      const x = getData().fnirs[1];
      if (x) d.time = Number((t - initialTime).toFixed(1));
      else {
        if (initialTime === null) initialTime = t;
        d.time = 0;
      }
      const saved = localStorage.getItem("messageHistory");
      const stringified = JSON.stringify(d) + ",";
      const newHistory = saved?.concat(stringified) || stringified;
      localStorage.setItem("messageHistory", newHistory);
      console.log(newHistory, "newhistory");
      // const limit = 100;
      const limit = 50;
      const f = (a) => {
        return a.slice(-limit);
      };
      if (d.led === 740) {
        setData({
          ...data,
          time: [...data.time, counter],
          p1_740: [...f(data.p1_740), d.adc1],
          p2_740: [...f(data.p2_740), d.adc2],
          p3_740: [...f(data.p3_740), d.adc3],
          p4_740: [...f(data.p4_740), d.adc4],
        });
      } else {
        setData({
          ...data,
          time: [...data.time, counter],
          p1_850: [...f(data.p1_850), d.adc1],
          p2_850: [...f(data.p2_850), d.adc2],
          p3_850: [...f(data.p3_850), d.adc3],
          p4_850: [...f(data.p4_850), d.adc4],
        });
      }
      if (counter < limit) setCounter(counter + 1);
    }
  }, [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const x = lastMessage ? JSON.parse(lastMessage.data) : {};
  console.log(x);
  const keyPress = React.useCallback((e) => {
    console.log(e);
    if (e.key === "1") {
      sendMessage(COMMANDS.START_ALTERNATING);
    } else if (e.key === "2") {
      sendMessage(COMMANDS.START_740);
    } else if (e.key === "3") {
      sendMessage(COMMANDS.START_850);
    } else if (e.key === " ") {
      // spacebar
      setStop(true);
      handleOpen();
      setNameOfFile("");
    }
  }, []);
  const getData = (isGraph) => {
    var saved = localStorage.getItem("messageHistory");
    if (saved === null) {
      initMessageHistory();
      saved = localStorage.getItem("messageHistory");
    }
    const newHistory =
      saved === "[" ? saved.concat("]") : saved?.slice(0, -1).concat("]");
    const fnirs = JSON.parse(newHistory);
    if (isGraph) {
      while (fnirs.length > 100) {
        fnirs.splice(1, 1);
      }
    }
    var savedPulse = localStorage.getItem("pulseHistory");
    if (savedPulse === null) {
      initPulseHistory();
      savedPulse = localStorage.getItem("pulseHistory");
    }
    const newHistoryPulse =
      savedPulse === "["
        ? savedPulse.concat("]")
        : savedPulse?.slice(0, -1).concat("]");
    const pulse = JSON.parse(newHistoryPulse);

    return { fnirs, pulse };
  };

  React.useEffect(() => {
    document.addEventListener("keyup", keyPress);
    return () => document.removeEventListener("keyup", keyPress);
  }, [keyPress]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            border: 1,
            borderRadius: "36px",
            padding: "8px",
            width: "60%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" noWrap>
            Place Your Finger To pulsemeter to start
          </Typography>
        </Box>
      </Box>
      <Box sx={{ width: "100%" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="primary"
          TabIndicatorProps={{
            style: {
              display: "none",
            },
          }}
          aria-label="secondary tabs example"
          style={{ marginTop: "0.5rem" }}
        >
          <Tab
            value="one"
            label="Video 1"
            icon={<VideoCameraBackIcon />}
            iconPosition="start"
          />
          <Tab
            value="two"
            label="Video 2"
            icon={<VideoCameraBackIcon />}
            iconPosition="start"
          />
          <Tab
            value="three"
            label="Video 3"
            icon={<VideoCameraBackIcon />}
            iconPosition="start"
          />
          <Tab
            value="four"
            label="Video 4"
            icon={<VideoCameraBackIcon />}
            iconPosition="start"
          />
        </Tabs>
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={8}>
              <ReactPlayer
                className="react-player fixed-bottom"
                url={"videos/" + videos[value].id + ".mp4"}
                width="100%"
                height="80%"
                volume={videos[value].id === 2 ? 0.3 : 0.5}
                controls={true}
                onStart={onStart}
                onEnded={onEnded}
                ref={refer}
              />
              {open && (
                <Stack direction="row" spacing={1}>
                  <LoadingButton
                    onClick={upload}
                    disabled={nameOfFile !== ""}
                    loading={uploading}
                    loadingPosition="start"
                    startIcon={<SaveOutlined />}
                    variant="outlined"
                    sx={{
                      width: "100%",
                      marginTop: "10px",
                    }}
                  >
                    Save
                  </LoadingButton>
                </Stack>
              )}
            </Grid>
            <Grid item xs={4}>
              {
                //fill all grids in column to vertical grid
              }
              <Grid
                container
                direction="column"
                spacing={1}
                style={{
                  height: "80%",
                }}
              >
                <Grid item xs style={{ flexGrow: 1 }}>
                  <Item
                    style={{
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    {/**
                     * TODO : MarginTop will be fixed, that container will be centered
                     */}
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginTop: "16px",
                      }}
                    >
                      <Box style={{ alignSelf: "center", padding: "10px" }}>
                        <SignalWifi4BarIcon />
                      </Box>
                      <Box style={{ alignSelf: "center" }}>
                        <Pulse
                          startAdc={() => {
                            sendMessageToggle();
                            setStop(false);
                          }}
                          bpm={bpm}
                          setBpm={setBpm}
                          reset={pulseResetState}
                        />
                        <Typography
                          variant="body2"
                          style={{ textAlign: "start" }}
                        >
                          fNIRS :{connectionStatus}
                        </Typography>
                      </Box>
                      <Box
                        style={{
                          textAlign: "end",
                          marginLeft: "auto",
                          width: "160px",
                        }}
                      >
                        <Button
                          color="inherit"
                          style={{ margin: 5, maxWidth: "140px" }}
                          variant="outlined"
                          onClick={() => {
                            window.location.reload();
                          }}
                          disabled={readyState !== ReadyState.OPEN}
                        >
                          Refresh Page
                        </Button>
                      </Box>
                    </Box>
                  </Item>
                </Grid>
                <Grid item xs style={{ flexGrow: 1 }}>
                  <Item
                    style={{
                      height: "100%",
                    }}
                  >
                    <Box
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        height: "100%",
                        width: "100%",
                      }}
                      component={Button}
                      color="inherit"
                      sx={{
                        textTransform: "none",
                      }}
                      onClick={handleOpenModalHR}
                    >
                      <MonitorHeartIcon />
                      <Typography
                        variant="body2"
                        style={{ marginLeft: "10px" }}
                      >
                        Hearth Rate : &nbsp;
                        {bpm}
                        &nbsp;bpm
                      </Typography>
                    </Box>
                  </Item>
                </Grid>
                <Grid item xs style={{ flexGrow: 1 }}>
                  <Item
                    style={{
                      height: "100%",
                    }}
                  >
                    <Box
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        width: "100%",
                        height: "100%",
                      }}
                      component={Button}
                      color="inherit"
                      onClick={handleOpenModalfNirs}
                    >
                      <Box style={{ alignSelf: "center" }}>
                        <Icon icon="mdi:brain" width="24" height="24" />
                      </Box>
                      <Box style={{ display: "flex" }}>
                        <Typography
                          variant="body2"
                          style={{ textAlign: "start", marginLeft: "10px" }}
                          sx={{
                            textTransform: "none",
                          }}
                        >
                          fNIRS&nbsp;
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{ textAlign: "start", marginLeft: "10px" }}
                        >
                          {x.adc1} {x.adc2} {x.adc3} {x.adc4}
                        </Typography>
                      </Box>
                    </Box>
                    {/* <DownloadModal
                      setNameOfFile={setNameOfFile}
                      nameOfFile={nameOfFile}
                      // messageHistory={messageHistory}
                      // setMessageHistory={setMessageHistory}
                      open={open}
                      onSaved={() => {}}
                      handleClose={handleClose}
                    /> */}
                  </Item>

                  <Modal
                    open={openModalHR}
                    onClose={handleHRClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "75%",
                        height: "75%",
                        bgcolor: "background.paper",
                        border: "2px solid #000",
                        boxShadow: 24,
                        pt: 2,
                        px: 4,
                        pb: 3,
                      }}
                    >
                      {" "}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                        }}
                      >
                        <Button onClick={handleHRClose}>
                          <CloseIcon />
                        </Button>
                      </Box>
                      <Box>
                        <ChartX />
                      </Box>{" "}
                    </Box>
                  </Modal>
                  <Modal
                    open={openModalfNIRS}
                    onClose={handlefNirsClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "75%",
                        height: "75%",
                        bgcolor: "background.paper",
                        border: "2px solid #000",
                        boxShadow: 24,
                        pt: 2,
                        px: 4,
                        pb: 3,
                      }}
                    >
                      {" "}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                        }}
                      >
                        <Button onClick={handlefNirsClose}>
                          <CloseIcon />
                        </Button>
                      </Box>
                      <Box>
                        <ResponsiveContainer width="99%" height={400}>
                          <LineChart data={getData(true).fnirs}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={"time"} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="adc1"
                              stroke="#8884d8"
                            />
                            <Line
                              type="monotone"
                              dataKey="adc2"
                              stroke="#82ca9d"
                            />
                            <Line
                              type="monotone"
                              dataKey="adc3"
                              stroke="#856245"
                            />
                            <Line
                              type="monotone"
                              dataKey="adc4"
                              stroke="#000000"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>{" "}
                    </Box>
                  </Modal>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}
