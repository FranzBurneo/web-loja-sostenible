import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/flip-card.css';

export const Objetives = () => {
  const [objetives, setObjetives] = useState([]); // Estado para almacenar los ODS

  // Función para obtener los ODS desde la API
  const fetchOds = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_NODE_API + 'ods'); // Suponiendo que 'ods' es el endpoint
      setObjetives(response.data.ods); // Almacenar los ODS obtenidos en el estado
    } catch (error) {
      console.error('Error fetching ODS data:', error);
    }
  };

  useEffect(() => {
    fetchOds(); // Llamar a la función para obtener los datos cuando se monte el componente
  }, []);

  return (
    <div className='flex flex-row flex-wrap justify-center my-10'>
      {objetives.map((element, index) => (
        <div className='flex items-center justify-center m-4 ' key={index}>
          <div className='group h-96 w-[22rem] [perspective:1000px]'>
            <div className='relative h-full w-full rounded-xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]'>
              {/* Parte delantera de la tarjeta */}
              <div className='absolute inset-0'>
                <img className='h-full w-full rounded-xl object-cover shadow-xl ' src={element.cardImage} alt={element.title} />
              </div>
              {/* Parte trasera de la tarjeta */}
              <div style={{ backgroundColor: `#${element.color}` }} className='absolute inset-0 h-full w-full rounded-xl px-12 text-center text-slate-200 [transform:rotateY(180deg)] [backface-visibility:hidden]'>
                <div className='flex flex-col gap-14 my-10'>
                  <div>
                    <h2 className='font-semibold'>{element.title}</h2>
                    <p className='mt-6 text-left'>{element.description}</p>
                  </div>
                  <a href={`objetives/${element.route}`} style={{ color: `#${element.color}` }} className='py-2 bg-white rounded-lg hover:bg-opacity-85'>
                    Ver Más
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
