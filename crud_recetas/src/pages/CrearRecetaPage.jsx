import React from 'react';
import { useNavigate } from 'react-router';
import RecetaForm from '../components/RecetaForm';
import '../css/CrearRecetaPage.css';

const CrearRecetaPage = () => {
    const navigate = useNavigate();
    return (
        <div className="crear-receta-page">
            <button className="btn btn-secondary btn-regresar" onClick={() => navigate('/recetas')}>
                ← Regresar
            </button>
            <h2>Crear Nueva Receta</h2>
            <RecetaForm />
        </div>
    );
};

export default CrearRecetaPage;
