import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  TextField,
  ThemeProvider,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import axios from "axios";

const ADD_FORUM_ENDPOINT = 'https://localhost:7128/api/wsPublicaciones/add_forum';

const RootContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const EditorBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  border: "1px solid lightgray",
  padding: theme.spacing(1),
  position: "relative",
}));

const ImageContainer = styled("div")({
  position: "relative",
  display: "inline-block",
  margin: "8px",
});

const Image = styled("img")<{ size: string }>(({ size }) => ({
  maxWidth: "100%",
  maxHeight: "200px",
  width: size,
  height: "auto",
}));

const ForumPostForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageSize, setImageSize] = useState("200px");
  const [textSize, setTextSize] = useState("16px");
  const [textAlign, setTextAlign] = useState<"center" | "left" | "right" | "justify">("left");

  const [previewOpen, setPreviewOpen] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);

  const theme = useTheme();

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleContentChange = () => {
    if (contentEditableRef.current) {
      setContent(contentEditableRef.current.innerHTML);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedImage = event.target.files[0];
      setImage(selectedImage);
    }
  };

  const handleSizeChange = () => {
    if (sizeInputRef.current) {
      const newSize = sizeInputRef.current.value;
      setImageSize(newSize);
    }
  };

  const handleBoldClick = () => {
    document.execCommand("bold", false);
    handleContentChange();
  };

  const handleUnderlineClick = () => {
    document.execCommand("underline", false);
    handleContentChange();
  };

  const handleItalicClick = () => {
    document.execCommand("italic", false);
    handleContentChange();
  };

  const handlePreviewOpen = () => {
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    sendDataToAPI();
  };

  const handleTextSizeChange = (
    event: SelectChangeEvent<{ value: string }>
  ) => {
    setTextSize(event.target.value as string);
  };

  const handleTextAlignChange = (
    event: SelectChangeEvent<{
      value: "center" | "left" | "right" | "justify";
    }>
  ) => {
    setTextAlign(event.target.value as "center" | "left" | "right" | "justify");
  };

  const sendDataToAPI = async () => {
    // Aquí puedes realizar la lógica para enviar los datos al servidor
    // Puedes utilizar la librería "fetch" o "axios" para hacer la solicitud HTTP
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // Los meses comienzan desde 0 (enero es 0, febrero es 1, etc.)
    const currentDay = currentDate.getDate();

    const data = {
      pbl_id: 0,
      pbl_titulo: title,
      pbl_contenido: content,
      pbl_tipo_pbl: 1,
      pbl_fk_usuario: 1,
      // image: image,
      // textSize: textSize,
      // textAlign: textAlign,
    };
    console.log(data);
    const response = await axios.post(
      ADD_FORUM_ENDPOINT,data
    );
    const data_test = response.data;
    console.log(data);

    // // Realiza la solicitud HTTP utilizando fetch o axios
    // fetch(ADD_FORUM_ENDPOINT, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(data),
    // })
    //   .then((response) => response.json())
    //   .then((responseData) => {
    //     // Aquí puedes manejar la respuesta del servidor
    //     console.log(responseData);
    //   })
    //   .catch((error) => {
    //     // Aquí puedes manejar los errores en caso de que la solicitud falle
    //     console.error('Error:', error);
    //   });
  };
  

  return (
    <ThemeProvider theme={theme}>
      <RootContainer maxWidth="lg"
        sx={{
          border: `1px solid ${theme.palette.primary.main}`,
          padding: '1rem',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Ajusta los valores según tu preferencia
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Crear una nueva publicación
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            required
            label="Título"
            value={title}
            onChange={handleTitleChange}
            fullWidth
            margin="normal"
          />

          <Typography variant="subtitle1" gutterBottom>
            Contenido de la publicación:
          </Typography>

          <EditorBox>
            {image && (
              <ImageContainer>
                <Image src={URL.createObjectURL(image)} alt="Imagen" size={imageSize} />
              </ImageContainer>
            )}
            <TextField
              label="Tamaño de la imagen"
              defaultValue={imageSize}
              inputRef={sizeInputRef}
              onBlur={handleSizeChange}
            />
            <Box>
              <Button variant="outlined" onClick={handleBoldClick}
                sx={{ height: "40px" }}
              >
                Negrita
              </Button>
              <Button variant="outlined" onClick={handleUnderlineClick}
                sx={{ height: "40px" }}
              >
                Subrayado
              </Button>
              <Button variant="outlined" onClick={handleItalicClick}
                sx={{ height: "40px" }}
              >
                Cursiva
              </Button>
              <FormControl sx={{ width: "100px" }}>
                <Select
                  labelId="text-size-label"
                  id="text-size-select"
                  value={{ value: textSize }}
                  onChange={handleTextSizeChange}
                  sx={{ height: "40px" }}
                >
                  <MenuItem value="12px" selected>12</MenuItem>
                  <MenuItem value="16px">16</MenuItem>
                  <MenuItem value="20px">20</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ width: "100px" }}>
                <Select
                  labelId="text-align-label"
                  id="text-align-select"
                  value={""}
                  onChange={handleTextAlignChange}
                  sx={{ height: "40px" }}
                >
                  <MenuItem value="left"><FormatAlignLeftIcon /></MenuItem>
                  <MenuItem value="center"><FormatAlignCenterIcon /></MenuItem>
                  <MenuItem value="right"><FormatAlignRightIcon /></MenuItem>
                  <MenuItem value="justify"><FormatAlignJustifyIcon /></MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                sx={{ height: "40px" }}
              >
                Agregar Imagen
              </Button>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleImageChange}
              />
            </Box>

            <div
              contentEditable
              ref={contentEditableRef}
              onInput={handleContentChange}
              style={{
                minHeight: "300px",
                border: "0.1em solid black",
                fontSize: textSize,
                textAlign: textAlign,
              }}
            ></div>

          </EditorBox>

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Publicar
          </Button>

          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={handlePreviewOpen}
            style={{ marginTop: "16px" }}
          >
            Previsualizar
          </Button>

          <Dialog open={previewOpen} onClose={handlePreviewClose} maxWidth="md">
            <DialogTitle>Previsualización de la publicación</DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Typography variant="h6">{title}</Typography>
                <div dangerouslySetInnerHTML={{ __html: content }}></div>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handlePreviewClose} color="primary">
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>
        </form>
      </RootContainer>
    </ThemeProvider>
  );
};

export default ForumPostForm;