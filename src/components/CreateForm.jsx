import { useRef, useState, useEffect } from 'react';
import {Container, TextField, ThemeProvider, useTheme, Button, Box, Typography, InputLabel, FormControl, Grid, MenuItem, Radio, Checkbox, Input, Tooltip } from '@mui/material';
import axios from "axios";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Link } from 'react-router-dom';
import { menuClasses } from "@mui/material/Menu";
import { blue } from "@mui/material/colors";
import Select, { selectClasses } from "@mui/material/Select";
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

const CreateForm = () => {
  const editorRef = useRef(null);
  const theme = useTheme();
  const [serverMessage, setServerMessage] = useState('');
  const [formValues, setFormValues] = useState({
    frm_title: '',
    frm_description: '',
    interactionType: 1,
  });
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([]);
  const token = localStorage.getItem('token');
  const [odsData, setOdsData] = useState([]);
  const [selectedOds, setSelectedOds] = useState("");
  
  const addOption = (idQuestion) =>{
    const newOption= {
      id: options.length + 1,
      description: "",
      idQuestion
    };

    setOptions([...options, newOption]);
  }
  // Función para eliminar una pregunta
  const deleteOption = (id) => {
    const updatedOptions = options.filter((option) => option.id !== id);
    setOptions(updatedOptions);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    //Traer listado de ODS para llenar el combo
    const response = await axios.get(process.env.REACT_APP_NODE_API + 'ods');
    setOdsData(response.data.ods);

    const firstOption = {
      id: 1,
      description: "",
      idQuestion: 1
    };
    const firstQuestion = {
      id: 1,
      question: "",
      type: 1
    };
    setOptions([firstOption]);
    setQuestions([firstQuestion]);
  };

  const handleQuestionChange = (id, fieldName, value) => {
    // Encuentra la pregunta correspondiente por su ID
    const updatedQuestions = questions.map((question) => {
      if (question.id === id) {
        return {
          ...question,
          [fieldName]: value,
        };
      }
      return question;
    });

    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (id, fieldName, value) => {
    // Encuentra la pregunta correspondiente por su ID
    const updatedOptions = options.map((option) => {
      if (option.id === id) {
        return {
          ...option,
          [fieldName]: value,
        };
      }
      return option;
    });

    setOptions(updatedOptions);
  };

  const createOptions = (idQuestion, type) => {
    const filteredOptions = options.filter((option) => option.idQuestion === idQuestion);
  
    return filteredOptions.map((option) => (
      <>
        {
          type === 3 ?
            <Box               
              sx={{
                textAlign: 'center',
                width: '100%',
                margin: '1rem'
              }}
            >
              <Input 
                disabled
                placeholder={'Texto libre'}
                sx={{
                  width: '80%',

                }}
              />
            </Box>
            :
            <>
                <Grid item xs={1} md={1}>
              {            
                type === 1 ?
                  <Radio disabled />
                :
                  <Checkbox disabled />
              }
              
            </Grid>
            <Grid item xs={10} md={10}>
              <TextField
                fullWidth
                label={`Opción`}
                id={`txfDescriptionForm_${option.id}`}
                value={option.description}
                size='small'
                onChange={(e) => handleOptionChange(option.id, 'description', e.target.value)}
                key={option.id}
                sx={{
                  marginBottom: '1rem',
                }}
              />
            </Grid>
            <Grid
              item
              xs={1}
              md={1}
            >
              <Tooltip title="Eliminar opción">
                <Button 
                  sx={{ textAlign: 'center' }}
                  onClick={() => deleteOption(option.id)}
                >
                  <CloseIcon/>
                </Button>
              </Tooltip>
            </Grid>
          </>
        }
        
      </>
    ));
  };

const createPostQuestions = () => {
  return questions.map((question) => (
    <Container key={question.id} className='border rounded-md border-[##e5e7eb] mt-5 p-10 bg-[#ffffff] shadow-lg'>
      <Box
        
      >
        <Grid container spacing={2}>
          <Grid item xs={6} md={8}>
            <TextField
              id="outlined-basic"
              label="Pregunta"
              variant="outlined"
              size='small'
              fullWidth
              value={question.question}
              onChange={(e) => handleQuestionChange(question.id, 'question', e.target.value)}
            />
          </Grid>
          <Grid item xs={4} md={3}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Tipo</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={question.type}
                size='small'
                label="Tipo"
                onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
              >
                <MenuItem value={1}>Opción múltiple</MenuItem>
                <MenuItem value={2}>Varias respuestas</MenuItem>
                <MenuItem value={3}>Texto libre</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2} md={1}>
            <Tooltip title="Eliminar pregunta">
              <Button 
                color="error"                
                onClick={() => deleteQuestion(question.id)}
              >
                <DeleteIcon />
              </Button>
            </Tooltip>
          </Grid>
          {createOptions(question.id, question.type)}
          {
            question.type === 3 ?
              null
            :
            <>
              <Grid item xs={12} md={12}>
                <Link
                  className='flex justify-center'
                  component="button"
                  variant="body2"
                  onClick={() => addOption(question.id)}
                >
                  Agregar nueva opción
                </Link>
              </Grid>
            </>
          }
        </Grid>
      </Box>
    </Container>
  ));
};

  const postQuestions = createPostQuestions();

  const addQuestion = () =>{
    const newQuestion = {
      id: questions.length + 1,
      question: "",
      type: 1
    };

    const newOption= {
      id: options.length + 1,
      description: "",
      idQuestion: newQuestion.id
    };

    setOptions([...options, newOption]);

    setQuestions([...questions, newQuestion]);
  }

  const config = {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json',
    }
  }
  
  // Función para eliminar una pregunta
  const deleteQuestion = (id) => {
    const updatedQuestions = questions.filter((question) => question.id !== id);
    setQuestions(updatedQuestions);
  };

  const handleSave = async () => {    
    try {
      //Realiza la solicitud al servidor
      const response = await axios.post(
        process.env.REACT_APP_NODE_API + 'forms',
        {
          title: formValues.frm_title,
          description: formValues.frm_description,
          selectedOds,
          questions,
          options,          
          interactionType: formValues.interactionType,
        },
        config
      );

      console.log(response);
    } catch (error) {
      console.error('Ocurrió un error en la solicitud:', error);
    }
  };

  
  return (
    <>
    <ThemeProvider theme={theme}>
    <Container sx={{
                    
                    alignItems: "center", 
                    height: "100%", 
                    opacity: 1, 
                    
                    color: "rgb(52, 71, 103)", 
                    borderRadius: "0.5rem", 
                    
                    padding: "2em", 
                    marginBottom: "0.5em",
                    marginTop: '0.5rem'
                    
      }}>
        <Typography className='font-Outfit' variant="h4" component="h1" gutterBottom sx={{textAlign: 'center'}}>
          Creación de encuestas
        </Typography>
        <div className='border rounded-md border-[##e5e7eb] bg-[#ffffff] p-4 shadow-lg'>
          <TextField
            fullWidth
            label="Título"
            variant="outlined"
            id="txfTitleForm"
            size='small'
            value={formValues.frm_title}
            onChange={(e) =>
              setFormValues((prevValues) => ({
                ...prevValues,
                frm_title: e.target.value,
              }))
            }
            sx={{
              marginBottom: '2rem', // Agrega espacio entre las filas
              marginTop: '1rem',
            }}
          />
          <TextField
            fullWidth
            label="Descripción"
            variant="outlined"
            size='small'
            id="txfDescriptionForm"
            value={formValues.frm_description}
            onChange={(e) =>
              setFormValues((prevValues) => ({
                ...prevValues,
                frm_description: e.target.value,
              }))
            }
            sx={{
              marginBottom: '1rem', // Agrega espacio entre las filas
            }}
          />
          <div className='flex gap-5'>
          <FormControl fullWidth sx={{ marginBottom: 2, marginTop: '16px' }} variant="standard">
              <InputLabel id="typesLabel">Permitir interacción a</InputLabel>
              <Select
                labelId='typesId'
                id='typesSelect'
                value={formValues.interactionType}
                label='Tipo'
                onChange={(e) => 
                  setFormValues((prevValues) => ({
                    ...prevValues,
                    interactionType: e.target.value,
                  }))}
              >
                <MenuItem value={1}>Cualquier usuario registrado</MenuItem>
                <MenuItem value={2}>Solo verificados</MenuItem>
              </Select>
            </FormControl>        
            <FormControl fullWidth sx={{marginBottom: '1rem', marginTop: '16px'}} variant="standard">
              <InputLabel id="ods-select-label">Selecciona un ODS</InputLabel>
              <Select
                labelId="ods-select-label"
                id="ods-select"
                value={selectedOds}
                onChange={(e) => setSelectedOds(e.target.value)}
                // renderValue={(selected) => selected.join(', ')} // Para mostrar los elementos seleccionados
              >
                {odsData.map((ods) => (
                  <MenuItem key={ods.id} value={ods.id} 
                    style={{ color: ods.color, fontWeight: "bold",                    
                    }}
                    >
                    {ods.number + " - " + ods.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            </div>
          </div>         

          
            {postQuestions}
            
          
          <Box 
              sx={{textAlign: 'center', marginTop: '12px'}}>
              <AddCircleOutlineIcon onClick={addQuestion} fontSize='large' sx={{cursor: 'pointer'}}/>
            </Box>
          
        <Box 
            sx={{textAlign: 'center', marginTop: '2rem'}}>
          <Button variant="contained" onClick={handleSave} sx={{margin: '0 1rem'}}>
            Guardar
          </Button>
          <Button variant="contained" color="error" sx={{margin: '0 1rem'}}>
            Cancelar
          </Button>
        </Box>
      </Container>
    </ThemeProvider>     
    </>
  );
}

export default CreateForm;