# Api sobre posts y carros

La API de Carros y Posts es un servicio RESTful diseñado para gestionar información relacionada con carros y publicaciones.

## Características

- Detalle de un carro en específico.
- Creación de nuevos carros.
- Edición de posts de carros existentes.
- Eliminación de un carro.
- Soporte para imágenes en formato base64.
- Listado de todos los posts.
- Detalle de un post en específico.
- Creación de nuevos posts.
- Edición de posts de posts existentes.
- Eliminación de un post.
- Soporte para imágenes en formato base64.
- Documentación de API con Swagger.
- Soporte para CORS.

## Requisitos Previos

Necesitarás tener Node.js, npm y Docker instalados en tu sistema para ejecutar este proyecto.

## Instalación

Clona este repositorio y navega al directorio del proyecto:

git clone https://github.com/Andyfer004/Lab-5-Server-Side-Javascript.git

cd Lab-5-Server-Side-Javascript

## Instalar las dependencias

Instala las dependencias del proyecto:

npm install
npm install eslint
npm install cors
npm install mysql2
npm install express
npm install yamljs
npm install nodemon
npm install swagger-jsdoc
npm install swagger-ui-express

## Uso

Para iniciar el server y empezar a hacer los endpoints:

npm start

Esto iniciazará el servidor de Express en [Server](http://127.0.0.1:8080)

## Endpoints

+ ### GET /posts: 
    Retorna un listado de todos los posts.
+ ### GET /posts/:postId: 
    Retorna el detalle de un post.
+ ### POST /posts: 
    Crea un nuevo post.
+ ### PUT /posts/:postId: 
    Modifica un post existente.
+ ### DELETE /posts/:postId: 
    Elimina un post.
+ ### GET /cars: 
    Retorna un listado de todos los carros.
+ ### GET /cars/:carId: 
    Retorna el detalle de un carro.
+ ### POST /cars: 
    Crea un nuevo carro.
+ ### PUT /cars/:carId: 
    Modifica un carro existente.
+ ### DELETE /cars/:cartId: 
    Elimina un carro.

## Documentacion

Para conocer la documentación que pertenece a la API se encuentra en [Server](http://127.0.0.1:8080/api-docs)


## Docker

Para construir y ejecutar el contenedor de la base de datos, debes de utilizar:

1. docker build -t mysql-blog-car . 
2. docker run -d -p 3306:3306 --name container-mysql-blog-car mysql-blog-car

## Licencia

Este proyecto está bajo la licencia de MIT.
