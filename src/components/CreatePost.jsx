import { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Container, TextField, ThemeProvider, useTheme, Button, Box, Typography, InputLabel, MenuItem, FormControl, Select } from '@mui/material';
import axios from "axios";
import Uploader from './util/Uploader';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const editorRef = useRef(null);
  const theme = useTheme();
  const [odsData, setOdsData] = useState([]);
  const [selectedOds, setSelectedOds] = useState("");
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
  const [attachments, setAttachments] = useState([]);
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json',
    }
  }
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_NODE_API + 'ods');
        setOdsData(response.data.ods);
      } catch (error) {
        console.error('Error fetching ODS data:', error);
      }
    };

    fetchData();
  }, []);

  const truncateContent = (html) => {
    const maxLength = 500;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || "";
    const truncatedText = textContent.slice(0, maxLength);
    return `${truncatedText}${textContent.length > maxLength ? "..." : ""}`;
  };

  const handleSave = async () => {
    if (editorRef.current) {
      try {
        const FullDateTime = new Date(formValues.date.toDate());
        FullDateTime.setHours(formValues.hour.hour(), formValues.hour.minute());
        // Convertir los archivos adjuntos a base64 y obtener el contentType
        const attachmentsData = await Promise.all(attachments.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve({ 
              fileName: file.name, 
              fileContent: reader.result, 
              contentType: file.type // Obtener el contentType
            });
            reader.onerror = error => reject(error);
          });
        }));

        const request = {
          title: formValues.frm_title,
          content: editorRef.current.getContent(),
          summaryContent: truncateContent(editorRef.current.getContent()),
          selectedOds,
          type: formValues.frm_type,
          DateTimeEvent: FullDateTime,
          place: formValues.place,
          image: image,
          interactionType: formValues.interactionType,
          attachments: attachmentsData
        };
        console.log('CreatePost HandleSave: ', request);

        const response = await axios.post(
          process.env.REACT_APP_NODE_API + 'posts',
          request,
          config
        );

        if (response.status === 200) {
          const data = response.data;
          alert('Publicación creada correctamente');
          navigate(`/post/${data.postId}`);
        }
      } catch (error) {
        console.error('Ocurrió un error en la solicitud:', error);
      }
    }
  };
  const handleEditorChange = (content) => {
    setFormValues(prevValues => ({
      ...prevValues,
      frm_content: content
    }));
  };

  const handleAttachmentsChange = (event) => {
    setAttachments([...event.target.files]);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container sx={{
        backgroundColor: "#ffffff",
        padding: "2rem",
        borderRadius: "1rem",
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        margin: '2rem auto',
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#34495e' }}>
          Creación de publicaciones
        </Typography>

        <TextField
          fullWidth
          label="Título"
          sx={{ marginBottom: 2 }}
          value={formValues.frm_title}
          onChange={(e) => setFormValues({ ...formValues, frm_title: e.target.value })}
          variant="outlined"
        />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <Uploader onFileChange={(childImage, childFileName) => {
            setImage(childImage);
            setFileName(childFileName);
          }} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Permitir interacción a</label>
          <select
            className="block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-green-500"
            value={formValues.interactionType}
            onChange={(e) => setFormValues({ ...formValues, interactionType: e.target.value })}>
            <option value={1}>Cualquier usuario registrado</option>
            <option value={2}>Solo verificados</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona un ODS</label>
          <select
            className="block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-green-500"
            value={selectedOds}
            onChange={(e) => setSelectedOds(e.target.value)}>
            <option value="">Ninguno</option> {/* Opción para seleccionar ninguno */}
            {odsData.map((ods) => (
              <option key={ods.id} value={ods.id} style={{ color: ods.color, fontWeight: "bold" }}>
                {ods.number + " - " + ods.name}
              </option>
            ))}
          </select>
        </div>


        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            className="block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-green-500"
            value={formValues.frm_type}
            onChange={(e) => setFormValues({ ...formValues, frm_type: e.target.value })}>
            <option value={1}>Blog</option>
            <option value={2}>Evento</option>
          </select>
        </div>

        {formValues.frm_type === 2 && (
          <>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <DatePicker
                  label="Fecha"
                  value={formValues.date}
                  onChange={(date) => setFormValues({ ...formValues, date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <TimePicker
                  label="Hora"
                  value={formValues.hour}
                  onChange={(time) => setFormValues({ ...formValues, hour: time })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Box>
            </LocalizationProvider>

            <TextField
              fullWidth
              label="Lugar"
              sx={{ marginBottom: 2 }}
              value={formValues.place}
              onChange={(e) => setFormValues({ ...formValues, place: e.target.value })}
            />
          </>
        )}

        <Box sx={{ marginBottom: 2 }}>
          <label htmlFor="multiple_files" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Adjuntar Archivos
          </label>
          <input
            id="multiple_files"
            type="file"
            multiple
            accept=".pdf,.mp4,.mov,.avi,.wmv,.mkv,.mp3,.wav,.ogg,.ppt,.pptx,.xls,.xlsx,.doc,.docx"
            onChange={handleAttachmentsChange}
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #ccc',
              width: '100%',
              cursor: 'pointer'
            }}
          />
        </Box>
        <Editor
          onInit={(evt, editor) => editorRef.current = editor}
          value={formValues.frm_content}
          onEditorChange={handleEditorChange}
          init={{
            height: 700,
            language: 'es',
            selector: 'textarea',
            plugins: 'anchor autolink charmap codesample emoticons image media link lists media searchreplace table visualblocks wordcount linkchecker',
            toolbar: 'insertfile | link image media | undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat | code',
            image_title: true,
            automatic_uploads: true,
            file_picker_types: 'image',
            file_picker_callback: (cb, value, meta) => {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');

              input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                  const id = 'blobid' + (new Date()).getTime();
                  const blobCache = editorRef.current.editorUpload.blobCache;
                  const base64 = reader.result.split(',')[1];
                  const blobInfo = blobCache.create(id, file, base64);
                  blobCache.add(blobInfo);
                  cb(blobInfo.blobUri(), { title: file.name });
                });
                reader.readAsDataURL(file);
              });
              input.click();
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
          <Button variant="contained" onClick={handleSave} sx={{ marginRight: 2 }}>Guardar</Button>
          <Button variant="outlined" color="error">Cancelar</Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default CreatePost;
