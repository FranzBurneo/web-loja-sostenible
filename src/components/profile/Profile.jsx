import { useRef, useState, useEffect } from "react";
import PencilIcon from "./PencilIcon";
import Modal from "./Modal";
import "react-image-crop/dist/ReactCrop.css";
import './profile.css';
import axios from "axios";
import { Autocomplete, Checkbox, FormControlLabel, TextField } from "@mui/material";
import Swal from 'sweetalert2';
import VerifiedIcon from '@mui/icons-material/Verified';
import Tooltip from '@mui/material/Tooltip';
import LaunchIcon from '@mui/icons-material/Launch';

const Profile = ({ onProfileImageUpdate }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const token = localStorage.getItem('token');
  const [newAvatar, setNewAvatar] = useState(false);
  const config = {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json',
    },
  };
  const [userData, setUserData] = useState({
    id: '',
    email: '',
    firstname: '',
    lastname: '',
    userId: '',
    password: '', // Agregamos un campo para la contraseña
    confirmPassword: '', // Agregamos un campo para la confirmación de la contraseña
    passwordsMatch: true, // Estado para verificar si las contraseñas coinciden
    avatarImage: process.env.REACT_APP_DEFAULT_PROFILE_IMAGE,
    organization: '',
    verifiedOrganization: false,
    idCard: '',
    birthdate: '',
    phone: '',
    address: '',
    documentFile: null,
  });
  const [formValid, setFormValid] = useState(false); // Estado para verificar si el formulario es válido
  const [showOrgSelect, setShowOrgSelect] = useState(false);
  const [organizations, setOrganizations] = useState();
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [enableOrgSelect, setEnableOrgSelect] = useState(true);
  const [sectionEnable, setSectionEnable] = useState({
    section1: true,
    section2: false,
    section3: false,
  })
  const [documentFile, setDocumentFile] = useState(null); // Nuevo estado para almacenar el archivo seleccionado

  const updateAvatar = (imgSrc) => {
    setUserData((prevValues) => ({
      ...prevValues,
      avatarImage: imgSrc,
    }))
    setNewAvatar(true);
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (organizations) {
      fetchData();
    }
  }, [organizations]);

  const loadOrganizations = async () => {
    try {
      console.log('token: ', token);
      const response = await axios.get(
        process.env.REACT_APP_NODE_API + 'organizations/'
      );
      const data = response.data;
      const tableData = data.organizations;
      setOrganizations(tableData);

    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleChange = (event, value) => {
    if (value) {
      setSelectedOrganization(value);
      setUserData((prevValues) => ({
        ...prevValues,
        organization: value.id,
      }));
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_NODE_API + 'users/byToken/', config);
      const data = response.data.user;
      console.log('userData: ', data);
      setUserData({
        id: data.id,
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        userId: data.userId,
        password: '', // Inicializamos la contraseña en vacío
        confirmPassword: '', // Inicializamos la confirmación de la contraseña en vacío
        passwordsMatch: true, // Inicializamos el estado en true
        avatarImage: data.avatarImage,
        organization: data.organization,
        verifiedOrganization: data.verifiedOrganization,
        idCard: data.idCard,
        birthdate: data.birthdate,
        phone: data.phone,
        address: data.address,
        verifiedUser: data.verifiedUser,
        documentFile: data.documentFile,
      });
      console.log('userData.organization:', data.organization)
      if (data.organization && organizations) {
        console.log('organizations: ', organizations)

        const selectedOrg = organizations.find(org => org.id === data.organization);
        if (selectedOrg) {
          // Establecer la organización encontrada como la opción seleccionada
          setSelectedOrganization(selectedOrg);
          if (!data.verifiedOrganization) {
            setShowOrgSelect(true);
          } else {
            setEnableOrgSelect(false);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Función para manejar el cambio en el campo de entrada de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Convertir el archivo a base64
        setDocumentFile(reader.result);
        const extension = file.name.split('.').pop().toLowerCase();
        // Determinar el tipo de documento según la extensión
        let documentType = 'otros'; // Por defecto, se asume como 'otros'
        if (extension === 'pdf') {
          documentType = 'application/pdf';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
          documentType = 'image/png';
        }
        setUserData((prevValues) => ({
          ...prevValues,
          documentType: documentType,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Evita la recarga de la página

    // Validar que la contraseña y su confirmación coincidan antes de enviar
    if (userData.password !== userData.confirmPassword) {
      setUserData((prevUserData) => ({
        ...prevUserData,
        passwordsMatch: false,
      }));
      return;
    }
    // Validaciones de seguridad de contraseña
    console.log(userData.password);
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*().])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    console.log(passwordRegex.test(userData.password))
    if (userData.password !== '' && !passwordRegex.test(userData.password)) {
      // La contraseña no cumple con los requisitos de seguridad
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "La contraseña debe contener al menos 8 caracteres, incluyendo al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.",
        confirmButtonColor: "#00796B",
      }).then(() => {
        return;
      });
    }
    console.log('userData: ', userData);
    const request =
    {
      firstname: userData.firstname,
      lastname: userData.lastname,
      password: userData.password,
      organization: selectedOrganization?.id,
      ...(newAvatar && { avatarImage: userData.avatarImage }),
      idCard: userData.idCard,
      birthdate: userData.birthdate,
      phone: userData.phone,
      address: userData.address,
      documentFile: documentFile,
      documentType: userData.documentType,
    };
    console.log('request: ', request);

    axios.put(
      process.env.REACT_APP_NODE_API + 'users/byToken',
      request,
      config
    )
      .then((response) => {
        console.log('response: ', response.data);
        // Muestra el mensaje de éxito
        Swal.fire({
          title: 'Actualizado',
          text: response.data.message || 'Acción realizada con éxito',
          icon: 'success',
          confirmButtonColor: "#00796B",
          confirmButtonText: 'Ok'
        }).then(() => {
          if (newAvatar) {
            onProfileImageUpdate(response.data.avatarImage)
          }
          localStorage.setItem('profileImage', response.data.avatarImage);
          localStorage.setItem('token', response.data.token);
          fetchData();
        });
      })
      .catch((error) => {
        // Maneja los errores aquí
        console.error('Error al enviar la solicitud:', error);
        alert('Error');
      });
  }

  useEffect(() => {
    // Verificar si el formulario es válido (ambos campos de contraseña no están vacíos y las contraseñas coinciden)
    const isValid = userData.password === userData.confirmPassword;
    setFormValid(isValid);
  }, [userData.password, userData.confirmPassword]);

  return (
    <>
      <div className="grid grid-cols-1 font-Outfit">
        <div className="flex flex-col w-4/5 opacity-100 p-4 mb-2 mt-2 m-auto items-center">
          <div className="flex flex-col items-center pt-2 rounded-md pb-2 relative">
            <img
              src={userData.avatarImage || process.env.REACT_APP_DEFAULT_PROFILE_IMAGE}
              alt="Avatar"
              className="w-[120px] h-[120px] rounded-full border-2 border-gray-400"
            />
            <button
              className="absolute -bottom-1 left-0 right-0 m-auto w-fit p-[.35rem] rounded-full bg-teal-700 hover:bg-teal-600 border border-gray-600"
              title="Cambiar foto"
              onClick={() => setModalOpen(true)}
            >
              <PencilIcon />
            </button>
          </div>
          <div className="flex pt-6">
            <h2 className="font-medium text-lg sm:text-xl">
              {`${userData.firstname} ${userData.lastname}`}
            </h2>
            {userData.verifiedUser ? (
              <Tooltip title="Usuario verificado">
                <VerifiedIcon className="ml-2 text-blue-500" />
              </Tooltip>
            )
              : (
                <Tooltip title="Para verificar tu usuario debes llenar todos los campos.">
                  <VerifiedIcon className="ml-2 text-gray-500" />
                </Tooltip>
              )
            }
          </div>

          {/* Formulario */}

          <form onSubmit={handleFormSubmit}>
          <div className="w-screen mt-5 p-2 sm:w-[800px]">
            <div className="bg-white flex-shrink-0 w-full  rounded-xl shadow-md  mb-2 mt-2 m-auto ">
              <div id="accordion-collapse" data-accordion="collapse">
                {/* Primer accordion */}
                <h2 id="accordion-collapse-heading-1">
                  <button 
                    type="button" 
                    className={`${sectionEnable.section1 ? 'font-semibold text-lg bg-white' : 'text-gray-500'} flex items-center justify-between w-full p-5 rtl:text-right border border-b-0 border-gray-200 rounded-t-xl dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3`}
                    data-accordion-target="#accordion-collapse-body-1" aria-expanded="true" aria-controls="accordion-collapse-body-1"
                    onClick={() => 
                      setSectionEnable({
                        section1: true,
                        section2: false,
                        section3: false,
                      })
                    }
                    >
                    <span>Información general</span>
                    <svg data-accordion-icon className="w-3 h-3 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5" />
                    </svg>
                  </button>
                </h2>
                <div id="accordion-collapse-body-1" aria-labelledby="accordion-collapse-heading-1" className={sectionEnable.section1 || "hidden"}>
                  <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                    
                    {/* Nombres */}
                    <label className="text-lg">Nombres</label><br />
                    <input
                      type="text"
                      className="rounded-sm border border-gray-400 w-full h-10 pl-4 mb-5 mt-2 font-medium text-lg"
                      value={userData.firstname}
                      onChange={(e) =>
                        setUserData((prevValues) => ({
                          ...prevValues,
                          firstname: e.target.value,
                        }))
                      }
                      required
                    />

                    {/* Apellidos */}
                    <label className="text-lg">Apellidos</label><br />
                    <input
                      type="text"
                      className="rounded-sm border border-gray-400 w-full h-10 pl-4 mb-5 mt-2 font-medium text-lg"
                      value={userData.lastname}
                      onChange={(e) =>
                        setUserData((prevValues) => ({
                          ...prevValues,
                          lastname: e.target.value,
                        }))
                      }
                      required
                    />

                    {/* Correo electronico */}
                    <label className="text-lg">Correo electrónico</label><br />
                    <input
                      type="email"
                      disabled
                      className="rounded-sm border border-gray-400 w-full h-10 pl-4 mb-5 mt-2 font-medium text-lg"
                      value={userData.email}
                      onChange={(e) =>
                        setUserData((prevValues) => ({
                          ...prevValues,
                          email: e.target.value,
                        }))
                      }
                    />

                    <div className="mb-3">
                      {
                        !userData.verifiedOrganization ? (
                          <>
                            <FormControlLabel
                            sx={{ '& .MuiFormControlLabel-label': { fontSize: '15px' } }}
                              control={
                                <Checkbox
                                  checked={showOrgSelect}
                                  sx={{
                                    color: '#00796B',
                                    '&.Mui-checked': {
                                      color: '#00796B',
                                    },
                                  }}
                                  onChange={() => { setShowOrgSelect(!showOrgSelect) }}
                                />
                              }
                              label="Solicitud de acceso a organización"
                            />
                          </>
                        ) :
                          null
                      }
                      {showOrgSelect || userData.verifiedOrganization ?
                        <>
                          <Autocomplete
                            options={organizations || []}
                            getOptionLabel={(option) => option.name}
                            renderOption={(props, option) => (
                              <li {...props}>
                                <img src={option.avatarImage} alt={option.name} style={{ width: '20px', marginRight: '10px' }} />
                                {option.name}
                              </li>
                            )}
                            disabled={!enableOrgSelect}
                            onChange={handleChange}
                            renderInput={(params) => <TextField {...params} label="Organización" variant="filled" sx={{ backgroundColor: "#ffffff !important" }} />}
                            value={selectedOrganization}
                          />
                        </>
                        :
                        null
                      }
                    </ div>

                  </div>
                </div>

                {/* Cambiar contrasena */}
                <h2 id="accordion-collapse-heading-2">
                  <button 
                    type="button" 
                    className={`${sectionEnable.section2 ? 'font-semibold text-lg bg-white' : 'text-gray-500'} flex items-center justify-between w-full p-5 rtl:text-right border border-b-0 border-gray-200 rounded-t-xl dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3`} data-accordion-target="#accordion-collapse-body-1" aria-expanded="true" aria-controls="accordion-collapse-body-1"
                    onClick={() => 
                      setSectionEnable({
                        section1: false,
                        section2: true,
                        section3: false,
                      })
                    }
                  >
                    <span>Cambiar contraseña</span>
                    <svg data-accordion-icon className="w-3 h-3 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5" />
                    </svg>
                  </button>
                </h2>

                <div id="accordion-collapse-body-2" aria-labelledby="accordion-collapse-heading-2" className={sectionEnable.section2 || "hidden"}>
                  <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700">
                    <label className="text-lg">Nueva contraseña</label><br />
                    <input
                      type="password"
                      className="rounded-sm border border-gray-400 w-full h-10 pl-4 mb-5 mt-2 font-medium text-lg"
                      value={userData.password}
                      onChange={(e) =>
                        setUserData((prevValues) => ({
                          ...prevValues,
                          password: e.target.value,
                          passwordsMatch: true, // Restauramos el estado para indicar que las contraseñas se están editando nuevamente
                        }))
                      }
                    />
                    <label className="text-lg">Confirmar nueva contraseña</label><br />
                    <input
                      type="password"
                      className="rounded-sm border border-gray-400 w-full h-10 pl-4 mb-5 mt-2 font-medium text-lg"
                      value={userData.confirmPassword}
                      onChange={(e) =>
                        setUserData((prevValues) => ({
                          ...prevValues,
                          confirmPassword: e.target.value,
                          passwordsMatch: true, // Restauramos el estado para indicar que las contraseñas se están editando nuevamente
                        }))
                      }
                    />
                    {!formValid && (
                      <p className="text-red-500">Las contraseñas no coinciden</p>
                    )}
                  </div>
                </div>
                <h2 id="accordion-collapse-heading-3">
                  <button 
                    type="button" 
                    className={`${sectionEnable.section3 ? 'font-semibold text-lg bg-white' : 'text-gray-500'} flex items-center justify-between w-full p-5 rtl:text-right border border-b-0 border-gray-200 rounded-t-xl dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3`} data-accordion-target="#accordion-collapse-body-1" aria-expanded="true" aria-controls="accordion-collapse-body-1"
                    onClick={() => 
                      setSectionEnable({
                        section1: false,
                        section2: false,
                        section3: true,
                      })
                    }
                  >
                    <span>Información para ser verificado</span>
                    <svg data-accordion-icon className="w-3 h-3 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5" />
                    </svg>
                  </button>
                </h2>
                <div id="accordion-collapse-body-3" aria-labelledby="accordion-collapse-heading-3" className={sectionEnable.section3 || "hidden"}>
                  <div className="p-5 border border-t-0 border-gray-200 dark:border-gray-700">
                    <label className="text-lg">Documento de identidad</label><br />
                    <input
                      type="text"
                      className="rounded-sm border border-gray-400 w-full h-10 pl-4 mb-5 mt-2 font-medium text-lg"
                      value={userData.idCard}
                      onChange={(e) =>
                        setUserData((prevValues) => ({
                          ...prevValues,
                          idCard: e.target.value.replace(/\D/g, ''), // Elimina todos los caracteres que no sean dígitos
                        }))
                      }
                      minLength="10"
                      maxLength="13"
                    />
                    <label for="file_input" className="text-lg">Cargar documento (opcional)</label>
                    {
                      userData.documentFile ? (
                        <Tooltip title='Mostrar documento cargado' >
                          <a href={userData.documentFile} target="_blank" className="ml-2 cursor-pointer">
                          <LaunchIcon />
                          </a>
                        </Tooltip>
                      ) :
                      null
                    }
                    
                    <input 
                      className="mb-3 mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-sm cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
                      id="file_input" 
                      type="file"
                      accept=".pdf, image/*"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="" className="text-lg">Fecha de nacimiento</label><br />
                    <input
                      type="date"
                      id="birthdate"
                      className="rounded-sm border border-gray-400 w-full h-10 pl-4 mb-5 mt-2 font-medium text-lg pr-2"
                      value={userData.birthdate}
                      onChange={(e) =>
                        setUserData((prevValues) => ({
                          ...prevValues,
                          birthdate: e.target.value,
                        }))
                      }
                    />
                    <label htmlFor="" className="text-lg">Teléfono</label><br />
                    <input
                      type="text"
                      id="phone"
                      className="rounded-sm border border-gray-400 w-full h-10 pl-4 mb-5 mt-2 font-medium text-lg"
                      value={userData.phone}
                      onChange={(e) =>
                        setUserData((prevValues) => ({
                          ...prevValues,
                          phone: e.target.value.replace(/\D/g, ''), // Elimina todos los caracteres que no sean dígitos
                        }))
                      }
                      minLength="6"
                      maxLength="12"
                    />
                    <label htmlFor="" className="text-lg">Dirección</label><br />
                    <input
                      type="text"
                      className="rounded-sm border border-gray-400 w-full h-10 pl-4 mb-5 mt-2 font-medium text-lg"
                      value={userData.address}
                      onChange={(e) =>
                        setUserData((prevValues) => ({
                          ...prevValues,
                          address: e.target.value,
                        }))
                      }
                      minLength="5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Button guardar */}

          <div className="flex-shrink-0 p-4">
            <div className="flex content-center justify-center">
              <button
                type="submit"
                className={`rounded-md text-xl w-28 h-10 ${formValid ? 'bg-[#00796B] text-white hover:bg-teal-600' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                Guardar
              </button>
            </div>
          </div>
        </form>

        </div>
        
      </div>
      {modalOpen && (
        <Modal
          updateAvatar={updateAvatar}
          closeModal={() => setModalOpen(false)}
        />
      )}
    </>
  );

};

export default Profile;
