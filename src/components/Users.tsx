import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, CircularProgress, DialogActions, Alert, AlertColor, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UserForm from './popups/UserForm';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';

type UserData = {
  id: string,
  userId: string,
  email: string,
  firstname: string,
  lastname: string,
  rol: string[],
  active: boolean,
  organization: string,
  verifiedOrganization: boolean,
};

interface MyJwtPayload {
  rol: string[];
  profileImage: string;
  organization: string;
}


function Users() {
  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode<MyJwtPayload>(token) : null;
  const config = {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json',
    }
  }
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<UserData[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Agregar usuarios");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSuccessOpen, setAlertSuccessOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    id: '',
    userId: '',
    email: '',
    firstname: '',
    lastname: '',
    rol: ['user'],
    active: true,
    organization: '',
  });

  const [alertInfo, setAlertInfo] = useState({
    alertOpen: false,
    message: '',
    alertType: 'success' as AlertColor,
  })
  //estilizar celdas
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: '#00796B',
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));


  useEffect(() => {
    fetchData();
  }, [open, confirmDialogOpen]);

  async function fetchData() {
    try {
      const response = await axios.get(
        process.env.REACT_APP_NODE_API + 'users/', config
      );
      const data = response.data;
      const tableData = data.users;
      setRows(tableData);
      setLoading(false); // Marcar que los datos han cargado
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const filteredRows = rows?.filter((row) => {
    // Filtrar por nombres y apellidos
    const fullName = `${row.firstname} ${row.lastname}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || row.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAgregar = () => {
    setTitle("Agregar usuarios");
    setOpen(true);
    setUserInfo({
      id: '',
      userId: '',
      email: '',
      firstname: '',
      lastname: '',
      rol: [''],
      active: true,
      organization: '',
    });
  }

  const handleEditar = (row: UserData) => {
    setUserInfo(
      {
        id: row.id,
        userId: row.userId,
        email: row.email,
        firstname: row.firstname,
        lastname: row.lastname,
        rol: row.rol,
        active: row.active,
        organization: row.organization,
      }
    );
    setTitle("Editar usuarios");
    setOpen(true);
  }

  const handleEliminar = (userId: string) => {
    setUserIdToDelete(userId);
    setConfirmDialogOpen(true);
  }

  const handleEliminarConfirmado = async (userId: string) => {
    try {
      // Realizar la eliminación del usuario aquí
      const response = await axios.delete(process.env.REACT_APP_NODE_API + 'users/' + userId, config);
      console.log(response.data.message);
      fetchData();
    } catch (error: any) {
      // Manejar el error, por ejemplo, mostrando un mensaje de error al usuario
      console.error('Error al eliminar el usuario:', error);

      if (error.response && error.response.status === 500) {
        // Manejar el estado 500 específico si es necesario
        console.error('Error interno del servidor (500)');
      } else {
        // Manejar otros errores
        console.error('Error desconocido');
      }
    }
  };

  const handleDialogClose = () => {
    fetchData();
    setOpen(false);
  };

  const handleSaveOrgChanges = async (userId: string, verifiedOrganization: boolean) => {
    try {
      const req = {
        verifiedOrganization,
        onlyOrgChanges: true,
      };
      const response = await axios.put(
        `${process.env.REACT_APP_NODE_API}users/${userId}`,
        req,
        config
      );
      if (response.status === 200) {
        // Muestra el mensaje de éxito
        Swal.fire({
          title: 'Actualizado',
          text: response.data.message || 'Acción realizada con éxito',
          icon: 'success',
          confirmButtonColor: "#00796B",
          confirmButtonText: 'Ok'
        }).then(() => {
          fetchData();
        });
      } else {
        console.log('La solicitud no se completó con éxito');
      }
    } catch (error) {
      console.log('handleSaveOrgChanges: ', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Ocurrió un error, intente nuevamente más tarde",
        confirmButtonColor: "#00796B",
      });
    }

  }
  return (
    <div className="p-8 bg-gray-100 min-h-screen"> {/* Ajuste de padding y fondo */}
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1" className="text-3xl font-bold text-primary">
          Lista de usuarios
        </Typography>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#00796B', color: '#ffffff', '&:hover': { backgroundColor: '#004D40' } }}
          onClick={handleAgregar}
          startIcon={<AddIcon />}>
          Agregar
        </Button>
      </div>

      <div className="mb-4 flex justify-end">
        <div className="relative w-96">
          <input
            type="search"
            id="search"
            className="block w-full p-4 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            placeholder="Buscar usuario"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a4 4 0 10-8 0 4 4 0 008 0zM21 21l-5.636-5.636" />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper} className="shadow-lg rounded-lg">
          <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Nombres</StyledTableCell>
                <StyledTableCell>Apellidos</StyledTableCell>
                <StyledTableCell>Email</StyledTableCell>
                <StyledTableCell>Rol</StyledTableCell>
                <StyledTableCell>Vigencia</StyledTableCell>
                <StyledTableCell>Acciones</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.userId} hover className="bg-white hover:bg-gray-50 transition-colors">
                  <TableCell component="th" scope="row">
                    {row.firstname}
                  </TableCell>
                  <TableCell>{row.lastname}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.rol ? row.rol.join(', ') : ''}</TableCell>
                  <TableCell>{row.active ? 'Vigente' : 'Bloqueado'}</TableCell>
                  <TableCell>
                    {row.verifiedOrganization || row.verifiedOrganization === undefined && decodedToken && decodedToken.rol.includes("admin") && decodedToken.organization === undefined ? (
                      <>
                        <Tooltip title="Editar usuario">
                          <IconButton onClick={() => handleEditar(row)} sx={{ color: '#00796B' }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar usuario">
                          <IconButton onClick={() => handleEliminar(row.userId)} sx={{ color: '#00796B' }}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (row.verifiedOrganization || row.verifiedOrganization === undefined && decodedToken && decodedToken.rol.includes("admin")) ? (
                      <>
                        <Tooltip title="Editar usuario">
                          <IconButton onClick={() => handleEditar(row)} sx={{ color: '#00796B' }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Dar de baja usuario como parte de la organización">
                          <IconButton onClick={() => handleSaveOrgChanges(row.userId, false)} sx={{ color: '#F14D25' }}>
                            <ThumbDownAltIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip title="Aceptar usuario como parte de la organización">
                          <IconButton onClick={() => handleSaveOrgChanges(row.userId, true)} sx={{ color: '#21BD42' }}>
                            <ThumbUpAltIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Dar de baja usuario como parte de la organización">
                          <IconButton onClick={() => handleSaveOrgChanges(row.userId, false)} sx={{ color: '#F14D25' }}>
                            <ThumbDownAltIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar este usuario?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setConfirmDialogOpen(false);
              handleEliminarConfirmado(userIdToDelete);
            }}
            color="primary"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Diálogo para agregar/editar usuarios */}
      <Dialog
        open={open}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            overflow: 'visible',
          },
        }}
      >
        <DialogContent sx={{ paddingTop: 0 }}>
          <UserForm
            userInfo={userInfo}
            setOpen={setOpen}
            setAlertInfo={setAlertInfo}
          />
        </DialogContent>
      </Dialog>
      {/* Alerta de mensajes */}
      {alertInfo.alertOpen && (
        <Alert
          variant="filled"
          severity={alertInfo.alertType}
          onClose={() => setAlertInfo((prev) => ({ ...prev, alertOpen: false }))}
        >
          {alertInfo.message}
        </Alert>
      )}
    </div>
  );

}

export default Users;
