import { supabase } from '../supabaseClient';

export const obtenerRecetas = async () => {
  const { data, error } = await supabase.from('recetas').select('*');
  if (error) {
    console.error('Error al obtener recetas:', error);
    return [];
  }
  return data;
};

export const crearReceta = async (receta) => {
  const { error } = await supabase.from('recetas').insert([receta]);
  if (error) {
    console.error('Error al crear receta:', error.message);
    alert('No se pudo guardar la receta.');
    return false;
  }
  return true;
};

export const eliminarRecetaCompleta = async (id) => {
  // Elimina primero ingredientes y pasos por la FK
  await supabase.from('ingredientes').delete().eq('id_receta', id);
  await supabase.from('pasos').delete().eq('id_receta', id);

  // Luego la receta
  const { error } = await supabase.from('recetas').delete().eq('id', id);
  if (error) {
    console.error('Error al eliminar receta:', error);
  }
};

// Obtener categorías
export const obtenerCategorias = async () => {
  const { data, error } = await supabase.from('categorias').select('*');
  if (error) {
    console.error('Error al obtener categorías:', error.message);
    return [];
  }
  return data;
};

// Crear nueva categoría y devolver ID
export const crearCategoria = async (nombre) => {
  const { data, error } = await supabase.from('categorias').insert([{ nombre }]).select().single();
  if (error) {
    alert('Error al crear la categoría');
    console.error(error.message);
    return null;
  }
  return data;
};

// Crear receta completa con ingredientes y pasos
export const crearRecetaCompleta = async ({ titulo, descripcion, id_categoria, ingredientes, pasos }) => {
  const { data, error } = await supabase.from('recetas').insert([{ titulo, descripcion, id_categoria }]).select().single();
  if (error) {
    console.error('Error al crear receta:', error.message);
    return false;
  }

  const id_receta = data.id;

  const ingredientesConId = ingredientes.map(i => ({ ...i, id_receta }));
  const pasosConId = pasos.map((descripcion, index) => ({ id_receta, descripcion, orden: index + 1 }));

  const { error: ingErr } = await supabase.from('ingredientes').insert(ingredientesConId);
  const { error: pasosErr } = await supabase.from('pasos').insert(pasosConId);

  if (ingErr || pasosErr) {
    console.error('Error al guardar ingredientes o pasos');
    return false;
  }

  return true;
};

// Obtener ingredientes por receta
export const obtenerIngredientesPorReceta = async (idReceta) => {
  const { data, error } = await supabase
    .from('ingredientes')
    .select('*')
    .eq('id_receta', idReceta);

  if (error) {
    console.error('Error al obtener ingredientes:', error);
    return [];
  }
  return data;
};

// Obtener pasos por receta
export const obtenerPasosPorReceta = async (idReceta) => {
  const { data, error } = await supabase
    .from('pasos')
    .select('*')
    .eq('id_receta', idReceta)
    .order('numero', { ascending: true }); // opcional, si quieres ordenarlos

  if (error) {
    console.error('Error al obtener pasos:', error);
    return [];
  }
  return data;
};


export async function actualizarRecetaCompleta(idReceta, datosReceta, ingredientes, pasos) {
  // 1. Actualizar receta principal
  const { error: errorReceta } = await supabase
    .from('recetas')
    .update({
      titulo: datosReceta.titulo,
      descripcion: datosReceta.descripcion,
      id_categoria: datosReceta.id_categoria, // ✅ Nombre correcto del campo
    })
    .eq('id', idReceta);

  if (errorReceta) throw errorReceta;

  // 2. Eliminar ingredientes antiguos
  const { error: errorEliminarIngredientes } = await supabase
    .from('ingredientes')
    .delete()
    .eq('id_receta', idReceta);

  if (errorEliminarIngredientes) throw errorEliminarIngredientes;

  // 3. Insertar nuevos ingredientes
  const nuevosIngredientes = ingredientes.map((ing) => ({
    id_receta: idReceta,
    nombre: ing.nombre,
    cantidad: ing.cantidad,
  }));

  if (nuevosIngredientes.length > 0) {
    const { error: errorInsertarIngredientes } = await supabase
      .from('ingredientes')
      .insert(nuevosIngredientes);

    if (errorInsertarIngredientes) throw errorInsertarIngredientes;
  }

  // 4. Eliminar pasos antiguos
  const { error: errorEliminarPasos } = await supabase
    .from('pasos')
    .delete()
    .eq('id_receta', idReceta);

  if (errorEliminarPasos) throw errorEliminarPasos;

  // 5. Insertar nuevos pasos
  const nuevosPasos = pasos.map((paso, index) => ({
    id_receta: idReceta,
    descripcion: paso.descripcion,
    orden: index + 1,
  }));

  if (nuevosPasos.length > 0) {
    const { error: errorInsertarPasos } = await supabase
      .from('pasos')
      .insert(nuevosPasos);

    if (errorInsertarPasos) throw errorInsertarPasos;
  }

  return { ok: true };
}

export const obtenerRecetaCompleta = async (id) => {
  const { data: receta, error: recetaError } = await supabase
    .from('recetas')
    .select('*, ingredientes(*), pasos(*), categorias(nombre)')
    .eq('id', id)
    .single();

  if (recetaError) throw recetaError;

  // Extraemos el nombre de la categoría para mayor claridad
  return {
    ...receta,
    categoria_nombre: receta.categorias?.nombre || '', // opcional si quieres mostrarlo
  };
};