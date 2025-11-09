import 'bootstrap/dist/css/bootstrap.min.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import Chat from './Components/Chat';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import RegistrationForm from './Components/Register';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Home from './Components/Home';
import Login from './Components/Login';
import PrivateRoute from './PrivateRoutes';


function App() {
  const loggedIn = JSON.parse(localStorage.getItem('loggedIn'));
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/register' element={<RegistrationForm />} />
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<PrivateRoute isLoggedIn={loggedIn} />}> 
          <Route path="/chatting/:groupid/" element={<Chat />} />
          <Route path='/' element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
