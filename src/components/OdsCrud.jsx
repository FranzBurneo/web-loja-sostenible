import React, { useState, useEffect } from 'react';
import { Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { styled } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import OdsForm from '../forms/OdsForm';

// Styled Components
const StyledTableCell = styled(TableCell)({
  fontSize: '15px',
  fontWeight: '400',
  padding: '14px 16px',
  borderBottom: 'none',
  color: '#333',
  textAlign: 'left',
});

const StyledTableRow = styled(TableRow)({
  backgroundColor: '#fff',
  '&:nth-of-type(odd)': {
    backgroundColor: '#f4f6f8',
  },
  '&:hover': {
    backgroundColor: '#eaeef3',
  },
});

const StyledButton = styled(Button)({
  backgroundColor: '#00796B',
  color: '#fff',
  borderRadius: '30px',
  padding: '12px 25px',
  fontSize: '14px',
  fontWeight: '500',
  marginBottom: '20px',
  '&:hover': {
    backgroundColor: '#0a9396',
  },
});

const HeaderCell = styled(TableCell)({
  fontWeight: 'bold',
  fontSize: '16px',
  backgroundColor: '#00796B',
  color: '#fff',
  padding: '14px 16px',
});

const OdsCrud = () => {
  const [odsData, setOdsData] = useState([]);
  const [selectedOds, setSelectedOds] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [odsToDelete, setOdsToDelete] = useState(null);
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json',
    }
  }

  // Fetch all ODS
  const fetchOds = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_NODE_API + 'ods');
      setOdsData(response.data.ods);
    } catch (error) {
      console.error('Error fetching ODS data:', error);
    }
  };

  // Delete ODS by id
  const deleteOds = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_NODE_API}ods/${odsToDelete}`, config);
      fetchOds(); // Refresh the list after deletion
      setOpenDialog(false); // Close the confirmation dialog
    } catch (error) {
      console.error('Error deleting ODS:', error);
    }
  };

  // Open form for editing or creating
  const handleEdit = (ods) => {
    setSelectedOds(ods);
    setOpenForm(true);
  };

  const handleCreate = () => {
    setSelectedOds(null);
    setOpenForm(true);
  };

  // Open confirmation dialog
  const handleDeleteClick = (id) => {
    setOdsToDelete(id);
    setOpenDialog(true); // Open the confirmation dialog
  };

  useEffect(() => {
    fetchOds();
  }, []);

  return (
    <div style={{ padding: '30px' }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Listado de ODS
      </Typography>
      <StyledButton onClick={handleCreate}>Crear ODS</StyledButton>

      <TableContainer component={Paper} sx={{ marginTop: 3, borderRadius: '20px', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <HeaderCell>Nombre</HeaderCell>
              <HeaderCell>Título</HeaderCell>
              <HeaderCell>Descripción</HeaderCell>
              <HeaderCell align="center">Acciones</HeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {odsData.map((ods) => (
              <StyledTableRow key={ods.id}>
                <StyledTableCell>{ods.name}</StyledTableCell>
                <StyledTableCell>{ods.title}</StyledTableCell>
                <StyledTableCell>{ods.description.length > 100 ? ods.description.substring(0, 100) + '...' : ods.description}</StyledTableCell>
                <StyledTableCell align="center">
                  <IconButton onClick={() => handleEdit(ods)} sx={{ color: '#005f73', marginRight: '10px' }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(ods.id)} sx={{ color: '#d32f2f' }}>
                    <DeleteIcon />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog for Deletion */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar eliminación"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas eliminar este ODS? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={deleteOds} color="secondary" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {openForm && <OdsForm ods={selectedOds} onClose={() => setOpenForm(false)} fetchOds={fetchOds} />}
    </div>
  );
};

export default OdsCrud;
