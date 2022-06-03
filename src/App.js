import { ToastContainer } from 'react-toastify';
import './App.css';
import WebSocket from './components/Websocket';
import 'react-toastify/dist/ReactToastify.css';
import UploadFile from './components/UploadFile';

function App() {
  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <WebSocket />
      {/* <UploadFile /> */}
    </div>
  );
}

export default App;
