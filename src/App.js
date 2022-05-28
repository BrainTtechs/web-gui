import './App.css';
import Realtime from './Realtime';
import UploadData from './UploadData';
// import WebSocket from './Realtime/Websocket';
import WebSocket from './Websocket';

function App() {
  return (
    <div className="App">
      {/* <WebSocket /> */}
      {/* <UploadData /> */}
      <Realtime />
    </div>
  );
}

export default App;
