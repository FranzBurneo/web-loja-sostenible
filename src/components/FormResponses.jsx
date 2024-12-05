import { useEffect, useState } from "react";
import { ThemeProvider, useTheme, Container, Modal, Box, Typography, Avatar } from '@mui/material';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export const FormResponses = () => {
    const theme = useTheme();
    const { formId } = useParams();
    const token = localStorage.getItem('token');
    const config = {
        headers: {
            'x-access-token': token,
            'Content-Type': 'application/json',
        }
    };
    const [summary, setSummary] = useState(null);
    const [countResponses, setCountResponses] = useState(0);
    const [verifiedResponses, setverifiedResponses] = useState(0);
    const [formdata, setFormData] = useState(null);
    const [open, setOpen] = useState(false);
    const [modalContent, setModalContent] = useState([]);
    const size = { width: 350, height: 350 };

    const handleOpen = (content) => setModalContent(content);
    const handleClose = () => setOpen(false);

    useEffect(() => { getAnswers(); }, []);

    const getAnswers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_NODE_API}answerForms/${formId}`, config);
            const data = response.data;
            setFormData(data);
            setSummary(data.summary.summary);
            setCountResponses(data.summary.totalResponses);
            setverifiedResponses(data.summary.verifiedResponses);
        } catch (error) {
            console.error(error);
        }
    };

    const generateIdentifiers = (answers) => {
        const identifiers = {};
        answers.forEach((answer, index) => {
            identifiers[answer.answer] = String.fromCharCode(65 + index);
        });
        return identifiers;
    };

    return (
        <>
            <ThemeProvider theme={theme}>
                <Container sx={{
                    backgroundColor: "#00796B",
                    borderRadius: '8px',
                    padding: "1.5rem",
                    color: "#ffffff",
                    textAlign: 'center',
                    marginBottom: '1rem',
                    marginTop: "1rem",
                }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {`${formdata?.formTitle || 'Cargando...'}`}
                    </Typography>
                    <Typography variant="body1">
                        {`${formdata?.formDescription || 'Cargando...'}`}
                    </Typography>
                </Container>

                {summary ? (
                    summary.map((row, index) => {
                        const identifiers = generateIdentifiers(row.answers.answers);
                        return (
                            <Container key={index} sx={{ marginBottom: '2rem', backgroundColor: "#fff", borderRadius: '8px', padding: '1.5rem' }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {row.question}
                                </Typography>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                                            Todas las respuestas
                                        </Typography>
                                        <PieChart
                                            series={[{
                                                data: row.answers.answers.map(answer => ({
                                                    value: answer.count,
                                                    label: identifiers[answer.answer] || 'Sin respuesta'
                                                }))
                                            }]}
                                            {...size}
                                            sx={{
                                                [`& .${pieArcLabelClasses.root}`]: {
                                                    fill: '#ffffff',
                                                    fontWeight: 'bold',
                                                    fontSize: 10,
                                                },
                                            }}
                                        />
                                        <ul>
                                            {row.answers.answers.slice(0, 6).map(answer => (
                                                <li key={answer.answer}>
                                                    <strong>{identifiers[answer.answer]}:</strong> {answer.answer} ({answer.count} respuestas)
                                                </li>
                                            ))}
                                        </ul>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                                            Respuestas verificadas
                                        </Typography>
                                        <PieChart
                                            series={[{
                                                data: row.answers.answers.map(answer => ({
                                                    value: answer.verifiedCount,
                                                    label: identifiers[answer.answer] || 'Sin respuesta'
                                                }))
                                            }]}
                                            {...size}
                                            sx={{
                                                [`& .${pieArcLabelClasses.root}`]: {
                                                    fill: '#ffffff',
                                                    fontWeight: 'bold',
                                                    fontSize: 10,
                                                },
                                            }}
                                        />
                                        <ul>
                                            {row.answers.answers.slice(0, 6).map(answer => (
                                                <li key={answer.answer}>
                                                    <strong>{identifiers[answer.answer]}:</strong> {answer.answer} ({answer.verifiedCount} verificadas)
                                                </li>
                                            ))}
                                        </ul>
                                    </Box>
                                </Box>
                            </Container>
                        );
                    })
                ) : (
                    <Typography align="center" sx={{ marginY: '2rem' }}>Cargando...</Typography>
                )}

                <Modal open={open} onClose={handleClose}>
                    <Box sx={{ padding: 4, backgroundColor: '#fff', borderRadius: 4 }}>
                        <Typography variant="h6">Todas las respuestas</Typography>
                        <ul>
                            {modalContent.map(answer => (
                                <li key={answer.answer}>
                                    <strong>{generateIdentifiers(modalContent)[answer.answer]}:</strong> {answer.answer} ({answer.count} respuestas)
                                </li>
                            ))}
                        </ul>
                    </Box>
                </Modal>
            </ThemeProvider>
        </>
    );
};
