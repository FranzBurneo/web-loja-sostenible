import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogContent, TextField, Typography } from '@mui/material';
import axios from 'axios';

const OdsForm = ({ ods, onClose, fetchOds }) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
      }
    }
    const [formValues, setFormValues] = useState({
        name: '',
        title: '',
        description: '',
        number: '',  // Nuevo campo obligatorio
        cardImage: '',
        logoImage: '',
        color: '',
    });

    const [errorMessages, setErrorMessages] = useState({}); // Para almacenar mensajes de error

    useEffect(() => {
        if (ods) {
            setFormValues({
                name: ods.name,
                title: ods.title,
                description: ods.description,
                number: ods.number,
                cardImage: ods.cardImage,
                logoImage: ods.logoImage,
                color: ods.color,
            });
        }
    }, [ods]);

    const handleChange = (e) => {
        setFormValues({
            ...formValues,
            [e.target.name]: e.target.value,
        });
    };

    // Validación del formulario
    const validateForm = () => {
        const errors = {};
        if (!formValues.name) errors.name = 'El nombre es obligatorio.';
        if (!formValues.title) errors.title = 'El título es obligatorio.';
        if (!formValues.description) errors.description = 'La descripción es obligatoria.';
        if (!formValues.number) errors.number = 'El número es obligatorio.';
        setErrorMessages(errors);

        // Retorna true si no hay errores
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar antes de enviar
        if (!validateForm()) {
            return;  // Si hay errores, no se envía el formulario
        }

        try {
            if (ods) {
                // Edit existing ODS
                await axios.put(`${process.env.REACT_APP_NODE_API}ods/${ods.id}`, formValues, config);
            } else {
                // Create new ODS
                await axios.post(`${process.env.REACT_APP_NODE_API}ods`, formValues, config);
            }
            fetchOds();
            onClose();
        } catch (error) {
            console.error('Error saving ODS:', error);
        }
    };

    return (
        <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogContent>
                <Typography variant="h6" gutterBottom>
                    {ods ? 'Actualizar ODS' : 'Crear ODS'}
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        name="name"
                        label="Nombre"
                        value={formValues.name}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        error={!!errorMessages.name}
                        helperText={errorMessages.name}
                    />
                    <TextField
                        name="title"
                        label="Título"
                        value={formValues.title}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        error={!!errorMessages.title}
                        helperText={errorMessages.title}
                    />
                    <TextField
                        name="description"
                        label="Descripción"
                        value={formValues.description}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        error={!!errorMessages.description}
                        helperText={errorMessages.description}
                    />
                    <TextField
                        name="number"
                        label="Número"
                        value={formValues.number}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        error={!!errorMessages.number}
                        helperText={errorMessages.number}
                    />
                    <TextField
                        name="cardImage"
                        label="URL de la imagen de la tarjeta"
                        value={formValues.cardImage}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        name="logoImage"
                        label="URL de la imagen del logo"
                        value={formValues.logoImage}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        name="color"
                        label="Color"
                        value={formValues.color}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
                        {ods ? 'Actualizar ODS' : 'Crear ODS'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default OdsForm;
