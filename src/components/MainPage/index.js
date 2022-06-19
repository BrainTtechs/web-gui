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

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function ColorTabs({
  sendMessage,
  socketUrl,
  lastMessage,
  readyState,
  getWebSocket,
}) {
  const [value, setValue] = React.useState("one");
  const [fullscreenMode, setFullscreenMode] = React.useState(false);

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
  const ref = (p) => {
    player = p;
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const sendMessageToggle = () => {
    if (value === 0) sendMessage(COMMANDS.START_ALTERNATING);
    else if (value === 1) sendMessage(COMMANDS.START_740);
    else if (value === 2) sendMessage(COMMANDS.START_850);
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
    if (!fullscreenMode) {
      findDOMNode(player)
        .requestFullscreen()
        .catch((err) => {
          toast.error("Could not activate full-screen mode :(");
        });
      setFullscreenMode(true);
    }
  };

  const onEnded = () => {
    if (fullscreenMode) {
      document.exitFullscreen().catch((err) => {
        toast.error("Could not exit full-screen mode :(");
      });
      setFullscreenMode(false);
    }
    setOpen(true);
  };

  React.useEffect(() => {
    if (stop) {
      // getWebSocket().close();
      return;
    }
    console.log(lastMessage);
    if (lastMessage !== undefined && lastMessage !== null) {
      const d = JSON.parse(lastMessage.data);
      const saved = localStorage.getItem("messageHistory");
      const stringified = JSON.stringify(d) + ",";
      const newHistory = saved?.concat(stringified) || stringified;
      localStorage.setItem("messageHistory", newHistory);
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
                ref={ref}
              />
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
                          fNIRS : &nbsp;
                          {connectionStatus}
                        </Typography>
                      </Box>
                      <Box style={{ alignSelf: "center", marginLeft: "auto" }}>
                        <IconButton
                          color="inherit"
                          aria-label="add to shopping cart"
                          style={{
                            display: "block",
                          }}
                        >
                          <RefreshIcon />
                        </IconButton>
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
                    <DownloadModal
                      setNameOfFile={setNameOfFile}
                      nameOfFile={nameOfFile}
                      // messageHistory={messageHistory}
                      // setMessageHistory={setMessageHistory}
                      open={open}
                      onSaved={() => {}}
                      handleClose={handleClose}
                    />
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
                        <ChartX />
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
