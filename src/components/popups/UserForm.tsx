import React from 'react';
import { AlertColor, Box, Button, ButtonGroup, Checkbox, FormControlLabel, FormGroup, InputLabel, TextField, Typography } from "@mui/material";
import axios from "axios";
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import Autocomplete from '@mui/material/Autocomplete';
import { jwtDecode } from 'jwt-decode';

type AlertInfo = {
  alertOpen: boolean;
  message: string;
  alertType: AlertColor;
};

interface UserData {
  userInfo: {
    id: string;
    userId: string;
    email: string;
    firstname: string;
    lastname: string;
    rol: string[];
    active: boolean;
    organization: string;
  };
  setOpen?: Dispatch<SetStateAction<boolean>>;
  setAlertInfo: Dispatch<SetStateAction<AlertInfo>>;
}

interface OrganizationsData {
  id: string;
  name: string;
  description: string;
  location: string;
  contactNumber: string;
  active: boolean;
  avatarImage: string;
}

interface MyJwtPayload {
  rol: string[];
  profileImage: string;
  organization: string;
}

const rolesList: string[] = ['admin', 'moderator', 'user'];

function UserForm(props: UserData) {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json',
    }
  }
  const { userInfo, setOpen, setAlertInfo } = props;
  const [formValues, setFormValues] = useState<UserData['userInfo']>({
    ...userInfo,
    // vigencia: true,
  });
  const [password, setPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(props.userInfo.rol ? [...props.userInfo.rol] : []);
  const [organizations, setOrganizations] = useState<OrganizationsData[]>();
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationsData | null>(null);
  const decodedToken = token ? jwtDecode<MyJwtPayload>(token) : null;
  const [enableSelectOrganization, setEnableSelectOrganization] = useState(false);

  const updateFormValues = (newUserData: UserData) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      ...newUserData,
      rol: newUserData.userInfo.rol || [], // Asegurarse de que 'rol' sea un array
    }));
  };

  useEffect(() => {
    updateFormValues(props);
    setSelectedRoles(props.userInfo.rol || []);
    loadOrganizations();
  }, [props.userInfo.rol]);

  async function loadOrganizations() {
    try {
      const response = await axios.get(
        process.env.REACT_APP_NODE_API + 'organizations/', config
      );
      const data = response.data;
      const tableData = data.organizations;
      setOrganizations(tableData);
      console.log('props: ', props);
      // Establecer la organización seleccionada si hay una en userInfo
      if (userInfo.organization) {
        // @ts-ignore
        const selectedOrg = tableData.find(org => org.id === userInfo.organization);
        if (selectedOrg) {
          console.log('selectedOrg: ', selectedOrg);
          setSelectedOrganization(selectedOrg);
        }
      } else {
        if (decodedToken && decodedToken.rol.includes("admin") && decodedToken.organization === undefined) {
          setEnableSelectOrganization(true)
        } else {
          if (decodedToken) {
            // @ts-ignore
            const selectedOrg = tableData.find(org => org.id === decodedToken.organization);
            console.log('decodedToken.organization: ', decodedToken.organization, 'selectedOrg: ', selectedOrg);
            if (selectedOrg) {
              // Establecer la organización encontrada como la opción seleccionada
              setSelectedOrganization(selectedOrg);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleInputChange = (key: keyof UserData['userInfo']) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [key]: e.target.value,
    }));
  };

  const handleSaveRoles = (updateRoles: (prevRoles: string[]) => string[]) => {
    setSelectedRoles(prevRoles => updateRoles(prevRoles));
  };

  const handleSave = async () => {
    try {
      // Filtrar los roles vacíos
      const rolesToSave = selectedRoles.filter(role => role.trim() !== '');

      const url = process.env.REACT_APP_NODE_API + 'users/';
      const req = {
        firstname: formValues.firstname,
        lastname: formValues.lastname,
        email: formValues.email,
        password,
        rol: rolesToSave, // Usar los roles filtrados
        active: formValues.active,
        organization: selectedOrganization?.id,
      };

      let response;
      if (userInfo.userId === '') {
        response = await axios.post(url, req, config);
      } else {
        response = await axios.put(url + userInfo.userId, req, config);
      }

      // Verificación más específica
      if (response && response.data && typeof response.data === 'object') {
        const data = response.data as AlertInfo;
        setAlertInfo(() => ({
          alertOpen: true,
          message: data.message || 'Error',
          alertType: 'success',
        }));
      }

      // if (setOpen) setOpen(false);
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

      // if (setOpen) setOpen(false);
    }
  };

  const handleChange = (event: React.SyntheticEvent<Element, Event>, value: OrganizationsData | null) => {
    if (value) {
      // Establecer el ID de la organización como el valor seleccionado
      setSelectedOrganization(value);
      setFormValues((prevValues) => ({
        ...prevValues,
        organization: value.id,
      }));
    }
  };

  return (
    <Box
      component="form"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 3,
        backgroundColor: '#f9f9f9',
        borderRadius: 2,
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      }}
      noValidate
      autoComplete="off"
    >
      <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#00796B' }}>
        {userInfo.userId ? 'Editar usuario' : 'Agregar usuario'}
      </Typography>

      <TextField
        variant="outlined"
        margin='none'
        fullWidth
        id="email"
        label="Correo electrónico"
        defaultValue={userInfo.email}
        disabled={userInfo.userId !== ''}
        InputLabelProps={{
          style: { color: '#00796B' }
        }}
      />

      {!userInfo.userId && (
        <TextField
          variant="outlined"
          margin="none"
          required
          fullWidth
          name="password"
          label="Contraseña"
          type="password"
          id="password"
          onChange={(e) =>
            setPassword(e.target.value)
          }
          disabled={userInfo.userId !== ''}
          InputLabelProps={{
            style: { color: '#00796B' }
          }}
        />
      )}

      <TextField
        variant="outlined"
        margin="none"
        required
        fullWidth
        name="lastname"
        label="Apellidos"
        id="lastname"
        value={formValues.lastname}
        onChange={handleInputChange('lastname')}
        InputLabelProps={{
          style: { color: '#00796B' }
        }}
      />

      <TextField
        variant="outlined"
        margin="none"
        required
        fullWidth
        name="firstname"
        label="Nombres"
        id="firstname"
        defaultValue={formValues.firstname}
        onChange={handleInputChange('firstname')}
        InputLabelProps={{
          style: { color: '#00796B' }
        }}
      />

      <Autocomplete
        options={organizations || []}
        getOptionLabel={(option) => option.name}
        renderOption={(props, option) => (
          <li {...props}>
            <img src={option.avatarImage} alt={option.name} style={{ width: '20px', marginRight: '10px' }} />
            {option.name}
          </li>
        )}
        disabled={!enableSelectOrganization}
        onChange={handleChange}
        renderInput={(params) => <TextField {...params} label="Organización" variant="outlined" />}
        value={selectedOrganization} 
      />

      <Typography variant="h6" component="p" sx={{ color: '#00796B', marginTop: 0 }}>
        Roles:
      </Typography>
        <FormGroup row style={{ width: '100%', justifyContent: 'center' }}>
          {rolesList.map((role) => (
            <FormControlLabel
              key={role}
              control={
                <Checkbox
                  checked={selectedRoles.includes(role)}
                  onChange={() =>
                    handleSaveRoles((prevRoles) => {
                      if (prevRoles.includes(role)) {
                        return prevRoles.filter((r) => r !== role);
                      } else {
                        return [...prevRoles, role];
                      }
                    })
                  }
                />
              }
              label={role.charAt(0).toUpperCase() + role.slice(1)}
              style={{ margin: 'auto 5px' }}
            />
          ))}
        </FormGroup>

      <FormControlLabel
        control={<Checkbox defaultChecked />}
        label="Vigencia del usuario"
      />

      <Button
        variant="contained"
        fullWidth
        sx={{
          backgroundColor: '#00796B',
          color: '#fff',
          padding: '12px 0',
          marginTop: 2,
          '&:hover': {
            backgroundColor: '#004D40',
          },
        }}
        onClick={handleSave}
      >
        {userInfo.userId ? 'Guardar' : 'Registrar'}
      </Button>
    </Box>
  );
}

export default UserForm;
