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
import ReactStars from "react-rating-stars-component";
import PsychologyIcon from "@mui/icons-material/Psychology";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));
var initialTime = null;

export default function MainPage({}) {
  const [socketUrl, setSocketUrl] = React.useState("ws://192.168.43.243/ws");
  //const [socketUrl, setSocketUrl] = React.useState("ws://localhost:8080");

  const { sendMessage, lastMessage, readyState, getWebSocket } =
    useWebSocket(socketUrl);
  const [uploading, setUploading] = React.useState(false);
  const [playVideo, setPlayVideo] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [predictError, setPredictError] = React.useState(false);
  const [value, setValue] = React.useState("one");
  const upload = () => {
    // set(ref(db, '/'), {});
    // return;
    setUploading(true);

    const id = uuidv4();
    console.log({ id });
    const { fnirs, pulse } = getData(false);
    set(ref(db, "new-hardware/" + id), {
      data: fnirs,
      pulse: pulse,
      video_id: videos[value].id,
      rating: rating,
    }) /**pulse: pulse, */
      .then(() => {
        setUploading(false);
        Swal.fire({
          icon: "success",
          title: "Data Saved Successfully",
          confirmButtonColor: "green",
        });
        handleClose();
      })
      .catch((error) => {
        Swal.fire("Data Cannot Be Saved!", "fail");
        handleClose();
        console.log(error);
      });
  };
  const ratingChanged = (newRating) => {
    setRating(newRating);
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
    setPlayVideo(false);
    initialTime = null;
  };

  const handlefNirsClose = () => {
    setOpenModalfNIRS(false);
  };

  const handleCloseLoading = () => {
    setLoading(false);
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
    setStop(false);
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

  const guess = () => {
    const id = uuidv4();
    console.log({ id });
    setLoading(true);
    const { fnirs, pulse } = getData();
    const mlPromise = () =>
      new Promise((resolve) => {
        const listener = onValue(ref(db, "result"), (snapshot) => {
          if (snapshot.exists()) {
            const result = snapshot.val();
            if (result.id === id) {
              console.log(result.rating);
              resolve(result.rating);
              resolve(result.percentage);
            }
          }
        });
        setTimeout(() => off(ref(db, "result"), listener), 20000);
      });

    set(ref(db, "queue"), {
      id,
      data: fnirs,
      pulse,
    })
      .then(() => {
        console.log("dsadsa");
      })
      .catch((error) => {
        setPredictError(true);
        console.log(error);
      });
  };

  React.useEffect(() => {
    initMessageHistory();
    initPulseHistory();
  }, []);
  const onStart = () => {
    sendMessageToggle();
    setStop(false);
    setPlayVideo(true);
    //refresh local storage
    localStorage.clear();
  };

  const onEnded = () => {
    setStop(true);
    setPlayVideo(false);
    guess();
  };

  React.useEffect(() => {
    if (stop) {
      // getWebSocket().close();
      return;
    }
    if (lastMessage !== undefined && lastMessage !== null) {
      const d = parse(lastMessage.data);

      const saved = localStorage.getItem("messageHistory");
      const stringified = JSON.stringify(d).slice(1, -1) + ",";

      const newHistory = saved?.concat(stringified) || stringified;
      console.log(
        { d },
        { saved },
        { stringified },
        { newHistory },
        newHistory.length
      );
      localStorage.setItem("messageHistory", newHistory);
      // console.log(newHistory, "newhistory");
      // const limit = 100;
    }
  }, [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const parse = (data) => {
    data = JSON.parse(data);
    var obj = [];
    // map data array
    data.map((element) => {
      var foo = {};
      foo.p1_740 = element[0];
      foo.p2_740 = element[1];
      foo.p3_740 = element[2];
      foo.p4_740 = element[3];
      foo.p1_850 = element[4];
      foo.p2_850 = element[5];
      foo.p3_850 = element[6];
      foo.p4_850 = element[7];
      obj.push(foo);
    });
    return obj;
  };

  const x = lastMessage ? parse(lastMessage.data) : {};
  console.log(x, "x");
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
    //console.log({saved});
    //console.log({newHistory})

    const fnirs = JSON.parse(newHistory);
    //console.log(fnirs);
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
    if (isGraph) {
      while (pulse.length > 100) {
        pulse.splice(1, 1);
      }
    }
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
        {!playVideo && !stop && (
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
            <Box>
              <Typography variant="h5" noWrap>
                Place Your Finger To pulsemeter to start
              </Typography>
            </Box>
          </Box>
        )}
        {playVideo && (
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
            <Box>
              <Typography variant="h5" noWrap>
                Please be focused on video and try not to get distrupted
              </Typography>
            </Box>
          </Box>
        )}
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
                className="react-player "
                url={"videos/" + videos[value].id + ".mp4"}
                width="100%"
                height="100%"
                volume={videos[value].id === 2 ? 0.3 : 0.5}
                controls={true}
                onStart={onStart}
                onEnded={onEnded}
                playing={playVideo}
                ref={refer}
              />

              {open && (
                <Stack direction="column" spacing={1}>
                  <ReactStars
                    count={10}
                    onChange={ratingChanged}
                    size={28}
                    activeColor="#ffd700"
                    style={{
                      margin: "0px",
                      padding: "0px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  />
                  <LoadingButton
                    onClick={upload}
                    disabled={nameOfFile !== ""}
                    loading={uploading}
                    loadingPosition="start"
                    startIcon={<SaveOutlined />}
                    variant="outlined"
                    sx={{
                      width: "100%",
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
                  height: "110%",
                }}
              >
                <Grid item xs style={{ flexGrow: 1 }}>
                  <Item
                    style={{
                      height: "100%",
                    }}
                  >
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%",
                        width: "100%",
                      }}
                      color="inherit"
                      sx={{
                        textTransform: "none",
                      }}
                    >
                      <SignalWifi4BarIcon fontSize="large" />
                      <Box style={{ marginLeft: "10px" }}>
                        <Pulse
                          startAdc={() => {
                            sendMessageToggle();
                            setStop(false);
                            setPlayVideo(true);
                          }}
                          bpm={bpm}
                          setBpm={setBpm}
                          reset={pulseResetState}
                          getData={getData}
                          initialTime={initialTime}
                        />
                        <Typography
                          variant="h5"
                          style={{
                            textAlign: "start",
                            color:
                              readyState === ReadyState.OPEN
                                ? "green"
                                : readyState === ReadyState.CLOSED
                                ? "red"
                                : "inherit",
                          }}
                        >
                          &nbsp; fNIRS : &nbsp; {connectionStatus}
                        </Typography>
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
                        alignItems: "center",
                        height: "100%",
                        width: "100%",
                      }}
                      color="inherit"
                      sx={{
                        textTransform: "none",
                      }}
                    >
                      <MonitorHeartIcon fontSize="large" />

                      <Typography variant="h5">
                        &nbsp; Hearth Rate : &nbsp;
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
                      sx={{
                        padding: 0,
                      }}
                      onClick={handleOpenModalfNirs}
                    >
                      <PsychologyIcon fontSize="large" />
                      <Box style={{ display: "flex" }}>
                        <Typography
                          variant="h5"
                          style={{ textAlign: "start" }}
                          sx={{
                            textTransform: "none",
                          }}
                        >
                          &nbsp; fNIRS&nbsp;
                        </Typography>
                        <Typography
                          variant="h5"
                          style={{ textAlign: "start", marginLeft: "10px" }}
                        >
                          {x[x.length - 1]?.p1_740} {x[x.length - 1]?.p2_740}{" "}
                          {x[x.length - 1]?.p3_740} {x[x.length - 1]?.p4_740}{" "}
                          {x[x.length - 1]?.p1_850} {x[x.length - 1]?.p2_850}{" "}
                          {x[x.length - 1]?.p3_850} {x[x.length - 1]?.p4_850}
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
                        <ResponsiveContainer width="99%" height={500}>
                          <LineChart data={getData(true).fnirs}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="adc1"
                              stroke="#8884d8"
                              isAnimationActive={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="adc2"
                              stroke="#82ca9d"
                              isAnimationActive={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="adc3"
                              stroke="#856245"
                              isAnimationActive={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="adc4"
                              stroke="#000000"
                              isAnimationActive={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>{" "}
                    </Box>
                  </Modal>
                  <Modal
                    open={loading}
                    disableBackdropClick
                    onClose={handleCloseLoading}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "25%",
                        height: "45%",
                        bgcolor: "background.paper",
                        border: "2px solid #000",
                        boxShadow: 24,
                        pt: 2,
                        px: 4,
                        pb: 3,
                      }}
                    >
                      {loading && <LoadingSpinner />}
                      {!loading && <>dsadasdsa</>}
                      {predictError && <>Predict Error !</>}
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
