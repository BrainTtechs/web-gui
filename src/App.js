import { ToastContainer } from 'react-toastify';
import './App.css';
import WebSocket from './components/Websocket';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <ToastContainer />
      <WebSocket />
    </div>
  );
}

export default App;
