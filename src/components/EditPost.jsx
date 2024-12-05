import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Container, TextField, ThemeProvider, useTheme, Button, Box, Typography, InputLabel, MenuItem, FormControl } from '@mui/material';
import axios from "axios";
import Uploader from './util/Uploader';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { blue } from "@mui/material/colors";
import Select, { selectClasses } from "@mui/material/Select";
import { menuClasses } from "@mui/material/Menu";
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2'

const EditPost = () => {
  const editorRef = useRef(null);
  const theme = useTheme();
  const [odsData, setOdsData] = useState([]);
  const [selectedOds, setSelectedOds] = useState("");
  const [originalData, setOriginalData] = useState({
    frm_title: '',
    frm_content: '',
    frm_type: 1,
    date: dayjs(),
    hour: dayjs(),
    place: '',
  });
  const [formValues, setFormValues] = useState({
    frm_title: '',
    frm_content: '',
    frm_type: 1,
    date: dayjs(),
    hour: dayjs(),
    place: '',
    interactionType: 1,
  });
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("No existen archivos seleccionados");
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json',
    }
  }
  const navigate = useNavigate();
  const { postId } = useParams(); // Obtener el ID del elemento a editar desde la URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_NODE_API + 'ods');
        setOdsData(response.data.ods);
        // Obtener los datos del elemento a editar y establecerlos en el estado del formulario
        const postResponse = await axios.get(`${process.env.REACT_APP_NODE_API}posts/${postId}`);
        const postData = postResponse.data.post;
        console.log('postData: ', postData)
        setFormValues({
          frm_title: postData.title,
          frm_content: postData.content,
          frm_type: postData.type,
          date: dayjs(postData.DateTimeEvent),
          hour: dayjs(postData.DateTimeEvent),
          place: postData.place,
          image: postData.imageUrl,
          interactionType: postData.interactionType,
        });
        setOriginalData(formValues);
        setSelectedOds(postData.selectedOds);
        setImage(postData.imageUrl); // Establecer la imagen del post en el estado
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [postId]); // Ejecutar al cargar el componente y cuando cambie el ID del elemento a editar

  const handleSave = async () => {
    if (editorRef.current) {
      try {
        console.log('Image File:', image);
        const FullDateTime = new Date(formValues.date.toDate());
        FullDateTime.setHours(formValues.hour.hour(), formValues.hour.minute());
        const response = await axios.put(
          `${process.env.REACT_APP_NODE_API}posts/${postId}`, // Usar el endpoint de actualización en lugar de creación
          {
            title: formValues.frm_title,
            content: editorRef.current.getContent(),
            selectedOds,
            type: formValues.frm_type,
            DateTimeEvent: FullDateTime,
            place: formValues.place,
            image: originalData.image !== image ? image : "-1",
            interactionType: formValues.interactionType,
          },
          config
        );

        if (response.status === 200) {
          // Muestra el mensaje de éxito
          Swal.fire({
            title: 'Actualizado',
            text: response.data.message || 'Publicación actualizada correctamente',
            icon: 'success',
            confirmButtonColor: "#00796B",
            confirmButtonText: 'Ok'
          }).then((result) => {
            if (result.isConfirmed) {
              navigate(`/post/${postId}`);
            }
          });
        } else {
          console.log('La solicitud no se completó con éxito');
        }
      } catch (error) {
        console.error('Ocurrió un error en la solicitud:', error);
      }
    }
  };

  const handleChildFileChange = (childImage, childFileName) => {
    setImage(childImage);
    setFileName(childFileName);
  };

  const handleEditorChange = (content, editor) => {
    setFormValues(prevValues => ({
      ...prevValues,
      frm_content: content
    }));
  };

  return (
    <ThemeProvider theme={theme}>
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
            marginTop: '0.5rem'
          }}>
        <Typography variant="h4" component="h1" gutterBottom className='text-center'>
          Edición de publicación
        </Typography>
        <TextField fullWidth label="Título" id="txfTitleForm" sx={{ marginBottom: 2 }}
          value={formValues.frm_title}
          onChange={(e) =>
            setFormValues((prevValues) => ({
              ...prevValues,
              frm_title: e.target.value,
            }))
          }
        />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          {/* Pasa la URL de la imagen como prop al componente Uploader */}
          <Uploader onFileChange={handleChildFileChange} imageUrl={formValues.image} />
        </div>        
        <FormControl fullWidth sx={{ marginBottom: 2 }} variant="standard">
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
        <FormControl fullWidth sx={{ marginBottom: '1rem' }} variant="standard">
          <InputLabel id="ods-select-label">Selecciona un ODS</InputLabel>
          <Select
            labelId="ods-select-label"
            id="ods-select"
            value={selectedOds}
            onChange={(e) => setSelectedOds(e.target.value)}
          >
            {odsData.map((ods) => (
              <MenuItem key={ods.id} value={ods.id} style={{ color: ods.color, fontWeight: "bold" }}>
                {ods.number + " - " + ods.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="typesLabel">Tipo</InputLabel>
          <Select
            labelId='typesId'
            id='typesSelect'
            value={formValues.frm_type}
            label='Tipo'
            onChange={(e) =>
              setFormValues((prevValues) => ({ ...prevValues, frm_type: e.target.value }))}
            sx={{ marginBottom: 2 }}
          >
            <MenuItem value={1}>Blog</MenuItem>
            <MenuItem value={2}>Evento</MenuItem>
            {/* <MenuItem value={3}>Encuesta</MenuItem> */}
          </Select>
        </FormControl>
        {formValues.frm_type === 2 &&
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} >
              <DatePicker label="Fecha" value={formValues.date}
                onChange={(date) => setFormValues((prevValues) => ({ ...prevValues, date }))}
                sx={{ marginBottom: 3, marginRight: 3, width: '40%' }}
              />
              <TimePicker label="Fecha" value={formValues.hour}
                onChange={(time) => setFormValues((prevValues) => ({ ...prevValues, hour: time }))}
                sx={{ marginBottom: 3, width: '40%' }}
              />
            </LocalizationProvider>
          </div>
        }
        {formValues.frm_type === 2 &&
          <TextField fullWidth label="Lugar" id="EventPlace" sx={{ marginBottom: 2 }}
            value={formValues.place}
            onChange={(e) =>
              setFormValues((prevValues) => ({ ...prevValues, place: e.target.value }))
            }
          />
        }
        <Editor
          onInit={(evt, editor) => editorRef.current = editor}
          value={formValues.frm_content}
          onEditorChange={handleEditorChange} // Manejar el cambio de contenido del editor
          init={{
            height: 700,
            language : 'es',
            selector: 'textarea',
            plugins: 'anchor autolink charmap codesample emoticons image media link lists media searchreplace table visualblocks wordcount linkchecker ',
            toolbar: 'insertfile | link image media | undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat | code',
            /* enable title field in the Image dialog*/
            image_title: true,
            /* enable automatic uploads of images represented by blob or data URIs*/
            automatic_uploads: true,
            /*
              URL of our upload handler (for more details check: https://www.tiny.cloud/docs/configure/file-image-upload/#images_upload_url)
              images_upload_url: 'postAcceptor.php',
              here we add custom filepicker only to Image dialog
            */
            file_picker_types: 'image',
            /* and here's our custom image picker*/
            file_picker_callback: (cb, value, meta) => {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');

              input.addEventListener('change', (e) => {
                const file = e.target.files[0];

                const reader = new FileReader();
                reader.addEventListener('load', () => {
                  /*
                    Note: Now we need to register the blob in TinyMCEs image blob
                    registry. In the next release this part hopefully won't be
                    necessary, as we are looking to handle it internally.
                  */
                  const id = 'blobid' + (new Date()).getTime();
                  const blobCache =  editorRef.current.editorUpload.blobCache;
                  const base64 = reader.result.split(',')[1];
                  const blobInfo = blobCache.create(id, file, base64);
                  blobCache.add(blobInfo);

                  /* call the callback and populate the Title field with the file name */
                  cb(blobInfo.blobUri(), { title: file.name });
                });
                reader.readAsDataURL(file);
              });

              input.click();
            },
          }}
        />
        <Box sx={{ '& button': { m: 1 } }}>
          <div className= 'text-center'>
            <Button variant="contained" onClick={handleSave}>Guardar</Button>
            <Button variant="contained" color="error">Cancelar</Button>
          </ div>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default EditPost;
