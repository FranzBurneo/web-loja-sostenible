import React, { useEffect, useState } from 'react';
import {
  ThemeProvider,
  Container,
  Typography,
  useTheme,
  Button,
  Box,
  IconButton,
  Avatar,
  Grid
} from '@mui/material';
import axios from 'axios';
import { Searcher } from "./shared/components/searcher";
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const Forms = ({ onlyOwnPosts }) => {
  const theme = useTheme();
  const [iterator, setIterator] = useState(1); // Estado del iterador
  const [searchResult, setSearchResult] = useState(null); // Estado para almacenar el resultado de la búsqueda
  const [disabledLoadMoreButton, setDisabledLoadMoreButton] = useState(false);
  const [formCards, setFormCards] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : null;
  let userId;
  if (onlyOwnPosts) {
    userId = token ? decodedToken.id : null;
  }

  useEffect(() => {
    loadFormCards(1);
  }, []);

  // Función para manejar el clic en el botón
  const handleButtonClick = () => {
    // Redirigir al usuario a otra ruta
    navigate( "/createForm");
  };

  const loadFormCards = async (currentIterator) => {
    try {
      const response = await axios.get(process.env.REACT_APP_NODE_API + 'forms', {
        params: {
          iterator: currentIterator,
          onlyOwnPosts: onlyOwnPosts,
          userId: userId
        }
      });
      const data = response.data;
      const forms = data.forms;
      buildFormCards(forms, false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const buildFormCards = (formList, reset) => {
    const genFormCards = formList.map((form) => (
      <div key={form.id} className="bg-white shadow-lg rounded-lg p-4 m-2 flex flex-col h-full border-l-4 border-l-amber-500">
        {/* ODS Seleccionado */}
        <div className='w-24 mb-3'>
          {form.selectedOds.number ? (
            <div style={{
              backgroundColor: "#" + form.selectedOds.color,
              display: 'flex',  // Agregar display flex
              justifyContent: 'center', // Centrar horizontalmente
              alignItems: 'center', // Centrar verticalmente
              height: '40px', // Altura del contenedor para centrar verticalmente
            }}
              className='labelPostCard text-center'>
              {'ODS ' + form.selectedOds.number}
            </div>
          ) : null
          }
        </div>

        <div className='flex flex-col grow'>
          <Typography sx={{ fontSize: 18, fontWeight: 'bold', minHeight: '55px', marginBottom: '15px' }} color="#30384e">
            {form.title}
          </Typography>
          <div className='flex-grow'>
            <Typography variant="body2" className="break-words">
              {form.description}
            </Typography>
          </div>
          {/* Usuario que publica */}
          <div className="userInfo mt-2 flex items-center">
            <IconButton sx={{ p: 0 }}>
              <Avatar alt="profileImage" src={form.userPost.avatarImage || process.env.REACT_APP_DEFAULT_PROFILE_IMAGE} />
            </IconButton>
            <div style={{ marginLeft: '10px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" component="div" gutterBottom style={{ marginBottom: '0px' }}>
                {form.userPost.firstname ? `${form.userPost.firstname} ${form.userPost.lastname}` : "Usuario invitado"}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {new Date(form.timestamp._seconds * 1000 + form.timestamp._nanoseconds / 1e6).toLocaleString()}
              </Typography>
            </div>
          </div>
        </div>
        <Box sx={{ mt: 2 }}>
          <a href={`/form/${form.id}`} rel="noopener noreferrer">
            <Button variant="contained" fullWidth>
              Responder
            </Button>
          </a>
        </Box>
      </div>
    ));

    if (reset) {
      setFormCards(genFormCards);
    } else {
      setFormCards(prevFormCards => {
        const uniqueFormCards = prevFormCards.filter(existingFormCard => {
          return !genFormCards.some(newFormCard => newFormCard.key === existingFormCard.key);
        });
        return uniqueFormCards.concat(genFormCards);
      });
    }
  }

  const handleLoadMore = () => {
    const updatedIterator = iterator + 1;
    setIterator(updatedIterator);
    loadFormCards(updatedIterator, false);
  }

  const handleSearchResult = (data) => {
    setSearchResult(data);
    buildFormCards(data.posts, true);
  };

  return (
    <div>
      <div className='grid place-content-center mt-5'>
        <Searcher onSearchResult={handleSearchResult} type={2} />
      </div>
      <ThemeProvider theme={theme}>
        <Container sx={{ marginTop: '16px' }}>
          <Grid container spacing={2}>
            {formCards.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.key}>
                {item}
              </Grid>
            ))}
          </Grid>
          {
            decodedToken && decodedToken.rol.includes("moderator") ? (
              <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 70, right: 16 }}
                onClick={handleButtonClick}
              >
                <AddIcon />
              </Fab>
            ) : null
          }
          <div className='mt-5 mb-5' style={{ width: '100%', textAlign: "center" }}>
            <Button variant="contained" onClick={handleLoadMore} disabled={disabledLoadMoreButton}>Cargar más</Button>
          </div>
        </Container>
      </ThemeProvider>
    </div>
  );
};

export default Forms;
