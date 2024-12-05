import React, { useEffect, useState } from "react";
import { ThemeProvider, Container, Typography, useTheme, Box, Grid, FormControlLabel, Radio, Checkbox, TextField, Button, IconButton, Avatar, RadioGroup, Tooltip, Menu, MenuItem, ListItemIcon, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from "axios";
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import Swal from 'sweetalert2'

const SingleForm = () => {
  const theme = useTheme();
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    timestamp: dayjs(),
    userForm: {},
  });
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([]);
  const { formId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : null;
  const userId = token ? decodedToken.id : null;

  const config = {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json',
    }
  }
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [editingFormId, setEditingFormId] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [visibilityConfirmationOpen, setVisibilityConfirmationOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await axios.get(process.env.REACT_APP_NODE_API + 'forms/' + formId);
      const data = response.data.form;
      setFormValues({
        title: data.title,
        description: data.description,
        timestamp: data.timestamp,
        userForm: data.userForm,
        visibility: data.visibility !== undefined ? data.visibility : true,
        interactionType: data.interactionType ?? 1,
      });
      setQuestions(data.questions);
      setOptions(data.options);
    } catch (error) {
      console.error('SingleForm fetchData Error:', error);
    }
  }

  const handleOptionChange = (id, fieldName, value) => {
    console.log('handleOptionChange id: ', id, ' fieldname: ', fieldName, ' value: ', value);
    let idQuestion;
    let finalUpdatedOptions;
    const updatedOptions = options.map((option) => {
      if (option.id === id) {
        idQuestion = option.idQuestion;
      }
      return option;
    });

    if (fieldName === 'selected') {

      const updatedOptionsWithSelectedFalse = updatedOptions.map((option) => {
        if (option.idQuestion === idQuestion) {
          return {
            ...option,
            selected: false,
          };
        }
        return option;
      });

      finalUpdatedOptions = updatedOptionsWithSelectedFalse.map((option) => {
        if (option.id === id) {
          return {
            ...option,
            selected: true,
          };
        }
        return option;
      });

      setOptions(finalUpdatedOptions);
    } else {
      finalUpdatedOptions = options.map((option) => {
        if (option.id === id) {
          return {
            ...option,
            [fieldName]: value,
          };
        }
        return option;
      });

      setOptions(finalUpdatedOptions);
    }
    const updatedQuestions = questions.map((question) => {
      if (question.id === idQuestion) {
        if (question.type === 3) {
          return {
            ...question,
            answeredId: id,
            answeredText: finalUpdatedOptions.find(opt => opt.id === id).description,
          };
        } else if (question.type === 2) {
          let updatedAnsweredIds;
          if (question.answeredId && question.answeredId.includes(id)) {
            updatedAnsweredIds = question.answeredId.filter(answerId => answerId !== id);
          } else {
            updatedAnsweredIds = question.answeredId ? [...question.answeredId, id] : [id];
          }
          return {
            ...question,
            answeredId: updatedAnsweredIds,
            answeredText: updatedAnsweredIds.map(answerId => finalUpdatedOptions.find(opt => opt.id === answerId).description),
          };
        } else {
          return {
            ...question,
            answeredId: id,
            answeredText: finalUpdatedOptions.find(opt => opt.id === id).description,
          };
        }
      }
      return question;
    });

    setQuestions(updatedQuestions);
    console.log('finalUpdatedOptions: ', finalUpdatedOptions);
    console.log('updatedQuestions: ', updatedQuestions);
  };

  const showOptions = (idQuestion, type) => {
    const filteredOptions = options.filter((option) => option.idQuestion === idQuestion);

    if (type === 1) {
      const selectedOption = filteredOptions.find(option => option.selected);
      return (
        <RadioGroup
          value={selectedOption ? selectedOption.id : ''}
          onChange={(e) => handleOptionChange(parseInt(e.target.value), 'selected', true)}
        >
          {filteredOptions.map((option) => (
            <FormControlLabel
              key={option.id}
              value={option.id}
              control={<Radio color="primary" />}
              label={option.description}
              sx={{
                borderRadius: '0.5rem',
                padding: '0.5rem',
                width: 'fit-content'
              }}
            />
          ))}
        </RadioGroup>
      );
    }

    return filteredOptions.map((option) => (
      <Box key={option.id}>
        {type === 2 ? (
          <FormControlLabel
            value={option.id}
            control={<Checkbox color="primary" />}
            label={option.description}
            onChange={(e) => handleOptionChange(option.id, 'selected', e.target.checked)}
            sx={{
              borderRadius: '0.5rem',
              padding: '0.5rem',
              width: 'fit-content'
            }}
          />
        ) : (
          <TextField
            placeholder="Responder la pregunta"
            fullWidth
            multiline
            value={option.description}
            size="small"
            onChange={(e) => handleOptionChange(option.id, 'description', e.target.value)}
            sx={{ marginY: '1rem', maxWidth: '95%' }}
          />
        )}
      </Box>
    ));
  };

  const showQuestions = () => {
    return questions.map((question) => (
      <Box key={question.id} sx={{
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '1.5rem'
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#00796B', fontWeight: 'bold' }}>
          {question.question}
        </Typography>
        {showOptions(question.id, question.type)}
      </Box>
    ));
  };
  const handleSave = async () => {
    var sendRequest = {
      formId,
      userId: decodedToken ? decodedToken.id : "-1",
      questions,
      verifiedUser: decodedToken ? decodedToken.verifiedUser : false,
    }

    //Realiza la solicitud al servidor
    const response = await axios.post(
      process.env.REACT_APP_NODE_API + 'answerForms',
      sendRequest,
      config
    );

    if (response.status >= 200 || response.status < 300) {
      Swal.fire({
        title: 'Actualizado',
        text: response.data.message || 'Respuesta agregada con éxito',
        icon: 'success',
        confirmButtonColor: "#00796B",
        confirmButtonText: 'Ok'
      }).then(() => {
        navigate(`/publicaciones`);
      });
    } else {
      alert('La solicitud no se completó con éxito');
    }
  }
  const [formQuestions, setFormQuestions] = useState([]);
  const showQuestionsForm = showQuestions();

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyImageUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
    setEditingFormId(formId);  // Asegurémonos de actualizar correctamente el ID del comentario en edición
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    if (formId) {
      navigate(`/editForm/${formId}`);
    }
    handleMenuClose();
  };

  const handleVisibility = () => {
    setMenuAnchor(null);
    setVisibilityConfirmationOpen(true);
  }

  const handleDelete = () => {
    setMenuAnchor(null);
    setDeleteConfirmationOpen(true);
  };

  const handleVisibilityCancel = () => {
    setVisibilityConfirmationOpen(false);
  };

  const handleVisibilityConfirmation = async () => {
    const response = await axios.put(
      `${process.env.REACT_APP_NODE_API}forms/${formId}`, // Usar el endpoint de actualización en lugar de creación
      {
        visibility: !formValues.visibility
      },
      config
    );
    if (response.status === 200) {
      // Cierra la confirmación
      setVisibilityConfirmationOpen(false);
      // Actualiza la visibilidad
      setFormValues({ ...formValues, visibility: !formValues.visibility });
      // Muestra el mensaje de éxito
      Swal.fire({
        title: 'Actualizado',
        text: 'Encuesta actualizada correctamente',
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

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(false);
  };

  const handleDeleteConfirmation = async () => {
    try {
      const url = process.env.REACT_APP_NODE_API + 'forms/' + formId;
      await axios.delete(url, config);
      //Cerrar dialogo de confirmación
      setDeleteConfirmationOpen(false);
      // Muestra el mensaje de éxito
      Swal.fire({
        title: 'Actualizado',
        text: 'Encuesta eliminada correctamente',
        icon: 'success',
        confirmButtonColor: "#00796B",
        confirmButtonText: 'Ok'
      }).then(() => {
        navigate(`/publicaciones`);
      });
    } catch (error) {
      alert('Ocurrió un error al eliminar el form');
      console.log('error: ', error);
    }
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        <Container maxWidth="md" sx={{ marginY: '2rem' }}>
          <Box sx={{
            backgroundColor: "#00796B",
            borderRadius: '0.75rem',
            padding: "1.5rem",
            color: "#ffffff",
            textAlign: 'center',
            marginBottom: "2rem",
          }}>
            <Box className="flex items-center mb-4 justify-center">
              <Avatar alt="profileImage" src={formValues.userForm.avatarImage || process.env.REACT_APP_DEFAULT_PROFILE_IMAGE} sx={{ width: 48, height: 48, marginRight: '1rem' }} />
              <Box sx={{ textAlign: "start" }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {formValues.userForm.firstname ? `${formValues.userForm.firstname} ${formValues.userForm.lastname}` : "Usuario invitado"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#ffffff" }}>
                  {new Date(formValues.timestamp._seconds * 1000 + formValues.timestamp._nanoseconds / 1e6).toLocaleString()}
                  {
                    formValues.visibility ?
                      <Tooltip title="Esta encuesta es visible para cualquier persona">
                        <IconButton sx={{ marginLeft: "1rem", padding: "0", color: "#ffffff" }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      :
                      <Tooltip title="Esta encuesta se encuentra oculta">
                        <IconButton sx={{ marginLeft: "1rem", padding: "0" }}>
                          <VisibilityOffIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                  }
                </Typography>
              </Box>
              <IconButton sx={{ marginLeft: 'auto', color: "#ffffff" }}>
                <ShareIcon onClick={handleCopyImageUrl} />
              </IconButton>
              {
                userId === formValues.userForm.userId ? (
                  <div className="flex items-center">
                    <IconButton onClick={(event) => handleMenuOpen(event)} sx={{ color: "#ffffff" }} >
                      <MoreVertIcon sx={{ cursor: 'pointer' }} />
                    </IconButton>
                    <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                      {/* <MenuItem  onClick={() => handleEdit()}>
                        <ListItemIcon>
                          <EditIcon fontSize="small" />
                        </ListItemIcon>
                        Editar
                      </MenuItem> */}
                      <MenuItem >
                        <a href={`/FormResponses/${formId}`}>
                          <ListItemIcon>
                            <QuestionAnswerIcon fontSize="small" />
                          </ListItemIcon>
                          Visualizar respuestas
                        </a>
                      </MenuItem>
                      <MenuItem onClick={() => handleVisibility()}>
                        <ListItemIcon>
                          {
                            formValues.visibility ?
                              <VisibilityOffIcon fontSize="small" />
                              :
                              <VisibilityIcon fontSize="small" />
                          }
                        </ListItemIcon>
                        {
                          formValues.visibility ?
                            "Ocultar encuesta"
                            :
                            "Mostrar encuesta"
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
            </Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              {formValues.title}
            </Typography>
            <Typography variant="body1">
              {formValues.description}
            </Typography>
          </Box>

          {
            (token && formValues.interactionType === 1) || (token && (decodedToken.verifiedUser || decodedToken.rol.includes("admin") || decodedToken.rol.includes("moderator"))) ?
              <>
                {showQuestionsForm}
                <Box sx={{ '& button': { m: 1 }, textAlign: 'center' }}>
                  <Button variant="contained" onClick={handleSave}>Guardar</Button>
                  <Button variant="contained" color="error">Cancelar</Button>
                </Box>
              </>
              : token && formValues.interactionType === 2
                ?
                (
                  <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                    <span className="font-medium">Solo pueden interactuar usuarios verificados</span>
                  </div>
                )
                :
                (
                  <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                    <span className="font-medium">Debe iniciar sesión para interactuar</span>
                  </div>
                )

          }
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            <Button variant="contained" color="primary" sx={{ px: 4, py: 1.5, fontWeight: 'bold' }} onClick={handleSave}>Guardar</Button>
            <Button variant="outlined" color="error" sx={{ px: 4, py: 1.5, fontWeight: 'bold', borderColor: '#f44336', color: '#f44336' }}>Cancelar</Button>
          </Box>
        </Container>
      </ThemeProvider>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="Enlace copiado al portapapeles"
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={visibilityConfirmationOpen} onClose={handleVisibilityCancel}>
        <DialogTitle>Confirmar Acción</DialogTitle>
        <DialogContent>
          <Typography variant="body1">¿Estás seguro de {formValues.visibility ? "quitar" : "habilitar"} la visibilidad de esta publicación?</Typography>
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
    </>
  );
}

export default SingleForm;
