# Práctica 1 - Parser y Consultas de Productos Mercadona

## ¿Cómo funciona?

Este proyecto extrae información de productos de varios archivos HTML de distintas categorías de Mercadona, los procesa y almacena en un archivo JSON (`datos_mercadona.json`). Posteriormente, los datos pueden importarse a una base de datos MongoDB y consultarse mediante scripts Node.js.

- El parser (`parser_aceites.js`) recorre automáticamente todos los archivos HTML de la carpeta `productos`, extrae los productos y sus datos relevantes, incluyendo la categoría y subcategoría, y guarda el resultado en formato JSON.
- El script `seed.js` importa los datos JSON a MongoDB usando Mongoose.
- El script `consultas.js` permite realizar consultas útiles sobre los productos almacenados en la base de datos.

## Extras realizadas

- **Inclusión de subcategorías:** El parser detecta y almacena la subcategoría de cada producto, permitiendo consultas más precisas y estructuradas.
- **Backup de la base de datos:** Se documenta y facilita la creación de copias de seguridad de la base de datos MongoDB mediante el uso de `mongodump` dentro del contenedor Docker.

## Ejecución rápida

1. Ejecuta el parser para generar el JSON:
   ```bash
   node parser_aceites.js
   ```
2. Importa los datos a MongoDB:
   ```bash
   node seed.js
   ```
3. Realiza consultas:
   ```bash
   node consultas.js
   ```
4. Realiza un backup de la base de datos (desde el host):
   ```bash
   docker exec practica0-mongo-1 mongodump --username root --password example --authenticationDatabase admin --out /backup_mercadona
   docker cp practica0-mongo-1:/backup_mercadona ./backup_mercadona
   ```

---

Cualquier duda o mejora, consultar los scripts o preguntar al autor.
