import { useEffect, useState } from "react";
import { Container, Typography, useTheme, IconButton, Avatar, Button, Snackbar, Menu, MenuItem, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from "axios";
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import Comments from "./Comments";
import ShareIcon from '@mui/icons-material/Share';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './css/PostContent.css';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DescriptionIcon from '@mui/icons-material/Description';

const SinglePost = () => {
  const theme = useTheme();
  const { postId } = useParams();
  const [postValues, setPostValues] = useState({
    title: '',
    content: '',
    imageUrl: '',
    timestamp: dayjs(),
    type: 'post',
    place: '',
    DateTimeEvent: dayjs(),
    organization: '',
    userPost: {},
    comments: [],
    interactionType: 1,
    attachments: [], // Inicializar attachmentUrls como un arreglo vacío
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : null;
  const userId = token ? decodedToken.id : null;
  const userOrganization = token ? decodedToken.organization : null;
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [visibilityConfirmationOpen, setVisibilityConfirmationOpen] = useState(false);
  const [fechaEvento, setFechaEvento] = useState(null);
  const [horaEvento, setHoraEvento] = useState(null);
  const [asistenciaRegistrada, setAsistenciaRegistrada] = useState(false);

  const config = {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json',
    }
  }
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await axios.get(
        process.env.REACT_APP_NODE_API + 'posts/' + postId, {
          params: {
            userId: userId
          }
        }
      );
      const data = response.data.post;
      console.log('postData: ', data);
      setPostValues({
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        timestamp: data.timestamp,
        type: data.type,
        place: data.place,
        organization: data.organization,
        DateTimeEvent: data.DateTimeEvent,
        userPost: data.userPost,
        comments: data.comments,
        visibility: data.visibility !== undefined ? data.visibility : true,
        interactionType: data.interactionType,
        countParticipants: data.countParticipants,
        attachments: data.attachments || [], // Asegurarse de que siempre sea un arreglo
      });
      const fecha = new Date(data.DateTimeEvent);
      const fechaEvento = fecha.toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      const horaEvento = fecha.toLocaleString('es-ES', { hour: 'numeric', minute: 'numeric' });
      setFechaEvento(fechaEvento);
      setHoraEvento(horaEvento);
      setAsistenciaRegistrada(data.userParticipation);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleRegistrarAsistencia = async () => {
    try {
      if (!token) {
        Swal.fire({
          title: `Necesitas iniciar sesión para registrar tu asistencia al evento`,
          confirmButtonText: "Ok",
          confirmButtonColor: "#D32F2F"
        })
      } else {
        if (asistenciaRegistrada) {
          Swal.fire({
            title: "¿Está seguro de eliminar su participación en el evento?",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            confirmButtonColor: "#D32F2F",
            cancelButtonColor: "#424242"
          }).then((result) => {
            if (result.isConfirmed) {
              const url = `${process.env.REACT_APP_NODE_API}participation/${postId}`;
              axios.delete(url, {
                ...config,
                params: {
                  userId: userId
                }
              });
              setAsistenciaRegistrada(!asistenciaRegistrada);
              setPostValues({ ...postValues, countParticipants: postValues.countParticipants - 1 });
            }
          });
        } else {
          const url = process.env.REACT_APP_NODE_API + 'participation';
          axios.post(url, {
            postId: postId
          },
            config);
          setAsistenciaRegistrada(!asistenciaRegistrada);
          setPostValues({ ...postValues, countParticipants: postValues.countParticipants + 1 });
        }
      }
    } catch (error) {
      Swal.fire({
        title: `Error al ${asistenciaRegistrada ? "eliminar" : "registrar"} su participación en el evento`,
        icon: 'error',
        confirmButtonText: "Ok",
        confirmButtonColor: "#D32F2F"
      })
    }
  };

  const handleCopyImageUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const renderHTML = (htmlString) => {
    return { __html: htmlString };
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
    setEditingPostId(postId);  // Asegurémonos de actualizar correctamente el ID del comentario en edición
  };

  const handleEdit = () => {
    if (postId) {
      navigate(`/editPost/${postId}`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setMenuAnchor(null);
    setDeleteConfirmationOpen(true);
  };

  const handleVisibility = () => {
    setMenuAnchor(null);
    setVisibilityConfirmationOpen(true);
  }

  const handleDeleteConfirmation = async () => {
    try {
      const url = process.env.REACT_APP_NODE_API + 'posts/' + postId;
      await axios.delete(url, config);
      alert('Publicación eliminada correctamente');
      navigate(`/publicaciones`);
    } catch (error) {
      alert('Ocurrió un error al eliminar el post');
      console.log('error: ', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(false);
  };


  const handleVisibilityCancel = () => {
    setVisibilityConfirmationOpen(false);
  };

  const handleVisibilityConfirmation = async () => {
    const response = await axios.put(
      `${process.env.REACT_APP_NODE_API}posts/${postId}`, // Usar el endpoint de actualización en lugar de creación
      {
        visibility: !postValues.visibility
      },
      config
    );
    if (response.status === 200) {
      console.log('response: ', response);
      // Cierra la confirmación
      setVisibilityConfirmationOpen(false);
      // Actualiza la visibilidad
      setPostValues({ ...postValues, visibility: !postValues.visibility });
      // Muestra el mensaje de éxito
      Swal.fire({
        title: 'Actualizado',
        text: response.data.message || 'Publicación actualizada correctamente',
        icon: 'success',
        confirmButtonColor: "#00796B",
        confirmButtonText: 'Ok'
      });
    } else {
      // Cierra la confirmación
      setVisibilityConfirmationOpen(false);
      // Muestra el mensaje de error
      Swal.fire({
        title: 'Error',
        text: 'La solicitud no se completó con éxito',
        icon: 'error',
        confirmButtonColor: "#00796B",
        confirmButtonText: 'Ok'
      });
    }
  }

  return (
    <>
      {/* <ThemeProvider theme={theme}> */}
      <div style={{ width: '95%' }} className="single-post flex m-auto">
        <Container sx={{
          backgroundColor: "#ffffff",
          height: "100%",
          opacity: 1,
          background: "rgb(255, 255, 255)",
          color: "rgb(52, 71, 103)",
          borderRadius: '0.5rem',
          boxShadow: '0 8px 24px hsla(210,8%,62%,.2)',
          padding: "2em",
          marginBottom: "0.5em",
          marginTop: '0.5rem',
          width: "80%"
        }}>
          <div style={{ display: "flex" }}>
            <div className="userInfo" src="#">
              <IconButton sx={{ p: 0 }}>
                {postValues.userPost && postValues.userPost.avatarImage ? (
                  <Avatar alt="profileImage" src={postValues.userPost.avatarImage} />
                ) : (
                  <Avatar alt="profileImage" src={process.env.REACT_APP_DEFAULT_PROFILE_IMAGE} />
                )}
              </IconButton>
              <div style={{ marginLeft: '10px', display: 'flex', flexDirection: 'column' }}>
                <Typography className='userName' variant="subtitle1" component="div" gutterBottom style={{ marginBottom: '0px' }}>
                  {postValues.userPost.firstname ? postValues.userPost.firstname + ' ' + postValues.userPost.lastname : "Usuario invitado"}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(postValues.timestamp._seconds * 1000 + postValues.timestamp._nanoseconds / 1e6).toLocaleString()}
                  {
                    postValues.visibility ?
                      <Tooltip title="Esta publicación es visible para cualquier persona">
                        <IconButton sx={{ marginLeft: "1rem", padding: "0" }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      :
                      <Tooltip title="Esta publicación se encuentra oculta">
                        <IconButton sx={{ marginLeft: "1rem", padding: "0" }}>
                          <VisibilityOffIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                  }
                </Typography>
              </div>
            </div>

            {/* Contenedor para opciones */}
            {
              userId === postValues.userPost.userId || userOrganization === postValues.organization ? (
                <div style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}>
                  <IconButton onClick={(event) => handleMenuOpen(event)}>
                    <MoreVertIcon sx={{ cursor: 'pointer' }} />
                  </IconButton>
                  <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                    <MenuItem onClick={() => handleEdit()}>
                      <ListItemIcon>
                        <EditIcon fontSize="small" />
                      </ListItemIcon>
                      Editar
                    </MenuItem>
                    <MenuItem onClick={() => handleVisibility()}>
                      <ListItemIcon>
                        {
                          postValues.visibility ?
                            <VisibilityOffIcon fontSize="small" />
                            :
                            <VisibilityIcon fontSize="small" />
                        }
                      </ListItemIcon>
                      {
                        postValues.visibility ?
                          "Ocultar publicación"
                          :
                          "Mostrar publicación"
                      }

                    </MenuItem>
                    <MenuItem onClick={() => handleDelete()}>
                      <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                      </ListItemIcon>
                      Eliminar
                    </MenuItem>
                  </Menu>
                </div>
              )
                :
                null
            }
          </div>
          <div className="flex text-center">
            <div className="font-bold w-[95%]">
              <h2 className="mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 md:text-1xl lg:text-2xl dark:text-white">
                {postValues.title}
              </h2>
            </div>
            <div className="flex items-center justify-center">
              <ShareIcon onClick={handleCopyImageUrl} sx={{ marginLeft: "auto", marginRight: "5%", cursor: "pointer", color: "#00796B" }} />
            </div>
          </div>
          {
            postValues.imageUrl ?
              <div style={{ textAlign: 'center', marginBottom: '1em', marginTop: '1rem' }}>
                <img src={postValues.imageUrl} alt='test' className="mainImage" />
              </div>
              :
              null
          }
          {
            postValues.type === 2 ? (
              <>
                <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                  {/* Detalles del evento */}
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center mb-4">
                        <EventIcon className="text-gray-800 mr-2" />
                        <span className="text-gray-700 font-medium">Fecha:</span>
                        <span className="ml-2 text-gray-800">{fechaEvento}</span>
                      </div>
                      <div className="flex items-center mb-4">
                        <AccessTimeIcon className="text-gray-800 mr-2" />
                        <span className="text-gray-700 font-medium">Hora:</span>
                        <span className="ml-2 text-gray-800">{horaEvento}</span>
                      </div>
                      <div className="flex items-center">
                        <LocationOnIcon className="text-gray-800 mr-2" />
                        <span className="text-gray-700 font-medium">Lugar:</span>
                        <span className="ml-2 text-gray-800">{postValues.place}</span>
                      </div>
                    </div>
                    {/* Sección de registro de asistencia */}
                    <div className="flex items-center">
                      <span className="text-gray-700 font-medium mr-2">Participantes:</span>
                      <span className="text-gray-800">{postValues.countParticipants}</span>
                      <Tooltip title={asistenciaRegistrada ? "Eliminar participación" : "Registrar participación"}>
                        <AddCircleIcon
                          onClick={handleRegistrarAsistencia}
                          sx={{ cursor: "pointer", color: asistenciaRegistrada ? '#CCCCCC' : '#00796B' }}
                          className="ml-2"
                        />                      
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </>
            ) : null
          }


          <div dangerouslySetInnerHTML={renderHTML(postValues.content)} />

          {/* Diálogo de confirmación de eliminación */}
          <Dialog open={deleteConfirmationOpen} onClose={handleDeleteCancel}>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogContent>
              <Typography variant="body1">¿Estás seguro de que quieres eliminar esta publicación?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel} color="primary">
                Cancelar
              </Button>
              <Button onClick={() => handleDeleteConfirmation()} color="primary">
                Eliminar
              </Button>
            </DialogActions>
          </Dialog>

          {/* Diálogo de confirmación de eliminación */}
          <Dialog open={visibilityConfirmationOpen} onClose={handleVisibilityCancel}>
            <DialogTitle>Confirmar Acción</DialogTitle>
            <DialogContent>
              <Typography variant="body1">¿Estás seguro de {postValues.visibility ? "quitar" : "habilitar"} la visibilidad de esta publicación?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleVisibilityCancel} color="primary">
                Cancelar
              </Button>
              <Button onClick={() => handleVisibilityConfirmation()} color="primary">
                Confirmar
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
        {/* Sección de Documentos Adjuntos */}
          <Container sx={{
            backgroundColor: "#ffffff",
            height: "100%",
            opacity: 1,
            background: "rgb(255, 255, 255)",
            color: "rgb(52, 71, 103)",
            borderRadius: '0.5rem',
            boxShadow: '0 8px 24px hsla(210,8%,62%,.2)',
            paddingY: "1em",
            paddingX: "2em",
            marginTop: '1rem',
            marginLeft: "0.5em",
            width: "30%"
          }}>
        {postValues.attachments && postValues.attachments.length > 0 && (
            <div className="border rounded-md px-2 pb-5">
              <h1 className="mb-4 text-sm font-extrabold leading-none tracking-tight text-gray-900 md:text-base lg:text-xl dark:text-white text-center">Documentos Adjuntos</h1>
                <ul>
                  {postValues.attachments.map((attachment, index) => (
                    <li key={index} className="mt-2"> 
                      <a href={attachment.url} target="_blank" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                        <DescriptionIcon className="mr-2" />{attachment.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
        )}        
        <Comments  comments={postValues.comments} postId={postId} postOrganization={postValues.organization} interactionType={postValues.interactionType}  />
          </Container>
      </div>
      
      {/* </ThemeProvider> */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="Enlace copiado al portapapeles"
      />
    </>
  );
};

export default SinglePost;
