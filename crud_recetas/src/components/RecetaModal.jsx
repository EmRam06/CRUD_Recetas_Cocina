import React, { useEffect, useState } from 'react';
import '../css/RecetaModal.css';
import { Modal, Button, Form } from 'react-bootstrap';
import {
  obtenerRecetaCompleta,
  actualizarRecetaCompleta,
  eliminarRecetaCompleta,
  obtenerCategorias,
  crearCategoria
} from '../services/recetasService';

const RecetaModal = ({ receta, onClose, onRecetaActualizada }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ingredientes, setIngredientes] = useState([]);
  const [pasos, setPasos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [mostrarInputCategoria, setMostrarInputCategoria] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Función para cargar los datos originales desde la base
  const cargarDatos = async () => {
    setCargando(true);
    if (receta?.id) {
      try {
        const completa = await obtenerRecetaCompleta(receta.id);
        setTitulo(completa.titulo);
        setDescripcion(completa.descripcion);
        setCategoria(completa.id_categoria);
        setIngredientes(completa.ingredientes || []);
        setPasos(completa.pasos || []);
      } catch (error) {
        console.error('Error al cargar receta completa:', error);
      }
    }
    setCargando(false);
  };

  // Cargar datos al montar o cambiar receta
  useEffect(() => {
    cargarDatos();
    cargarCategorias();
  }, [receta]);

  const cargarCategorias = async () => {
    const cats = await obtenerCategorias();
    setCategorias(cats);
  };

  // Al cancelar edición, resetea datos y sale del modo edición
  const handleCancelar = () => {
    cargarDatos();
    setMostrarInputCategoria(false);
    setNuevaCategoria('');
    setModoEdicion(false);
  };

  const handleGuardar = async () => {
    if (!titulo || !descripcion || (!categoria && !nuevaCategoria) || ingredientes.length === 0 || pasos.length === 0) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    let categoriaFinal = categoria;

    if (mostrarInputCategoria && nuevaCategoria.trim() !== '') {
      const nueva = await crearCategoria(nuevaCategoria.trim());
      if (!nueva) return;
      categoriaFinal = nueva.id;
    }

    try {
      await actualizarRecetaCompleta(
        receta.id,
        {
          titulo,
          descripcion,
          id_categoria: categoriaFinal,
        },
        ingredientes,
        pasos
      );
      setModoEdicion(false);
      onRecetaActualizada();
      onClose();
    } catch (error) {
      alert('Error al guardar la receta.');
      console.error(error);
    }
  };


  const handleEliminar = async () => {
    if (window.confirm('¿Seguro que deseas eliminar esta receta?')) {
      try {
        await eliminarRecetaCompleta(receta.id);
        onRecetaActualizada('eliminar', receta.id);
        onClose();
      } catch (error) {
        alert('Error al eliminar la receta.');
        console.error(error);
      }
    }
  };

  const agregarIngrediente = () => {
    setIngredientes([...ingredientes, { nombre: '', cantidad: '' }]);
  };

  const eliminarIngrediente = (index) => {
    const copia = [...ingredientes];
    copia.splice(index, 1);
    setIngredientes(copia);
  };

  const agregarPaso = () => {
    setPasos([...pasos, { descripcion: '' }]);
  };

  const eliminarPaso = (index) => {
    const copia = [...pasos];
    copia.splice(index, 1);
    setPasos(copia);
  };

  if (cargando) return <p>Cargando receta...</p>;

  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{modoEdicion ? 'Editar Receta' : titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {modoEdicion ? (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={categoria}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (valor === 'otra') {
                    setMostrarInputCategoria(true);
                    setCategoria('');
                  } else {
                    setMostrarInputCategoria(false);
                    setCategoria(valor);
                  }
                }}
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
                <option value="otra">Otra...</option>
              </Form.Select>

              {mostrarInputCategoria && (
                <Form.Control
                  className="mt-2"
                  placeholder="Nueva categoría"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                />
              )}
            </Form.Group>


            <Form.Group className="mb-3">
              <Form.Label>Ingredientes</Form.Label>
              {ingredientes.map((ing, i) => (
                <div key={i} className="d-flex gap-2 mb-2">
                  <Form.Control
                    placeholder="Nombre"
                    value={ing.nombre}
                    onChange={(e) => {
                      const copia = [...ingredientes];
                      copia[i].nombre = e.target.value;
                      setIngredientes(copia);
                    }}
                  />
                  <Form.Control
                    placeholder="Cantidad"
                    value={ing.cantidad}
                    onChange={(e) => {
                      const copia = [...ingredientes];
                      copia[i].cantidad = e.target.value;
                      setIngredientes(copia);
                    }}
                  />
                  <Button variant="danger" onClick={() => eliminarIngrediente(i)}>
                    x
                  </Button>
                </div>
              ))}
              <Button variant="secondary" onClick={agregarIngrediente}>
                + Ingrediente
              </Button>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Pasos</Form.Label>
              {pasos.map((p, i) => (
                <div key={i} className="d-flex gap-2 mb-2">
                  <Form.Control
                    as="textarea"
                    placeholder={`Paso ${i + 1}`}
                    value={p.descripcion}
                    onChange={(e) => {
                      const copia = [...pasos];
                      copia[i].descripcion = e.target.value;
                      setPasos(copia);
                    }}
                  />
                  <Button variant="danger" onClick={() => eliminarPaso(i)}>
                    x
                  </Button>
                </div>
              ))}
              <Button variant="secondary" onClick={agregarPaso}>
                + Paso
              </Button>
            </Form.Group>
          </Form>
        ) : (
          <>
            <p>
              <strong>Descripción:</strong> {descripcion}
            </p>
            <p>
              <strong>Categoría:</strong> {categorias.find(cat => cat.id == categoria)?.nombre || ''}
            </p>
            <p>
              <strong>Ingredientes:</strong>
            </p>
            <ul>
              {ingredientes.map((ing, i) => (
                <li key={i}>
                  {ing.nombre} — {ing.cantidad}
                </li>
              ))}
            </ul>
            <p>
              <strong>Pasos:</strong>
            </p>
            <ol>
              {pasos.map((p, i) => (
                <li key={i}>{p.descripcion}</li>
              ))}
            </ol>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {modoEdicion ? (
          <>
            <Button variant="secondary" onClick={handleCancelar}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handleGuardar}>
              Guardar
            </Button>
          </>
        ) : (
          <>
            <Button variant="danger" onClick={handleEliminar}>
              Eliminar
            </Button>
            <Button variant="primary" onClick={() => setModoEdicion(true)}>
              Editar
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default RecetaModal;
