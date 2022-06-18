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
import Chart from "./Chart";
import Button from "@mui/material/Button";
import { findDOMNode } from "react-dom";
import { toast } from "react-toastify";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function ColorTabs() {
  const [value, setValue] = React.useState("one");
  const [fullscreenMode, setFullscreenMode] = React.useState(false);
  const [randomVal1, setRandomVal1] = React.useState(0);
  const [randomVal2, setRandomVal2] = React.useState(0);

  let player = null;
  const ref = (p) => {
    player = p;
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
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

  const createRandom = () => {
    setRandomVal1(Math.floor(Math.random() * (508 - 300 + 1) + 400));
    setRandomVal2(Math.floor(Math.random() * (450 - 240 + 1) + 340));
  };

  React.useEffect(() => {
    setInterval(createRandom, 1000);
  }, []);

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
  };
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
            padding: "20px",
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
            <Grid item xs={7}>
              <ReactPlayer
                className="react-player fixed-bottom"
                url={"videos/" + videos[value].id + ".mp4"}
                width="100%"
                height="100%"
                controls={true}
                onStart={onStart}
                onEnded={onEnded}
                ref={ref}
              />
            </Grid>
            <Grid item xs={5}>
              {
                //fill all grids in column to vertical grid
              }
              <Grid
                container
                direction="column"
                spacing={1}
                style={{
                  height: "100%",
                }}
              >
                <Grid item xs style={{ flexGrow: 1 }}>
                  <Item
                    style={{
                      height: "100%",
                      display: "flex",
                      width: "100%",
                    }}
                  >
                    <Box style={{ display: "flex", alignItems: "flex-start" }}>
                      <Box style={{ alignSelf: "center" }}>
                        <SignalWifi4BarIcon />
                      </Box>
                      <Box style={{ alignSelf: "center" }}>
                        <Typography
                          variant="body2"
                          style={{ textAlign: "start", marginLeft: "10px" }}
                        >
                          Pulsemeter : &nbsp; (connection info)
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{ textAlign: "start", marginLeft: "10px" }}
                        >
                          fNIRS : &nbsp; (connection info)
                        </Typography>
                      </Box>
                      <Box style={{ alignSelf: "center" }}>
                        <IconButton
                          color="inherit"
                          aria-label="add to shopping cart"
                          style={{
                            display: "block",
                            marginLeft: "auto",
                            marginRight: "auto",
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
                    >
                      <MonitorHeartIcon />
                      <Typography
                        variant="body2"
                        style={{ marginLeft: "10px" }}
                      >
                        Hearth Rate : &nbsp; ... bpm
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
                          {randomVal1}-{randomVal2}
                        </Typography>
                      </Box>
                    </Box>
                    {/* <Box>
                    <Chart height={180} />
                  </Box> */}
                  </Item>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}
