import React, { useState } from 'react'
import { ThemeProvider, Container, Typography, useTheme, TextareaAutosize, Button, Menu, MenuItem, IconButton, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import './css/Comments.css';
import axios from "axios";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { jwtDecode } from 'jwt-decode';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SendIcon from '@mui/icons-material/Send';
import Tooltip from '@mui/material/Tooltip';
import ReplyIcon from '@mui/icons-material/Reply';

export default function Comments(props) {
  console.log('props', props)

  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [menuCommentId, setMenuCommentId] = useState(null);
  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : null;
  const profileImage = localStorage.getItem('profileImage') === "undefined" ? null : localStorage.getItem('profileImage');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const enableOptions = () => {
    // console.log('decodedToken.rol: ', decodedToken.rol, ' decodedToken.organization; ', decodedToken.organization, ' props.postOrganization: ', props.postOrganization)
    if(token){
      if (
        (
          decodedToken.rol.includes("admin") && decodedToken.organization === undefined
        ) || (
          decodedToken.rol.includes("admin") && decodedToken.organization === props.postOrganization
        )
      ) {
        console.log('true')
        return true
      }
    }
      return false
  };

  const theme = useTheme();
  const config = {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json',
    },
  };
  const userId = token ? decodedToken.id : null;

  const handleGuardar = async () => {
    try {
      let url = process.env.REACT_APP_NODE_API + 'comments/';
      let req = {
        content: comment,
        postId: props.postId,
      };
      if (replyingToCommentId) {
        url = process.env.REACT_APP_NODE_API + `comments/${replyingToCommentId}/reply`;
        req = {
          content: replyContent,
        };
      }
      await axios.post(url, req, config);
      window.location.reload();
      setComment('');
      setReplyContent('');
      setReplyingToCommentId(null);
    } catch (error) {
      alert('Ocurrió un error');
      console.log('error: ', error);
    }
  };

  const handleMenuOpen = (event, commentId) => {
    setMenuAnchor(event.currentTarget);
    setEditingCommentId(commentId);  // Asegurémonos de actualizar correctamente el ID del comentario en edición
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAnswerClose = () => {
    setMenuCommentId(null);
  }

  const handleEdit = () => {
    // Lógica para editar el comentario
    let commentToEdit = props.comments.find((comment) => comment.id === editingCommentId);

    // Si no se encuentra el comentario en props.comments, buscar en replies de cada comentario
    if (!commentToEdit) {
      commentToEdit = props.comments.find((comment) => comment.replies && comment.replies.some(reply => reply.id === editingCommentId));
      if (commentToEdit) {
        // Si se encuentra en las respuestas, obtener el comentario específico
        commentToEdit = commentToEdit.replies.find(reply => reply.id === editingCommentId);
      }
    }

    // Actualizar el estado según el comentario encontrado
    if (commentToEdit) {
      setMenuCommentId(editingCommentId);
      setEditedComment(commentToEdit.content);
    } else {
      console.log('No se encontró el comentario');
    }

    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    try {
      const url = process.env.REACT_APP_NODE_API + 'comments/' + editingCommentId;
      const req = {
        content: editedComment,
      };
      await axios.put(url, req, config);
      window.location.reload();
      setEditingCommentId(null);
      setEditedComment('');
    } catch (error) {
      alert('Ocurrió un error al guardar la edición del comentario');
      console.log('error: ', error);
    }
  };

  const handleDelete = (commentId) => {
    setMenuAnchor(null);
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirmation = async () => {
    try {
      const url = process.env.REACT_APP_NODE_API + 'comments/' + editingCommentId;
      await axios.delete(url, config);
      window.location.reload();
    } catch (error) {
      alert('Ocurrió un error al eliminar el comentario');
      console.log('error: ', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(false);
  };

  return (
    <div style={{ paddingBottom: '1rem' }}>
      <ThemeProvider theme={theme}>
        <Typography variant='h5' sx={{ textAlign: 'center' }}>Sección de comentarios</Typography>
        <Container className="commentContainer">
          {/* Fila 1: Imagen y Nombre */}
          {
            (token && props.interactionType === 1) ||  (token && (decodedToken.verifiedUser || decodedToken.rol.includes("admin") || decodedToken.rol.includes("moderator"))) ?
            (
            <>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div style={{ borderRadius: '50%', overflow: 'hidden', width: '50px', height: '50px', marginRight: '10px' }}>
                  <img src={profileImage ? profileImage : process.env.REACT_APP_DEFAULT_PROFILE_IMAGE} alt="Imagen de la persona" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <Typography variant="h6">{token ? decodedToken.firstname + " " + decodedToken.lastname : 'Sin usuario'}</Typography>
              </div>

              {/* Fila 2: Crear Comentario */}
              <TextareaAutosize
                placeholder="Escribe algo..."
                className="txtArea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button variant="contained" onClick={handleGuardar}>
                Agregar
              </Button>
            </>
            )
            : token && props.interactionType === 2
            ?
            (
              <Typography variant="h6">Solo pueden comentar usuarios verificados</Typography>
            )
            :
            (
              <Typography variant="h6">Debe iniciar sesión para comentar</Typography>  
            )
          }

        </Container>
        { props.comments && props.comments.length > 0 ? (
          <>
            <Container className="commentContainer">
              {props.comments?.map((row) => (
                <div key={row.id}>
                  {/* Fila 1: Imagen y Nombre */}
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <div style={{ borderRadius: '50%', overflow: 'hidden', width: '50px', height: '50px', marginRight: '10px' }}>
                        <img src={row.user.profileImage ? row.user.profileImage : process.env.REACT_APP_DEFAULT_PROFILE_IMAGE} alt="Imagen de la persona" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6">{`${row.user.firstname ?? ""} ${row.user.lastname ?? ""}`.trim() || "Usuario invitado"}</Typography>
                        <Typography variant="caption">{new Date(row.timestamp._seconds * 1000 + row.timestamp._nanoseconds / 1e6).toLocaleString()}</Typography>
                      </div>
                    </div>
                    {/* Contenedor para opciones */}
                    {
                      (userId === row.user.id || enableOptions()) ? (
                        <div style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}>
                          <IconButton onClick={(event) => handleMenuOpen(event, row.id)}>
                            <MoreVertIcon sx={{ cursor: 'pointer' }} />
                          </IconButton>
                          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                            <MenuItem onClick={() => handleEdit(row.id)}>
                              <ListItemIcon>
                                <EditIcon fontSize="small" />
                              </ListItemIcon>
                              Editar
                            </MenuItem>
                            <MenuItem onClick={() => handleDelete(row.id)}>
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

                  {/* Fila 2: Comentario */}
                  {menuCommentId === row.id ? (
                    <>
                      <TextareaAutosize
                        className="txtArea"
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                      />
                      {/* Botones de edición */}
                      <DialogActions>
                        <Button onClick={handleAnswerClose} color="primary">
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveEdit} color="primary">
                          Guardar
                        </Button>
                      </DialogActions>
                    </>
                  ) : (
                    // Contenido del comentario
                    <Typography variant="body1" sx={{ marginTop: '0.6rem' }}>{row.content}</Typography>
                  )}
                  <div style={{ marginBottom: '1.2rem' }}>
                    {token ? //Permitir responder solo si tiene usuario
                      <Typography
                        variant="caption"
                        sx={{
                          cursor: 'pointer',
                          textDecoration: 'none', // Inicialmente sin subrayado
                          '&:hover': {
                            textDecoration: 'underline', // Subrayado al pasar el mouse
                          },
                        }}
                        onClick={() => setReplyingToCommentId(row.id)}
                      >
                        Responder
                      </Typography>
                      : null
                    }
                    {/* Responder comentario */}
                    {replyingToCommentId === row.id && (
                      <div className='flex items-center ml-2 mt-2'>
                        <TextareaAutosize
                          placeholder="Responder..."
                          className="txtArea"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <Tooltip title="Enviar comentario">
                          <SendIcon onClick={handleGuardar} className='cursor-pointer mx-5' />
                        </Tooltip>
                      </div>
                    )}
                </div>  
                  {/* mapear las respuestas de los comentarios */}
                  {row.replies && row.replies.map((reply) => (
                    <div key={reply.id} className='ml-4 mt-2 p-2'>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                          <div style={{ borderRadius: '50%', overflow: 'hidden', width: '50px', height: '50px', marginRight: '10px' }}>
                            <img src={reply.user.profileImage ? reply.user.profileImage : process.env.REACT_APP_DEFAULT_PROFILE_IMAGE} alt="Imagen de la persona" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex' }}>
                              {`${reply.user.firstname ?? ""} ${reply.user.lastname ?? ""}`.trim() || "Usuario invitado"}
                              {
                                reply.nameUserReplied ?
                                  <div className='flex'>
                                    <PlayArrowIcon className='ml-2' />
                                    <div className='ml-2'>
                                      {reply.nameUserReplied}
                                    </div>
                                  </div>
                                  :
                                  null
                              }
                            </div>
                            <Typography variant="caption">{new Date(reply.timestamp._seconds * 1000 + reply.timestamp._nanoseconds / 1e6).toLocaleString()}</Typography>
                          </div>
                        </div>
                        {/* Contenedor para opciones */}
                        {
                          (userId === row.user.id || enableOptions()) ? (
                            <div style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}>
                              <IconButton onClick={(event) => handleMenuOpen(event, reply.id)}>
                                <MoreVertIcon sx={{ cursor: 'pointer' }} />
                              </IconButton>
                              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                                <MenuItem onClick={() => handleEdit(reply.id)}>
                                  <ListItemIcon>
                                    <EditIcon fontSize="small" />
                                  </ListItemIcon>
                                  Editar
                                </MenuItem>
                                <MenuItem onClick={() => handleDelete(reply.id)}>
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
                      {/* Fila 2: Comentario */}
                      {menuCommentId === reply.id ? (
                        <>
                          <TextareaAutosize
                            className="txtArea"
                            value={editedComment}
                            onChange={(e) => setEditedComment(e.target.value)}
                          />
                          {/* Botones de edición */}
                          <DialogActions>
                            <Button onClick={handleAnswerClose} color="primary">
                              Cancelar
                            </Button>
                            <Button onClick={handleSaveEdit} color="primary">
                              Guardar
                            </Button>
                          </DialogActions>
                        </>
                      ) : (
                        // Contenido del comentario
                        <Typography variant="body1" sx={{ marginTop: '0.6rem' }}>{reply.content}</Typography>
                      )}
                      <div style={{ marginBottom: '1.2rem' }}>
                        {token ? //Permitir responder solo si tiene usuario
                          <Typography
                            variant="caption"
                            sx={{
                              cursor: 'pointer',
                              textDecoration: 'none', // Inicialmente sin subrayado
                              '&:hover': {
                                textDecoration: 'underline', // Subrayado al pasar el mouse
                              },
                            }}
                            onClick={() => setReplyingToCommentId(reply.id)}
                          >
                            <ReplyIcon/>
                            Responder
                          </Typography>
                          : null
                        }
                        {/* Responder comentario */}
                        {replyingToCommentId === reply.id && (
                          <div className='flex items-center ml-2 mt-2'>
                            <TextareaAutosize
                              placeholder="Responder..."
                              className="txtArea"
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                            />
                            <Tooltip title="Enviar comentario">
                              <SendIcon onClick={handleGuardar} className='cursor-pointer mx-5' />
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </ div>

                  ))}
                  {/* Diálogo de confirmación de eliminación */}
                  <Dialog open={deleteConfirmationOpen} onClose={handleDeleteCancel}>
                    <DialogTitle>Confirmar Eliminación</DialogTitle>
                    <DialogContent>
                      <Typography variant="body1">¿Estás seguro de que quieres eliminar este comentario?</Typography>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleDeleteCancel} color="primary">
                        Cancelar
                      </Button>
                      <Button onClick={() => handleDeleteConfirmation(row.id)} color="primary">
                        Eliminar
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
              ))}
            </Container>
          </>
        ) :
          null
        }

      </ThemeProvider>
    </div>
  );
}
