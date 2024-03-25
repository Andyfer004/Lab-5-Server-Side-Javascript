import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import fs from 'fs';
import { getAllPosts, getAllcars } from './db.js';
import conn from './conn.js';

const app = express();

const swaggerDocument = YAML.load('swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());

app.use(cors());

const logFilePath = 'log.txt';
if (!fs.existsSync(logFilePath)) {
  // Si no existe, crea el archivo y escribe un mensaje inicial
  fs.writeFileSync(logFilePath, 'Inicio del registro:\n\n');
}

const writeToLog = (endpoint, payload, response) => {
  const currentTime = new Date().toISOString(); // Obtiene la hora actual en formato ISO

  // Verifica si el payload contiene referencias circulares y lo maneja de manera adecuada
  let payloadString;
  try {
    payloadString = JSON.stringify(payload);
  } catch (error) {
    payloadString = 'Circular structure in payload';
  }

  // Verifica si la respuesta contiene referencias circulares y lo maneja de manera adecuada
  let responseString;
  try {
    responseString = JSON.stringify(response);
  } catch (error) {
    responseString = 'Circular structure in response';
  }

  const logMessage = `${currentTime} - Endpoint: ${endpoint}\nPayload: ${payloadString}\nResponse: ${responseString}\n\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error al escribir en el archivo de registro:', err);
    }
  });
};

app.get('/posts', async (req, res) => {
  const posts = await getAllPosts();
  writeToLog('/posts', req.query, res);
  res.json(posts);
});

app.get('/cars', async (req, res) => {
  const cars = await getAllcars();
  writeToLog('/cars', req.query, res);
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
  writeToLog('/posts/:postId', req.params, res);
});

app.get('/cars/:carId', async (req, res) => {
  const { carId } = req.params;
  try {
    // Utiliza parámetros con placeholders para prevenir inyección SQL
    const [rows] = await conn.query('SELECT * FROM Carros WHERE id = ?', [carId]);
    if (rows.length > 0) {
      const post = rows[0];
      res.json(post);
    } else {
      // Si no se encuentra el post, envía un código de estado 404 (No encontrado)
      res.status(404).send('Car no encontrado');
    }
  } catch (error) {
    res.status(500).send('Error interno del servidor');
  }
  writeToLog('/cars/:carId', req.params, res);
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
  writeToLog('/posts', req.body, res);
  return { message: 'La función ha terminado correctamente' };
});

app.post('/cars', async (req, res) => {
  // Extrae los datos del post del cuerpo de la solicitud
  const {
    marca, modelo, anio, descripcion, imagen_base64,
  } = req.body;

  // Realiza validaciones básicas; puedes expandirlas según sea necesario
  if (!marca || !modelo || !anio || !anio || !descripcion) {
    return res.status(400).send('Datos requeridos faltantes');
  }

  try {
    // Inserta el nuevo post en la base de datos
    const result = await conn.query(
      'INSERT INTO Carros (marca, modelo, anio, descripcion, imagen_base64) VALUES (?, ?, ?, ?, ?)',
      [marca, modelo, anio, descripcion, imagen_base64],
    );

    // Obtén el ID del nuevo post
    const carId = result[0].insertId;

    // Retorna el nuevo post; realiza otra consulta para obtener los datos recién insertados
    const [rows] = await conn.query('SELECT * FROM Carros WHERE id = ?', [carId]);

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).send('Car creado pero no encontrado');
    }
  } catch (error) {
    console.error('Error al crear car:', error);
    res.status(500).send('Error interno del servidor');
  }
  writeToLog('/cars', req.body, res);
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
  writeToLog('/posts/:postId', req.params, res);
  return { message: 'La función ha terminado correctamente' };
});

app.put('/cars/:carId', async (req, res) => {
  const { carId } = req.params; // Obtén el ID del post de los parámetros de la URL
  const {
    marca, modelo, anio, descripcion, imagen_base64,
  } = req.body;
    // Extrae la información actualizada del cuerpo de la solicitud
    // Asegúrate de que el ID del post esté presente
  if (!carId) {
    return res.status(400).send('ID del post requerido');
  }

  try {
    // Actualiza el post en la base de datos utilizando el ID del post
    const result = await conn.query(
      'UPDATE Carros SET marca = ?, modelo = ?, anio = ?, descripcion = ?, imagen_base64 = ? WHERE id = ?',
      [marca, modelo, anio, descripcion, imagen_base64, carId],
    );

    // Verifica si la actualización tuvo éxito
    if (result[0].affectedRows > 0) {
    // Si fue exitosa, recupera el post actualizado para devolverlo
      const [updatedCars] = await conn.query('SELECT * FROM Carros WHERE id = ?', [carId]);

      if (updatedCars.length > 0) {
        res.status(200).json(updatedCars[0]);
      } else {
        // Si el post no se encuentra después de la actualización, envía un 404
        res.status(404).send('Car no encontrado');
      }
    } else {
      // Si no se actualizaron filas, probablemente el post con ese ID no existe
      res.status(404).send('Car no encontrado o datos no modificados');
    }
  } catch (error) {
    console.error('Error al actualizar el car:', error);
    res.status(500).send('Error interno del servidor');
  }
  writeToLog('/cars/:carId', req.params, res);
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
  writeToLog('/posts/:postId', req.params, res);
  return { message: 'La función ha terminado correctamente' };
});

app.delete('/cars/:carId', async (req, res) => {
  const { carId } = req.params; // Obtén el ID del post de los parámetros de la URL

  // Asegúrate de que el ID del post esté presente
  if (!carId) {
    return res.status(400).send('ID del post requerido');
  }

  try {
    // Borra el post en la base de datos utilizando el ID del post
    const result = await conn.query('DELETE FROM Carros WHERE id = ?', [carId]);

    // Verifica si la eliminación fue exitosa
    if (result[0].affectedRows > 0) {
    // Si el post se borró exitosamente, devuelve un estado HTTP 204
      res.status(204).send();
    } else {
    // Si no se borraron filas, probablemente el post con ese ID no existe
      res.status(404).send('Car no encontrado');
    }
  } catch (error) {
    res.status(500).send('Error interno del servidor');
  }
  writeToLog('/cars/:carId', req.params, res);
  return { message: 'La función ha terminado correctamente' };
});

app.use((req, res, next) => {
  res.status(501).send('Método no implementado');
  writeToLog(req.url, req.body, res);
  next();
});

// Manejo de endpoint no existente
app.use((req, res, next) => {
  res.status(400).send('Endpoint no existente');
  writeToLog(req.url, req.body, res);
  next();
});

// Manejo de datos con formato incorrecto en métodos PUT y POST
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).send('Datos con formato incorrecto en el body');
  } else {
    next();
  }
  writeToLog(req.url, req.body, res);
});

app.listen(22944, () => {
  console.log('Server is running on port 8080');
  writeToLog('Server is running on port 8080', '', '');
});
