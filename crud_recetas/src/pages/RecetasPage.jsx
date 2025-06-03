// src/pages/RecetasPage.jsx
import React from 'react';
import { useNavigate } from 'react-router';
import RecetaList from '../components/RecetaList';
import '../css/RecetasPage.css';

const RecetasPage = () => {
  const navigate = useNavigate();

  return (
    <div className="recetas-page">
      <div className="recetas-header">
        <h2>RecetasTEC</h2>
        <button className="btn btn-primary btn-nueva-receta" onClick={() => navigate('/recetas/nueva')}>
          + Nueva Receta
        </button>
      </div>
      <RecetaList />
    </div>

  );
};

export default RecetasPage;

