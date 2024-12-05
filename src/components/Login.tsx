import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './css/Login.css';
import worldImage from '../images/world.png';
import { Autocomplete, Box, Button, Checkbox, Container, FormControlLabel, TextField, ThemeProvider, Typography, useTheme } from "@mui/material";
import axios from "axios";
import { signInWithGoogle } from "../firebaseConfig";

const CryptoJS = require("crypto-js");

interface UserData {
    userInfo: {
        password: string;
        email: string;
        firstname: string;
        lastname: string;
        organization: string;
    };
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

export const Login = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<UserData["userInfo"]>({
        password: "",
        email: "",
        firstname: "",
        lastname: "",
        organization: "",
    });
    const [formValues, setFormValues] = useState<UserData['userInfo']>(userInfo);
    const [error, setError] = useState('')
    const [esRegistro, setEsRegistro] = useState(false)
    const [enableOrgSelect, setEnableOrgSelect] = useState(false);
    const [organizations, setOrganizations] = useState<OrganizationsData[]>();
    const [selectedOrganization, setSelectedOrganization] = useState<OrganizationsData | null>(null);

    useEffect(() => {
        loadOrganizations();
    }, []);

    async function loadOrganizations() {
        try {
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

    const handleChange = (event: React.SyntheticEvent<Element, Event>, value: OrganizationsData | null) => {
        if (value) {
            setSelectedOrganization(value);
            setFormValues((prevValues) => ({
                ...prevValues,
                organization: value.id,
            }));
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormValues((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const validarSeguridadContrasena = (password: string) => {
        setError('');
        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return false;
        }
        if (!/[!@#$%^&*().]/.test(password)) {
            setError('La contraseña debe tener al menos un caracter especial.');
            return false;
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
            setError('La contraseña debe tener al menos una letra mayúscula y una minúscula.');
            return false;
        }
        if (!/\d/.test(password)) {
            setError('La contraseña debe tener al menos un número.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const NombreMetodo = esRegistro ? 'signup' : 'signin';

        if (esRegistro && !validarSeguridadContrasena(formValues.password)) {
            return;
        }

        try {
            const response = await axios.post(
                process.env.REACT_APP_NODE_API + 'auth/' + NombreMetodo,
                {
                    password: CryptoJS.AES.encrypt(formValues.password, process.env.REACT_APP_SECRET_KEY).toString(),
                    email: formValues.email,
                    firstname: formValues.firstname,
                    lastname: formValues.lastname,
                    organization: formValues.organization,
                }, {
                validateStatus: (status) => {
                    return status < 500;
                }
            });
            if (response.status >= 200 && response.status < 300) {
                localStorage.setItem('token', response.data.token);
                navigate('/publicaciones');
                window.location.reload();
            } else {
                alert(response.data.message);
                return;
            }
        } catch (error) {
            console.log('error: ', error);
            alert('Credenciales incorrectas');
        }
    };
    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithGoogle();
            const token = await result.user.getIdToken();
            const response = await axios.post(
                process.env.REACT_APP_NODE_API + 'auth/google',
                {
                    token
                }
            );
            if (response.status >= 200 && response.status < 300) {
                localStorage.setItem('token', response.data.token);
                navigate('/publicaciones');
                window.location.reload();
            }
        } catch (error) {
            console.error('Error al iniciar sesión con Google', error);
        }
    };
    return (
        <div className="full-screen"> {/* Clase añadida para pantalla completa */}
            <div className="flex w-full h-full items-center justify-center">
                <div className="LeftSide hidden lg:flex flex-1 items-center justify-center">
                    <img src={worldImage} alt="World" className="w-72 mb-6" />
                </div>
                <div className="RightSide flex items-center justify-center">
                    <ThemeProvider theme={theme}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                            }}
                        >
                            <Container
                                maxWidth="xs"
                                sx={{
                                    padding: '2rem',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                                    textAlign: 'center',
                                    mt: 4, // Ajuste de margen superior
                                }}
                            >
                                <Typography variant="h5" component="h1" gutterBottom sx={{ color: '#00796B', fontWeight: 'bold', marginBottom: '1rem' }}>
                                    {esRegistro ? 'Registro de usuarios' : 'Inicio de sesión'}
                                </Typography>

                                <Button
                                    onClick={handleGoogleSignIn}
                                    fullWidth
                                    variant="outlined"
                                    sx={{
                                        borderColor: '#DD4B39',
                                        color: '#DD4B39',
                                        marginBottom: '1rem',
                                        textTransform: 'none',
                                    }}
                                    startIcon={<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" className="w-6 h-6" />}
                                >
                                    Continuar con Google
                                </Button>

                                <Typography variant="body2" gutterBottom>O</Typography>

                                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                                    <TextField
                                        variant="outlined"
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Correo electrónico"
                                        name="email"
                                        value={formValues.email}
                                        onChange={handleInputChange}
                                        InputLabelProps={{
                                            style: { color: '#00796B' }
                                        }}
                                    />
                                    <TextField
                                        variant="outlined"
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="password"
                                        label="Contraseña"
                                        type="password"
                                        id="password"
                                        value={formValues.password}
                                        onChange={handleInputChange}
                                        InputLabelProps={{
                                            style: { color: '#00796B' }
                                        }}
                                    />
                                    {/* Condicional para registro */}
                                    {esRegistro && (
                                        <>
                                            <TextField
                                                variant="outlined"
                                                margin="normal"
                                                required
                                                fullWidth
                                                name="firstname"
                                                label="Nombres"
                                                id="firstname"
                                                value={formValues.firstname}
                                                onChange={handleInputChange}
                                            />
                                            <TextField
                                                variant="outlined"
                                                margin="normal"
                                                required
                                                fullWidth
                                                name="lastname"
                                                label="Apellidos"
                                                id="lastname"
                                                value={formValues.lastname}
                                                onChange={handleInputChange}
                                            />
                                            <div>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={enableOrgSelect}
                                                            onChange={() => setEnableOrgSelect(!enableOrgSelect)}
                                                            sx={{
                                                                color: '#00796B',
                                                                '&.Mui-checked': {
                                                                    color: '#00796B',
                                                                },
                                                            }}
                                                        />
                                                    }
                                                    label="Solicitud de acceso a organización"
                                                    sx={{
                                                        color: '#00796B',
                                                    }}
                                                />
                                                {enableOrgSelect && (
                                                    <Autocomplete
                                                        options={organizations || []}
                                                        getOptionLabel={(option) => option.name}
                                                        renderOption={(props, option) => (
                                                            <li {...props}>
                                                                <img src={option.avatarImage} alt={option.name} style={{ width: '20px', marginRight: '10px' }} />
                                                                {option.name}
                                                            </li>
                                                        )}
                                                        onChange={handleChange}
                                                        renderInput={(params) => <TextField {...params} label="Organización" />}
                                                        value={selectedOrganization}
                                                    />
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {/* Mostrar errores */}
                                    {error && (
                                        <Typography variant="body2" color="error" align="center" sx={{ backgroundColor: '#FFCDD2', padding: '8px', borderRadius: '4px', marginBottom: '1rem' }}>
                                            {error}
                                        </Typography>
                                    )}
                                    {/* Botón de envío */}
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{
                                            mt: 3,
                                            mb: 2,
                                            backgroundColor: '#00796B',
                                            color: '#ffffff',
                                            '&:hover': {
                                                backgroundColor: '#004D40',
                                            },
                                            padding: '10px',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {esRegistro ? 'Registrar' : 'Iniciar Sesión'}
                                    </Button>
                                    {/* Enlace para cambiar entre registro e inicio de sesión */}
                                    <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                                        {esRegistro ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
                                        <Button variant="text" onClick={() => setEsRegistro(!esRegistro)} sx={{ textTransform: 'none', fontWeight: 'bold', color: '#00796B' }}>
                                            {esRegistro ? 'Iniciar Sesión' : 'Crear una'}
                                        </Button>
                                    </Typography>
                                </Box>
                            </Container>
                        </Box>
                    </ThemeProvider>
                </div>
            </div>
        </div>
    );
};
