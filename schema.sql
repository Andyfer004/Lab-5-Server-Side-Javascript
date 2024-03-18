CREATE USER IF NOT EXISTS 'Admin'@'%' IDENTIFIED BY 'Admin';
GRANT ALL PRIVILEGES ON blog_car.* TO 'Admin'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;


CREATE TABLE IF NOT EXISTS Carros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(255) NOT NULL,
    modelo VARCHAR(255) NOT NULL,
    anio YEAR NOT NULL,
    descripcion TEXT,
    imagen_base64 MEDIUMTEXT
);

CREATE TABLE IF NOT EXISTS Posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_publicacion DATE NOT NULL,
    imagen_base64 MEDIUMTEXT,
    carro_id INT,
    FOREIGN KEY (carro_id) REFERENCES Carros(id)
);
