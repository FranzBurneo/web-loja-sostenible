import { useState, useEffect } from 'react';
import './Uploader.css';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { AttachFile, Delete } from '@mui/icons-material';

const Uploader = (props) => {
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("No existen archivos seleccionados");

  useEffect(() => {
    console.log('props.imageUrl: ', props.imageUrl);
    if (props.imageUrl) {
      setImage(props.imageUrl);
      setFileName(""); // Si hay una imagen, no necesitas mostrar el nombre del archivo
    }
  }, [props.imageUrl]);

  const handleFileChange = (files) => {
    if (files[0]) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const imageData = e.target.result;
        setFileName(files[0].name);
        setImage(imageData);

        // Envia la imagen como base64 al servidor
        props.onFileChange({ image: imageData, fileName: files[0].name });
      };

      reader.readAsDataURL(files[0]);
    }
  };

  return (
    <main>
      <form
        onClick={() => document.querySelector(".input-field").click()}
        className='uploaderForm'
      >
        <input
          type="file"
          accept="image/*"
          className='input-field'
          hidden
          onChange={({ target: { files } }) => handleFileChange(files)}
        />

        {image ?
          <img src={image} alt={fileName} className='uploaderImage' />
          :
          <AddPhotoAlternateIcon sx={{ color: '#ffffff' }} />
        }
      </form>
      <section className='uploaded-row'>
        <AttachFile sx={{ color: '#00796B' }} />
        <span className='upload-content'>
          {fileName}
          <Delete
            onClick={() => {
              setFileName("No existen archivos seleccionados");
              setImage(null);

              // Llama a la función del componente padre para indicar que no hay archivo
              props.onFileChange({ image: null, fileName: "No existen archivos seleccionados" });
            }}
            sx={{ cursor: 'pointer', color: '#00796B' }}
          />
        </span>
      </section>
    </main>
  );
};

export default Uploader;
