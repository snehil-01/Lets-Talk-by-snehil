

import { Route } from 'react-router-dom';
import './App.css';
import Chatpage from './pages/Chatpage';
import Homepage from './pages/Homepage';

function App() {
  return (
    <div className="App">
     <Route path='/' component={Homepage} exact/>
     <Route path='/chats' component={Chatpage} />
    </div>
  );
}

export default App;
