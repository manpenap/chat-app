import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Instalar si no lo tienes: npm install axios

const LearningPath = () => {
  const [learningPath, setLearningPath] = useState({ unit: '', lessons: [] }); // Almacena los datos
  const [loading, setLoading] = useState(true); // Indicador de carga
  const [error, setError] = useState(null); // Almacena errores
  const [expandedUnit, setExpandedUnit] = useState(null); // Estado para la unidad expandida

  const navigate = useNavigate(); //Hook para navegación
  const id = 'a1_path'; // ID de la ruta de aprendizaje

  const toggleUnit = (unitId) => {
    setExpandedUnit((prev) => (prev === unitId ? null : unitId)); // Alterna entre expandir y colapsar
  };

  const handleLessonClick = (lesson) => {
    if (lesson.type !== 'listening' && lesson.type !== 'reading') {
      navigate('/chatscreen', { state: { lesson } }); // Navega a ChatScreen pasando datos de la lección
    } else {
      console.log(`La lección "${lesson.name}" no es interactiva.`);
    }
  };

  useEffect(() => {
    const fetchLearningPath = async () => {
      try {
        const response = await axios.get(`/api/learning-path/${id}`);
        console.log('Datos recibidos:', response.data);
        setLearningPath(response.data); // Guarda los datos en el estado
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar la ruta de aprendizaje:', err);
        setError('No se pudo cargar la información');
        setLoading(false);
      }
    };

    fetchLearningPath();
  }, [id]);

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{learningPath.name}</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Volver</button>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Unidades</h2>
        <ul className="space-y-4">
          {learningPath.units?.length > 0 ? (
            learningPath.units.map((unit) => (
              <li
                key={unit._id}
                className="p-4 bg-white rounded shadow cursor-pointer"
                onClick={() => toggleUnit(unit._id)} // Maneja el clic para expandir/colapsar
              >
                <h3 className="text-md text-black font-semibold">{unit.name}</h3>
                <p className='text-gray-500'>{unit.objective}</p>

                {/* Renderiza las lecciones si la unidad está expandida */}
                {expandedUnit === unit._id && (
                  <ul className="mt-2 space-y-2 border-t border-gray-300 text-blue-600 pt-2">
                    {unit.lessons?.length > 0 ? (
                      unit.lessons.map((lesson) => (
                        <li
                          key={lesson._id}
                          className={`pl-4 text-sm bg-gray-50 rounded p-2 cursor-pointer ${
                            lesson.type === 'listening' || lesson.type === 'reading'
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          onClick={() => handleLessonClick(lesson)} // Maneja el clic en la lección
                        >
                          {lesson.name}
                        </li>
                      ))
                    ) : (
                      <p>No hay lecciones disponibles.</p>
                    )}
                  </ul>
                )}
              </li>
            ))
          ) : (
            <p>No hay unidades disponibles.</p>
          )}
        </ul>
      </section>
    </div>
  );
};

export default LearningPath;

