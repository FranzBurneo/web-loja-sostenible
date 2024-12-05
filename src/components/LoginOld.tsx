import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './css/Login.css'
import worldImage from '../images/world.png';
import { Box, Button, Container, TextField, ThemeProvider, Typography, useTheme } from "@mui/material";
import axios from "axios";

interface UserData {
    userInfo: {
        usr_login: string;
        usr_password: string;
        usr_nombre: string;
        usr_primer_apellido: string;
        usr_segundo_apellido: string;
        usr_vigencia: boolean;
    };
}

interface LoginFormState {
    username: string;
    password: string;
}

export const Login2 = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<UserData["userInfo"]>({
        usr_login: "",
        usr_password: "",
        usr_nombre: "",
        usr_primer_apellido: "",
        usr_segundo_apellido: "",
        usr_vigencia: false,
    });
    const [formValues, setFormValues] = useState<UserData['userInfo']>(userInfo);
    const [error, setError] = useState('')
    const [esRegistro, setEsRegistro] = useState(false)

    const handleResetClick = () => {
        navigate("/reset"); // Reemplaza "/reset" por tu ruta de reseteo de contraseña real
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormValues((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // Aquí puedes agregar la lógica para enviar los datos del formulario al servidor
        const NombreMetodo = esRegistro ? 'add_user' : 'login';
        const response = await axios.post(
            'https://localhost:7128/api/wsUsuarios/' + NombreMetodo,
            {
                usr_id: 0,
                usr_login: formValues.usr_login,
                usr_password: formValues.usr_password,
                usr_nombre: formValues.usr_nombre,
                usr_primer_apellido: formValues.usr_primer_apellido,
                usr_segundo_apellido: formValues.usr_segundo_apellido,
                usr_vigencia: formValues.usr_vigencia,
            }
        );
        console.log('Form data:', formValues);
    };

    return (
        <div>
            <div className="Login">
                <div className='LeftSide'>
                    <img src={worldImage} alt="World" />
                    <div className='PageName'>
                        <p >LOJA SOSTENIBLE</p>
                    </div>
                </div>
                <div className='RightSide'>
                    <ThemeProvider theme={theme}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '80vh',
                            }}
                        >
                            <Container
                                maxWidth="sm"
                                sx={{
                                    border: `1px solid ${theme.palette.primary.main}`,
                                    padding: '1rem',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Ajusta los valores según tu preferencia
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        mt: 3,
                                        mb: 3,
                                    }}
                                >
                                    <Typography variant="h4" component="h1" gutterBottom>
                                        {
                                            esRegistro ? 'Registro de usuarios' : 'Inicio de sesión'
                                        }
                                    </Typography>
                                        <Box
                                            component="form"
                                            onSubmit={handleSubmit}
                                            sx={{
                                                '& .MuiTextField-root': {
                                                    m: 2,
                                                    width: '35ch',
                                                    '& fieldset': {
                                                        borderColor: theme.palette.primary.main,
                                                        
                                                    },
                                                },
                                            }}
                                        >
                                            <TextField
                                                required
                                                name="usr_login"
                                                label="Usuario"
                                                value={formValues.usr_login}
                                                onChange={handleInputChange}
                                            />
                                            <TextField
                                                required
                                                name="usr_password"
                                                label="Contraseña"
                                                type="password"
                                                value={formValues.usr_password}
                                                onChange={handleInputChange}
                                            />
                                            {
                                                esRegistro ?
                                                    <>
                                                        <TextField
                                                            required
                                                            name="usr_nombre"
                                                            label="Nombres"
                                                            value={formValues.usr_nombre}
                                                            onChange={handleInputChange}
                                                        />
                                                        <TextField
                                                            required
                                                            name="usr_primer_apellido"
                                                            label="Primer apellido"
                                                            value={formValues.usr_primer_apellido}
                                                            onChange={handleInputChange}
                                                        />
                                                        <TextField
                                                            required
                                                            name="usr_segundo_apellido"
                                                            label="Segundo apellido"
                                                            value={formValues.usr_segundo_apellido}
                                                            onChange={handleInputChange}
                                                        />
                                                    </>
                                                    :
                                                    null
                                            }
                                            <Button type="submit" variant="contained" size="large">
                                                Iniciar sesión
                                            </Button>
                                            <Button
                                                variant="text"
                                                color="primary"
                                                onClick={() => { console.log(!esRegistro); setEsRegistro(!esRegistro) }}
                                                sx={{marginTop: 2}}
                                            >
                                                {
                                                    esRegistro ? '¿Ya tienes cuenta? Iniciar sesión' : '¿No tienes cuenta? Crear una'
                                                }
                                            </Button>
                                        </Box>
                                </Box>
                            </Container>
                        </Box>
                    </ThemeProvider>
                </div>
            </div>
        </div >


    )
}