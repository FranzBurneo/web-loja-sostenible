import { Button } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import Modal from '../profile/Modal';
import PencilIcon from '../profile/PencilIcon';

export const OrganizationForm = (props) => {
  console.log(props);
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json',
    }
  }
  const [modalOpen, setModalOpen] = useState(false);
  const {orgInfo, setOpen, setAlertInfo } = props;
  const [newAvatar, setNewAvatar] = useState(false);
  const [formValues, setFormValues] = useState({...orgInfo})
  const [errors, setErrors] = useState({}); // Estado para manejar errores de validación

  const updateAvatar = (imgSrc) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      avatarImage: imgSrc,
    }))
    setNewAvatar(true);
  };

  const handleSave = async () => {
    // Validar los campos antes de guardar
    const validationErrors = {};
    if (!formValues.name) {
      validationErrors.name = 'El nombre es obligatorio';
    }
    if (!formValues.location) {
      validationErrors.location = 'La ubicación es obligatoria';
    }
    if (!formValues.contactNumber) {
      validationErrors.contactNumber = 'El número de contacto es obligatorio';
    }
    if (!formValues.organizationType) {
      validationErrors.organizationType = 'El tipo de organización es obligatorio';
    }

    if (Object.keys(validationErrors).length > 0) {
      // Si hay errores de validación, establecer el estado de errores y detener el guardado
      setErrors(validationErrors);
      return;
    }

    try {
      console.log('orgInfo: ', orgInfo);
      const url = process.env.REACT_APP_NODE_API + 'organizations/';
      const req = {
        name: formValues.name,
        description: formValues.description,
        location: formValues.location,
        contactNumber: formValues.contactNumber,
        organizationType: formValues.organizationType,
        avatarImage: formValues.avatarImage,
        active: formValues.active,
      }
      let response;
      if(orgInfo.id === ''){
        response = await axios.post(url, req, config)
      }else{
        response = await axios.put(url + orgInfo.id, req, config)
      }
      // Verificación más específica
      if (response && response.data && typeof response.data === 'object') {
        const data = response.data;  
        setAlertInfo(() => ({
          alertOpen: true,
          message: data.message || 'Error',
          alertType: 'success',
        }));
      }
      if (setOpen) setOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Manejar errores específicos de la respuesta del servidor
        const status = error.response.status;
        if (status === 500) {
          // Error interno del servidor
          setAlertInfo(() => ({
            alertOpen: true,
            message: 'Error interno del servidor. Intente nuevamente más tarde.',
            alertType: 'error',
          }));
        } else {
          setAlertInfo(() => ({
            alertOpen: true,
            message: `Error en la solicitud. Código de estado: ${status}`,
            alertType: 'error',
          }));
        }
      } else {
        // Otros errores (no relacionados con Axios)
        setAlertInfo(() => ({
          alertOpen: true,
          message: 'Ocurrió un error. Intente nuevamente más tarde.',
          alertType: 'error',
        }));
      }
  
      if (setOpen) setOpen(false);
    }
    console.log('save: ', formValues);
  };

  const handleInputChange = (key) => (e) => {  
    setFormValues((prevValues) => ({
      ...prevValues,
      [key]: e.target.value,
    }));
  };

  return(
    <>
      <div className="flex flex-col items-center pt-2 rounded-md pb-7">
        <div className="relative">
          <img
            src={formValues.avatarImage || process.env.REACT_APP_DEFAULT_ORGANIZATION_IMAGE}
            alt="Avatar"
            className="w-[150px] h-[150px] rounded-full border-2 border-gray-400"
          />
          <button
            className="absolute -bottom-3 left-0 right-0 m-auto w-fit p-[.35rem] rounded-full bg-teal-700 hover:bg-teal-600 border border-gray-600"
            title="Cambiar foto"
            onClick={() => setModalOpen(true)}
          >
            <PencilIcon />
          </button>
        </div>
        <div className="my-4">
          <h2 className="font-bold">{`${formValues.name}`}</h2>
        </div>
        <form className='w-[80%]'>
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre</label>
                <input 
                  type="text" 
                  id="name" 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  placeholder="Loja Sostenible" 
                  value={formValues.name}
                  onChange={handleInputChange('name')}
                  required 
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descripción</label>
                <input 
                  type="text" 
                  id="description" 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  placeholder="Agrega una descripción..."
                  value={formValues.description}
                  onChange={handleInputChange('description')}                   
                />
            </div>
            <div>
                <label htmlFor="location" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ubicación</label>
                <input 
                  type="text" 
                  id="location" 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  placeholder="Loja" 
                  value={formValues.location}
                  onChange={handleInputChange('location')}
                  required 
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>  
            <div>
                <label htmlFor="contactNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Número de Contacto</label>
                <input 
                  type="tel" 
                  id="contactNumber" 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  placeholder="123-45-678" 
                  pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                  value={formValues.contactNumber}
                  onChange={handleInputChange('contactNumber')}                  
                  required 
                />
                {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
            </div>
          </div>        
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de organización</label>    
          <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center ps-3 bg-gray-50">
                      <input id="horizontal-list-radio-license" type="radio" value="Publica" name="list-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" 
                        onChange={handleInputChange('organizationType')}
                        checked={formValues.organizationType === 'Publica'}
                      />
                      <label htmlFor="horizontal-list-radio-license" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Pública</label>
                  </div>
              </li>
              <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center ps-3 bg-gray-50">
                      <input id="horizontal-list-radio-military" type="radio" value="Privada" name="list-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" 
                        onChange={handleInputChange('organizationType')}
                        checked={formValues.organizationType === 'Privada'}
                      />
                      <label htmlFor="horizontal-list-radio-military" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Privada</label>
                  </div>
              </li>
              <li className="w-full dark:border-gray-600">
                  <div className="flex items-center ps-3 bg-gray-50">
                      <input id="horizontal-list-radio-passport" 
                        type="radio" 
                        value="Otra" 
                        name="list-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" 
                        onChange={handleInputChange('organizationType')}
                        checked={formValues.organizationType === 'Otra'}
                      />
                      <label htmlFor="horizontal-list-radio-passport" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Otra</label>
                  </div>
              </li>
          </ul>
          <label className="inline-flex items-center my-5 cursor-pointer">
            <input 
              type="checkbox"
              value={formValues.active}
              className="sr-only peer" 
              checked={formValues.active} 
              onChange={(e) => setFormValues((prevValues) => ({
                ...prevValues,
                active: e.target.checked,
              }))}
            />
            <div className={`relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary`} />
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Vigente</span>
          </label>

        </form>        
        <div className="text-center">
          <Button variant="contained" sx={{ marginTop: 2 }} onClick={handleSave}>
            Guardar
          </Button>
        </div>

        {modalOpen && (
          <Modal
            updateAvatar={updateAvatar}
            closeModal={() => setModalOpen(false)}
          />
        )}
      </div>
    </>
  )
}