import React, { useEffect, useState } from 'react';
import { crearRecetaCompleta, obtenerCategorias, crearCategoria } from '../services/recetasService';
import '../css/RecetaForm.css';

const RecetaForm = () => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [ingredientes, setIngredientes] = useState([{ nombre: '', cantidad: '' }]);
  const [pasos, setPasos] = useState(['']);

  useEffect(() => {
    const cargarCategorias = async () => {
      const data = await obtenerCategorias();
      setCategorias(data);
    };
    cargarCategorias();
  }, []);

  const handleAddIngrediente = () => {
    setIngredientes([...ingredientes, { nombre: '', cantidad: '' }]);
  };

  const handleRemoveIngrediente = (index) => {
    const copia = [...ingredientes];
    copia.splice(index, 1);
    setIngredientes(copia);
  };

  const handleIngredienteChange = (index, field, value) => {
    const copia = [...ingredientes];
    copia[index][field] = value;
    setIngredientes(copia);
  };

  const handleAddPaso = () => {
    setPasos([...pasos, '']);
  };

  const handleRemovePaso = (index) => {
    const copia = [...pasos];
    copia.splice(index, 1);
    setPasos(copia);
  };

  const handlePasoChange = (index, value) => {
    const copia = [...pasos];
    copia[index] = value;
    setPasos(copia);
  };

  const validarFormulario = () => {
    if (!titulo.trim() || !descripcion.trim()) return false;
    if (!categoriaSeleccionada || (categoriaSeleccionada === 'otra' && !nuevaCategoria.trim())) return false;
    if (ingredientes.some(i => !i.nombre.trim() || !i.cantidad.trim())) return false;
    if (pasos.some(p => !p.trim())) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      alert('Por favor completa todos los campos.');
      return;
    }

    let categoriaFinal = categoriaSeleccionada;

    if (categoriaSeleccionada === 'otra') {
      const nueva = await crearCategoria(nuevaCategoria.trim());
      if (!nueva) return;
      categoriaFinal = nueva.id;
    }

    const receta = {
      titulo,
      descripcion,
      id_categoria: categoriaFinal,
      ingredientes,
      pasos,
    };

    const ok = await crearRecetaCompleta(receta);
    if (ok) {
      alert('Receta guardada con éxito');
      window.location.reload(); // Se puede mejorar luego con estado
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Agregar Receta</h4>

      <div className="mb-3">
        <label className="form-label">Título</label>
        <input className="form-control" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label">Descripción</label>
        <textarea className="form-control" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label">Categoría</label>
        <select className="form-select" value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)}>
          <option value="">Selecciona una categoría</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
          <option value="otra">Otra...</option>
        </select>
      </div>

      {categoriaSeleccionada === 'otra' && (
        <div className="mb-3">
          <label className="form-label">Nueva Categoría</label>
          <input className="form-control" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} />
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Ingredientes</label>
        {ingredientes.map((ing, i) => (
          <div key={i} className="d-flex mb-2 gap-2">
            <input
              className="form-control"
              placeholder="Nombre"
              value={ing.nombre}
              onChange={(e) => handleIngredienteChange(i, 'nombre', e.target.value)}
            />
            <input
              className="form-control"
              placeholder="Cantidad"
              value={ing.cantidad}
              onChange={(e) => handleIngredienteChange(i, 'cantidad', e.target.value)}
            />
            <button type="button" className="btn btn-danger" onClick={() => handleRemoveIngrediente(i)}>X</button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary mt-1" onClick={handleAddIngrediente}>
          + Agregar Ingrediente
        </button>
      </div>

      <div className="mb-3">
        <label className="form-label">Pasos</label>
        {pasos.map((paso, i) => (
          <div key={i} className="d-flex mb-2 gap-2">
            <textarea
              className="form-control"
              placeholder={`Paso ${i + 1}`}
              value={paso}
              onChange={(e) => handlePasoChange(i, e.target.value)}
            />
            <button type="button" className="btn btn-danger" onClick={() => handleRemovePaso(i)}>X</button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary mt-1" onClick={handleAddPaso}>
          + Agregar Paso
        </button>
      </div>

      <button className="btn btn-primary" type="submit">Guardar Receta</button>
    </form>
  );
};

export default RecetaForm;
