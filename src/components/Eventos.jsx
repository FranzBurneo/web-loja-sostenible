import { useEffect, useState } from 'react';
import {
  ThemeProvider,
  Typography,
  useTheme,
  Card,
  Button,
  CardContent,
  CardActions,
  IconButton,
  Avatar,
} from '@mui/material';
import axios from 'axios';
import './css/Publications.css';
import { Searcher } from "./shared/components/searcher";
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';

// Función para recortar el contenido HTML y mostrar solo los primeros 50 caracteres
const truncateContent = (html) => {
  const maxLength = window.innerWidth >= 768 ? 500 : 100;
  // Crea un elemento div para parsear el contenido HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Obtén el texto sin formato del contenido
  const textContent = tempDiv.textContent || "";

  // Recorta el contenido a la longitud máxima deseada
  const truncatedText = textContent.slice(0, maxLength);

  // Devuelve el contenido truncado con formato HTML
  return `${truncatedText}${textContent.length > maxLength ? "..." : ""}`;
};


const Eventos = ({ onlyOwnPosts }) => {
  const theme = useTheme();
  const [iterator, setIterator] = useState(1); // Estado del iterador
  const [searchResult, setSearchResult] = useState(null); // Estado para almacenar el resultado de la búsqueda
  const [disabledLoadMoreButton, setDisabledLoadMoreButton] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : null;
  let userId;
  let config;
  if(onlyOwnPosts){
    userId = token ? decodedToken.id : null;
  }

  useEffect(() => {
    fetchData();
  }, [onlyOwnPosts]);

  const fetchData = async () => {
    loadPostCards(1);
  };
  // Función para manejar el clic en el botón
  const handleButtonClick = () => {
    // Redirigir al usuario a otra ruta
    navigate( "/createPost");
  };

  const buildPostCards = (postList, reset) =>{    
    console.log('postList:', postList)
    // Ahora puedes representar las publicaciones como tarjetas
    const genPostCards = postList.map((post) => (
      <Card key={post.id} variant="outlined" sx={{marginBottom: '10px'}}>
        <CardContent>
          {/* Imagen */}
            {
              post.imageUrl ? 
                <div style={{textAlign: 'center', marginBottom: '20px', width: '100%'}}> 
                  <img src={post.imageUrl} alt='test' style={{maxHeight: '12.5rem', display: "inline",  objectFit: 'cover'}} />
                </div>                  
              :
                null
            }
            {/* Title */}
          <Typography className='font-Outfit' sx={{ fontSize: 18,   }} color="#000" gutterBottom>
            {post.title}
          </Typography>

            {/* Texto contenido */}
          <div className='mb-3 text-[#30384e]' style={{color: ""}} dangerouslySetInnerHTML={{ __html: truncateContent(post.content) }} />
          <a href={`/post/${post.id}`} rel="noopener noreferrer">
            <Button
              size="small"
            >
              VER MÁS
            </Button>
          </a>

          <CardActions style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* usuario que publica */}
          <div className="userInfo mb-5" src="#" >
            <IconButton sx={{ p: 0 }}>
              <Avatar alt="profileImage" src={post.userPost.avatarImage || process.env.REACT_APP_DEFAULT_PROFILE_IMAGE} />
            </IconButton>
          
            <div style={{ marginLeft: '10px', display: 'flex', flexDirection: 'column'}}>
            
              <Typography className='userName' variant="subtitle1" component="div" gutterBottom style={{ marginBottom: '0px'}}>
                {post.userPost.firstname ? post.userPost.firstname + ' ' + post.userPost.lastname : "Usuario invitado" }
              </Typography>
            
              <Typography variant="caption" color="textSecondary">
                {new Date(post.timestamp._seconds * 1000 + post.timestamp._nanoseconds / 1e6).toLocaleString()}
              </Typography>
            </div>
          </div>
          { post.selectedOds ?
              <div style={{ 
                  backgroundColor: "#" + post.selectedOds.color,
                }}
                className='labelPostCard text-xs sm:text-lg'>
                {'ODS ' + post.selectedOds.number}
              </div>
            :
            null
          }
        </CardActions>
        </CardContent>

        
      </Card>
    ));
    if(reset){
      console.log('reset');
      setPostCards(genPostCards);
    }else{
      console.log('not reset');
      console.log('genPostCards:', genPostCards)
      // Establecer el estado con las tarjetas de publicación
      setPostCards(prevPostCards => {
        // Filtrar las tarjetas de publicación existentes para eliminar duplicados
        const uniquePostCards = prevPostCards.filter(existingPostCard => {
          // Verificar si la nueva tarjeta de publicación ya está presente en las existentes
          return !genPostCards.some(newPostCard => newPostCard.key === existingPostCard.key);
        });
        // Concatenar las tarjetas de publicación únicas con las nuevas
        return uniquePostCards.concat(genPostCards);
      });
    }
  }

  const loadPostCards = async (currentIterator) => {
    try {  
      // Consultar al servidor las publicaciones
      const ruta = onlyOwnPosts ? `${process.env.REACT_APP_NODE_API}posts/ownPosts` : `${process.env.REACT_APP_NODE_API}posts`;
      console.log('config: ', config);
      const response = await axios.get(ruta, {
        params: {
          iterator: currentIterator,
          onlyOwnPosts: onlyOwnPosts,
          userId: userId,
          type: 2
        },
        headers: { // Aquí es donde debes colocar el token en la solicitud axios
          'x-access-token': token // Configura el token en el encabezado de la solicitud
        }
      });
      
      const data = response.data; 
      const posts = data.posts;
      if (posts.length > 0) {        
        setDisabledLoadMoreButton(false);
        // Construir las cartas con las publicaciones
        buildPostCards(posts, false);
      } else {
        setDisabledLoadMoreButton(true);    
        Swal.fire({
          title: "No se encontró ninguna publicación",
          confirmButtonColor: "#00796B",
        });
      }      
    } catch (error) {
      console.error('Error:', error);
      // Verificar si el error contiene un mensaje del servidor
      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = error.response.data.message;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: "#00796B",
        });
      } else {
        // Si no se puede obtener un mensaje de error del servidor, mostrar un mensaje genérico
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Se produjo un error al cargar las publicaciones. Por favor, inténtalo de nuevo más tarde.',
          confirmButtonColor: "#00796B",
        });
      }
    }
  };
  

  const handleLoadMore = () => {
    // Incrementar el iterador
    const updatedIterator = iterator + 1;
    setIterator(updatedIterator); // Actualizar el estado
    loadPostCards(updatedIterator, false); // Pasar el iterador actualizado a loadPostCards
  }
  // Función para recibir la data encontrada en handleSearch
    const handleSearchResult = (data) => {
      setSearchResult(data);
      console.log('data to main:', data);
      buildPostCards(data.posts, true);
  };

  const [postCards, setPostCards] = useState([]);

  return (
    <div>
      <div className='grid place-content-center mt-5'>
        {/* Renderiza el componente Searcher y pasa handleSearchResult como prop */}
        <Searcher onSearchResult={handleSearchResult}  type={1} />
      </div>
      <ThemeProvider theme={theme}>
          <div className='grid gap-4 grid-cols-3 p-5'>
          {postCards.map((item, index) => (
                  <div key={index}>
                    {item}
                  </div>
              ))}
          </div>
                  
      </ThemeProvider>
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
      <div style={{width: '100%', textAlign: "center"}}>
              <Button variant="contained" onClick={handleLoadMore} disabled={disabledLoadMoreButton}>Cargar más</Button>
            </div>
    </div>
  );
};

export default Eventos;
