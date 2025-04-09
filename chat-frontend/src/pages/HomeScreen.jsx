import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-background">
      <header className="flex justify-between items-center p-6 shadow-md bg-backgroundAlternative">
        <h1 className="text-2xl font-bold text-textMainColor">Chat English</h1>
        <div>
          <Link 
            to="/login" 
            className="mr-4 px-4 py-2 bg-buttonColor text-textMainColor rounded hover:bg-buttonColorHover"
          >
            Ingresar
          </Link>

        </div>
      </header>

      
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl font-bold text-textSecondColor mb-4">
          Practica Inglés de Forma Natural
        </h2>
        <p className="text-xl text-textMainColor mb-8 max-w-2xl">
          Sumérgete en conversaciones reales y mejora tu fluidez en inglés. 
          Nuestra aplicación te ofrece una experiencia interactiva con reconocimiento de voz 
          y respuestas inteligentes, permitiéndote practicar sobre distintos temas de manera amigable y motivadora.
        </p>
        <Link 
          to="/register" 
          className="px-8 py-3 bg-blue-500 text-white rounded-lg text-lg hover:bg-blue-600"
        >
          ¡Empieza ahora!
        </Link>
      </main>

      {/* Pie de página */}
      <footer className="bg-backgroundAlternative p-4 text-center text-gray-500">
        © {new Date().getFullYear()} Let`s Talk. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default LandingPage;

