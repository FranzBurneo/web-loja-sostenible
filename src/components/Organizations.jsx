import { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Swal from 'sweetalert2';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { OrganizationForm } from './popups/OrganizationForm';

export const Organizations = () => {
    const token = localStorage.getItem('token');
    const config = {
        headers: {
            'x-access-token': token,
            'Content-Type': 'application/json',
        }
    }
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState([]);
    const [title, setTitle] = useState("Agregar organización");

    const [alertInfo, setAlertInfo] = useState({
        alertOpen: false,
        message: '',
        alertType: 'success',
    });
    const [orgInfo, setOrgInfo] = useState({
        id: '',
        name: '',
        description: '',
        location: '',
        contactNumber: '',
        active: true,
        organizationType: ''
    });

    // estilizar celdas
    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: '#00796B',
            color: theme.palette.common.white,
            fontWeight: 'bold',
            fontSize: 16,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        // Agregar sombra suave
        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '10px',
    }));

    useEffect(() => {
        fetchData();
    }, [open]);

    async function fetchData() {
        try {
            const response = await axios.get(process.env.REACT_APP_NODE_API + 'organizations/', config);
            const data = response.data.organizations;
            setRows(data);
            setLoading(false);

            if (data.length === 0) {
                Swal.fire({
                    title: "No se encontró ninguna organización",
                    confirmButtonColor: "#2e7d32", // Verde oscuro
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const filteredRows = rows.filter((row) => {
        const fullName = `${row.name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || row.description.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleDialogClose = () => {
        fetchData();
        setOpen(false);
    };

    const handleAdd = () => {
        setOrgInfo({
            id: '',
            name: '',
            description: '',
            location: '',
            contactNumber: '',
            active: true,
        });
        setTitle("Agregar organización");
        setOpen(true);
    }

    const handleUpdate = (row) => {
        setOrgInfo({
            id: row.id,
            name: row.name,
            description: row.description,
            location: row.location,
            contactNumber: row.contactNumber,
            active: row.active,
            organizationType: row.organizationType
        });
        setTitle("Actualizar organización");
        setOpen(true);
    }

    const handleDelete = (organizationId) => {
        Swal.fire({
            title: "¿Estás seguro de eliminar esta organización?",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            confirmButtonColor: "#d32f2f", // Rojo
            cancelButtonColor: "#424242"
        }).then((result) => {
            if (result.isConfirmed) {
                handleDeleteConfirmation(organizationId);
            }
        });
    }

    const handleDeleteConfirmation = async (organizationId) => {
        try {
            await axios.delete(process.env.REACT_APP_NODE_API + 'organizations/' + organizationId, config);
            setAlertInfo(() => ({
                alertOpen: true,
                message: 'La organización se eliminó correctamente',
                alertType: 'success',
            }));
            fetchData();
        } catch (error) {
            setAlertInfo(() => ({
                alertOpen: true,
                message: 'Ocurrió un error al eliminar la organización',
                alertType: 'error',
            }));
            console.error('Error:', error);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-4xl font-extrabold mb-4">
                Organizaciones
            </h2>
            <div className="flex justify-between items-center mb-4">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    sx={{ backgroundColor: '#00796B', borderRadius: '20px' }} // Turquesa
                >
                    Agregar
                </Button>
                <TextField
                    variant="outlined"
                    placeholder="Buscar organizaciones"
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ color: 'gray' }} />,
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: '300px', borderRadius: '20px' }}
                />
            </div>
            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: '20px' }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell></StyledTableCell>
                                <StyledTableCell>Nombre</StyledTableCell>
                                <StyledTableCell>Tipo</StyledTableCell>
                                <StyledTableCell>Descripción</StyledTableCell>
                                <StyledTableCell>Ubicación</StyledTableCell>
                                <StyledTableCell>Número de contacto</StyledTableCell>
                                <StyledTableCell>Estado</StyledTableCell>
                                <StyledTableCell>Editar</StyledTableCell>
                                <StyledTableCell>Eliminar</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRows.map((row) => (
                                <StyledTableRow key={row.id}>
                                    <TableCell>
                                        <img src={row.avatarImage} alt="avatar" style={{ maxHeight: '25px', borderRadius: '50%' }} />
                                    </TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.organizationType}</TableCell>
                                    <TableCell>{row.description.length > 50 ? row.description.slice(0, 50) + '...' : row.description}</TableCell>
                                    <TableCell>{row.location}</TableCell>
                                    <TableCell>{row.contactNumber}</TableCell>
                                    <TableCell>{row.active ? 'Vigente' : 'No vigente'}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleUpdate(row)} sx={{ color: '#00796B' }}>
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleDelete(row.id)} sx={{ color: '#D32F2F' }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <Dialog
                open={open}
                onClose={handleDialogClose}
                PaperProps={{
                    sx: {
                        minWidth: '700px',
                        borderRadius: '20px', // Bordes más redondeados
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Sombra suave para mayor profundidad
                        padding: '20px', // Espaciado interno para que no esté pegado a los bordes
                        backgroundColor: '#f5f5f5', // Fondo claro y limpio
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        textAlign: 'center', // Centramos el título
                        fontWeight: 'bold',
                        fontSize: '1.8rem', // Tamaño de fuente más grande para resaltar el título
                        color: '#00796B', // Color turquesa para coherencia
                    }}
                >
                    {title}
                </DialogTitle>
                <DialogContent
                    sx={{
                        padding: '20px',
                        backgroundColor: 'white', // Fondo blanco para el contenido
                        borderRadius: '10px',
                        boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.05)', // Sombra suave en el contenido
                    }}
                >
                    <OrganizationForm orgInfo={orgInfo} setOpen={setOpen} setAlertInfo={setAlertInfo} />
                </DialogContent>
            </Dialog>

            {alertInfo.alertOpen && (
                <Alert
                    variant="filled"
                    severity={alertInfo.alertType}
                    onClose={() => setAlertInfo((prev) => ({ ...prev, alertOpen: false }))}
                    sx={{ mt: 2 }}
                >
                    {alertInfo.message}
                </Alert>
            )}
        </div>
    );
};
