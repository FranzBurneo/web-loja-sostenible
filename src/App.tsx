import './App.css';
import Users from './components/Users';
import Home from './components/Home';
import ResponsiveAppBar from './components/ResponsiveAppBar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { Login } from './components/Login';
import { Login2 } from './components/LoginOld';
import ForumPostForm from './components/ForumpostForm';
import CreatePost from './components/CreatePost';
import SinglePost from './components/SinglePost';
import Eventos from './components/Eventos';
import Encuestas from './components/Forms';
import { SetStateAction, useEffect, useState } from 'react';
import CreateForm from './components/CreateForm';
import SingleForm from './components/SingleForm';
import AllPosts from './components/AllPosts';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Profile from './components/profile/Profile';
import EditPost from './components/EditPost';
import Footer from './components/shared/components/footer';
import { FormResponses } from './components/FormResponses';
import { Organizations } from './components/Organizations';
import OdsCrud from './components/OdsCrud';
import { Objetives } from './components/Objetives';
import LandingObjetives from './components/LandingObjetives';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00796B',
    },
    secondary: {
      main: blueGrey[500], // Color secundario relacionado con el desarrollo sostenible (gris azulado)
    },
  },
});

interface MyJwtPayload {
  rol: string[];
  profileImage: string;
  organization: string;
}

function App() {
  const DEFAULT_PROFILE_IMAGE: string = process.env.REACT_APP_DEFAULT_PROFILE_IMAGE || '';
  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode<MyJwtPayload>(token) : null; 
  if(decodedToken) localStorage.setItem('profileImage', decodedToken.profileImage);
  // Comprobación adicional para asegurarse de que decodedToken no sea null  
  const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage'));
  if (decodedToken && 'rol' in decodedToken) {
    console.log('rol:', decodedToken.rol);
  } else {
    console.log('null');
  }
  useEffect(() => {    
    if(token) verifyToken();
  }, [token]);
  // Función para validar si el token sigue vigente
  async function verifyToken() {
    try {
      const config = {
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json',
        }
      }
      await axios.get(process.env.REACT_APP_NODE_API + 'auth/verifyToken', config);
    } catch (error: any) {
      console.log('error', error);
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        // Acciones específicas para el error 403 (Prohibido)
        localStorage.clear();
      } 
    }
  }
  // Función para actualizar la imagen de perfil
  const handleProfileImageUpdate = (newProfileImage: SetStateAction<string | null>) => {
    setProfileImage(newProfileImage);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className='min-h-screen flex flex-col'>
        <Router>
          <ResponsiveAppBar profileImage = {profileImage ? profileImage : DEFAULT_PROFILE_IMAGE} />
            <div className='flex flex-col flex-grow overflow-y-auto' style={{backgroundColor: '#eaecf1'}}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login2" element={<Login2 />} />
                <Route path="/objetives" element={<Objetives />} />
                <Route path="/objetives/:keyWord" element={<LandingObjetives/>} />
                <Route path="/publicaciones" element={<AllPosts onlyOwnPosts={false} />} />
                <Route path="/eventos" element={<Eventos onlyOwnPosts={false} />} />
                <Route path="/encuestas" element={<Encuestas onlyOwnPosts={false} />} />
                <Route path="/post/:postId" element={<SinglePost />} />
                <Route path="/form/:formId" element={<SingleForm />} />
                <Route path="/FormResponses/:formId" element={<FormResponses />} />
                <Route path='/OdsAdmin' element={<OdsCrud />} />
                {
                  decodedToken && decodedToken.rol.includes("moderator") ? (
                    <>                      
                      <Route path="/forum3" element={<ForumPostForm />} />
                      <Route path="/createPost" element={<CreatePost />} />
                      <Route path="/createForm" element={<CreateForm />} />
                      <Route path="/editPost/:postId" element={<EditPost />} />
                      <Route path="/misPublicaciones" element={<AllPosts onlyOwnPosts={true} />} />
                    </>
                  ) : null
                }
                {
                  decodedToken && decodedToken.rol.includes("admin") ? (
                    <>                      
                      <Route path="/usuarios" element={<Users />} />
                    </>
                  ) : null
                }
                {token ? (
                  <>                  
                    <Route path='/perfil' element={<Profile onProfileImageUpdate={handleProfileImageUpdate} />} />
                  </>
                ) : null
                }
                {
                  decodedToken && decodedToken.rol.includes("admin") && decodedToken.organization === undefined ? (
                    <>
                      <Route path='/Organizations' element={<Organizations />} />
                    </>
                  )
                  : null
                }
              </Routes>
            </div>
            <Footer/>
        </Router>
      </div>
    </ThemeProvider>
  );
}


export default App;