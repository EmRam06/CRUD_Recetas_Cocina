import React, { useEffect, useState } from 'react';
import { obtenerRecetas, eliminarRecetaCompleta } from '../services/recetasService';
import RecetaModal from './RecetaModal';
import '../css/RecetaList.css';

const RecetaList = () => {
  const [recetas, setRecetas] = useState([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);

  useEffect(() => {
    cargarRecetas();
  }, []);

  const cargarRecetas = async () => {
    const data = await obtenerRecetas();
    setRecetas(data);
  };

  const handleRecetaActualizada = async (accion, id) => {
    if (accion === 'eliminar') {
      await eliminarRecetaCompleta(id);
      setRecetaSeleccionada(null);
    }
    await cargarRecetas(); // Siempre recarga después de editar o eliminar
  };

  return (
    <div className="receta-lista">
      <h4>Lista de Recetas</h4>
      <ul className="list-group">
        {recetas.map((receta) => (
          <li
            key={receta.id}
            className="list-group-item list-group-item-action"
            style={{ cursor: 'pointer' }}
            onClick={() => setRecetaSeleccionada(receta)}
          >
            <strong>{receta.titulo}</strong> — {receta.descripcion}
          </li>
        ))}
      </ul>

      {recetaSeleccionada && (
        <RecetaModal
          show={!!recetaSeleccionada}
          onClose={() => setRecetaSeleccionada(null)}
          receta={recetaSeleccionada}
          onRecetaActualizada={handleRecetaActualizada}
        />
      )}
    </div>

  );
};

export default RecetaList;
