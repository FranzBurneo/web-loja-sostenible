import './css/landingObj.css';
import { useState, useEffect } from 'react';
import { Container , Grid, Card, CardMedia } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const LandingObjetives = () => {
    const { keyWord } = useParams();
    const [objetives, setObjetives] = useState([]);
    const [objetiveWithKeyword, setObjetiveWithKeyword] = useState(null);

    // Lógica para obtener los ODS desde la API
    const fetchOdsData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_NODE_API}ods`);  // Reemplaza con la URL de tu API
            const odsData = response.data.ods;
            setObjetives(odsData);

            // Filtrar el objetivo que coincida con el keyWord actual de la URL
            const matchedObjetive = odsData.find((objetive) => objetive.route === keyWord);
            setObjetiveWithKeyword(matchedObjetive);
        } catch (error) {
            console.error('Error al obtener los ODS:', error);
        }
    };

    useEffect(() => {
        fetchOdsData();
    }, [keyWord]);

    return(
        <Container className="landing-container mt-12">
            <main className="primary-container">
                {objetiveWithKeyword ? (
                    <>
                        <h1 className="obj_title text-3xl font-medium my-5" style={{ color: `#${objetiveWithKeyword?.color}` }}>
                            | {objetiveWithKeyword?.title}
                        </h1>
                        <h1 className='text-xl opacity-80'>{objetiveWithKeyword?.description}</h1>
                        <div>
                            {objetiveWithKeyword?.cardImage && (
                                <img 
                                    src={objetiveWithKeyword.cardImage} 
                                    alt={objetiveWithKeyword.title} 
                                    className='w-64 h-64 my-5 mr-10 float-right object-cover border-4 rounded-2xl' 
                                    style={{ borderColor: `#${objetiveWithKeyword?.color}` }} 
                                />
                            )}
                            <p className="large_description my-8">{objetiveWithKeyword?.large_description}</p>
                        </div>
                    </>
                ) : (
                    <p>No se encontró el ODS seleccionado.</p>
                )}
            </main>
            <aside className="aside">
                <div className="title-sidebard">
                    <h4 className="title-h4 text-lg font-semibold">Objetivos de desarrollo sostenible</h4>
                </div>
                <div className="objs">
                    <Grid container spacing={3} columns={{ xs: 4, sm: 8, lg: 8 }} >
                        {objetives.map((element, index) => (
                            <Grid item xs={4} sm={4} lg={4} key={index}>
                                <Card>
                                    <CardMedia 
                                        sx={{ width: '100%', height: '100%' }}
                                        component="img"
                                        image={element.logoImage}
                                        alt={element.title}
                                    />
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </div>
            </aside>
        </Container>
    );
}

export default LandingObjetives;
