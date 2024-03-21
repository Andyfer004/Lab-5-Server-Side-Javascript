import express from 'express';
import { getAllPosts, getAllcars } from './db.js';
import conn from './conn.js';

const app = express();

app.use(express.json());

app.get('/posts', async (req, res) => {
  const posts = await getAllPosts();
  res.json(posts);
});

app.get('/cars', async (req, res) => {
  const cars = await getAllcars();
  res.json(cars);
});

app.get('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    // Utiliza parámetros con placeholders para prevenir inyección SQL
    const [rows] = await conn.query('SELECT * FROM Posts WHERE id = ?', [postId]);
    if (rows.length > 0) {
      const post = rows[0];
      res.json(post);
    } else {
      // Si no se encuentra el post, envía un código de estado 404 (No encontrado)
      res.status(404).send('Post no encontrado');
    }
  } catch (error) {
    res.status(500).send('Error interno del servidor');
  }
});

app.post('/posts', async (req, res) => {
  // Extrae los datos del post del cuerpo de la solicitud
  const {
    titulo, contenido, fecha_publicacion, imagen_base64, carro_id,
  } = req.body;

  // Realiza validaciones básicas; puedes expandirlas según sea necesario
  if (!titulo || !contenido || !fecha_publicacion) {
    return res.status(400).send('Datos requeridos faltantes');
  }

  try {
    // Inserta el nuevo post en la base de datos
    const result = await conn.query(
      'INSERT INTO Posts (titulo, contenido, fecha_publicacion, imagen_base64, carro_id) VALUES (?, ?, ?, ?, ?)',
      [titulo, contenido, fecha_publicacion, imagen_base64, carro_id],
    );

    // Obtén el ID del nuevo post
    const postId = result[0].insertId;

    // Retorna el nuevo post; realiza otra consulta para obtener los datos recién insertados
    const [rows] = await conn.query('SELECT * FROM Posts WHERE id = ?', [postId]);

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).send('Post creado pero no encontrado');
    }
  } catch (error) {
    console.error('Error al crear el post:', error);
    res.status(500).send('Error interno del servidor');
  }
  return { message: 'La función ha terminado correctamente' };
});

app.put('/posts/:postId', async (req, res) => {
  const { postId } = req.params; // Obtén el ID del post de los parámetros de la URL
  const {
    titulo, contenido, fecha_publicacion, imagen_base64, carro_id,
  } = req.body;
  // Extrae la información actualizada del cuerpo de la solicitud
  // Asegúrate de que el ID del post esté presente
  if (!postId) {
    return res.status(400).send('ID del post requerido');
  }

  try {
  // Actualiza el post en la base de datos utilizando el ID del post
    const result = await conn.query(
      'UPDATE Posts SET titulo = ?, contenido = ?, fecha_publicacion = ?, imagen_base64 = ?, carro_id = ? WHERE id = ?',
      [titulo, contenido, fecha_publicacion, imagen_base64, carro_id, postId],
    );

    // Verifica si la actualización tuvo éxito
    if (result[0].affectedRows > 0) {
    // Si fue exitosa, recupera el post actualizado para devolverlo
      const [updatedPosts] = await conn.query('SELECT * FROM Posts WHERE id = ?', [postId]);

      if (updatedPosts.length > 0) {
        res.status(200).json(updatedPosts[0]);
      } else {
      // Si el post no se encuentra después de la actualización, envía un 404
        res.status(404).send('Post no encontrado');
      }
    } else {
    // Si no se actualizaron filas, probablemente el post con ese ID no existe
      res.status(404).send('Post no encontrado o datos no modificados');
    }
  } catch (error) {
    console.error('Error al actualizar el post:', error);
    res.status(500).send('Error interno del servidor');
  }
  return { message: 'La función ha terminado correctamente' };
});

app.delete('/posts/:postId', async (req, res) => {
  const { postId } = req.params; // Obtén el ID del post de los parámetros de la URL

  // Asegúrate de que el ID del post esté presente
  if (!postId) {
    return res.status(400).send('ID del post requerido');
  }

  try {
    // Borra el post en la base de datos utilizando el ID del post
    const result = await conn.query('DELETE FROM Posts WHERE id = ?', [postId]);

    // Verifica si la eliminación fue exitosa
    if (result[0].affectedRows > 0) {
      // Si el post se borró exitosamente, devuelve un estado HTTP 204
      res.status(204).send();
    } else {
    // Si no se borraron filas, probablemente el post con ese ID no existe
      res.status(404).send('Post no encontrado');
    }
  } catch (error) {
    res.status(500).send('Error interno del servidor');
  }
  return { message: 'La función ha terminado correctamente' };
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
