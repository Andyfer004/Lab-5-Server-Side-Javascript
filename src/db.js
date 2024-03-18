import conn from './conn.js';

export async function getAllPosts(){
    try {
        const [rows] = await conn.query('SELECT * FROM Posts');
        return rows;
    } catch (error) {
        console.error('Error al obtener posts:', error);
        throw error; // Re-lanza el error para manejarlo más arriba en la cadena de promesas.
    }
}

