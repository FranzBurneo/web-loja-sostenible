import { useEffect, useState } from 'react';
import './css/Home.css';
import axios from 'axios';

const Home = () => {
  const [postCards, setPostCards] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    loadPostCards();
  };

  const loadPostCards = async () => {
    const ruta = `${process.env.REACT_APP_NODE_API}posts`;
    const response = await axios.get(ruta, {
      params: {
        iterator: 1
      }
    });

    const truncateContent = (html) => {
      const maxLength = 150;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const textContent = tempDiv.textContent || "";
      const truncatedText = textContent.slice(0, maxLength);
      return `${truncatedText}${textContent.length > maxLength ? "..." : ""}`;
    };

    const data = response.data;
    const posts = data.posts;

    const genPostCards = posts.slice(0, 3).map((post) => (
      <div key={post.id} className="m-4">
        <div className='relative h-100 w-[20rem] sm:w-[23rem] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 flex flex-col'>
          <div className='w-full h-48 object-cover' style={{ backgroundColor: post.imageUrl ? 'transparent' : '#f0f0f0' }}>
            {post.imageUrl ? (
              <img
                className='w-full h-full object-contain'
                src={post.imageUrl}
                alt={post.title}
              />
            ) : (
              <div className='flex items-center justify-center h-full text-gray-500'>
                Sin imagen
              </div>
            )}
          </div>
          <div className='p-4 bg-white flex-grow h-56'>
            <h2 className='font-bold text-lg text-primary mb-2'>
              {post.selectedOds ? post.selectedOds.name : 'Publicación'}
            </h2>
            <h3 className='font-medium text-blackLS text-sm mb-4'>
              {post.title}
            </h3>
            <p className='text-sm text-gray-700'>
              {post.summaryContent ? truncateContent(post.summaryContent) : truncateContent(post.content)}
            </p>
          </div>
          <div className='p-4 bg-white'>
            <a href={`post/${post.id}`} 
              className='bg-primary text-whiteLS py-2 px-4 rounded-lg hover:bg-opacity-85'>
              Ver Más
            </a>
          </div>
        </div>
      </div>
    ));

    setPostCards(genPostCards);
  };

  return (
    <div>
      <section className="mb-12 mx-0">
        <div className="relative overflow-hidden bg-contain bg-no-repeat bg-[url('https://noticias.utpl.edu.ec/sites/default/files/styles/noticia_detalle_banner/public/multimedia/loja-sostenible-2030.jpg?')] h-[34rem]"></div>
        <div className="mx-auto px-6 md:px-12 xl:px-7">
          <div className="text-center">
            <div className="mt-[-25rem] block rounded-lg mx-auto bg-[hsla(0,0%,100%,0.55)] px-18 py-12 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-[30px] sm:w-[60%] sm:mt-[-15rem]">
              <h1 className="mb-9 text-3xl font-bold text-blackLS sm:text-5xl sm:mb-16">
                Bienvenido a <br /> <span className='text-3xl text-primary sm:text-7xl'>Loja Sostenible</span>
              </h1>
              <p className="text-blackLS mb-2 inline-block rounded bg-danger px-12 pb-3.5 text-sm font-medium sm:px-12 sm:text-sm">
              En Loja, estamos comprometidos con la construcción de un futuro sostenible y próspero para todos. Únete a nosotros y sé parte activa de este gran cambio hacia un mañana más verde, limpio y justo para nuestra ciudad.
              </p>
              <a href='objetives' className='bg-primary text-whiteLS font-medium py-3 px-12 rounded-xl hover:bg-opacity-85'>
                Ver ODS
              </a>
            </div>
          </div>
        </div>
      </section>

      {postCards.length > 0 && (
        <>
          <h1 className="text-3xl font-bold text-blackLS text-center sm:text-5xl">
            Publicaciones
          </h1>
          <div className='flex flex-row flex-wrap justify-center my-5 sm:my-10'>
            {postCards}
            <div className='m-4'>
              <div className='h-full w-[20rem] sm:w-[23rem] flex items-center justify-center bg-primary text-whiteLS rounded-xl shadow-lg hover:bg-opacity-85'>
                <a href="/publicaciones" className="font-bold text-xl">
                  Ver más publicaciones
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
