# Práctica 1 - Parser y Consultas de Productos Mercadona

## 📋 Descripción

Este proyecto extrae información de productos de varios archivos HTML de distintas categorías de Mercadona, los procesa y almacena en un archivo JSON (`datos_mercadona.json`). Posteriormente, los datos pueden importarse a una base de datos MongoDB y consultarse mediante scripts Node.js.

## 🏗️ Estructura del Proyecto

```
DAI/
├── html/                      # Archivos HTML con productos
│   ├── aceites.html
│   ├── aguas.html
│   ├── especias.html
│   └── salsas.html
├── model/                     # Modelos de Mongoose
│   ├── db.js                 # Conexión a MongoDB
│   └── Producto.js           # Esquema de productos
├── backup/                    # Backups de la base de datos
│   ├── DAI/
│   │   ├── productos.bson
│   │   └── productos.metadata.json
│   └── README.md             # Instrucciones de backup/restore
├── data/                      # Datos persistentes de MongoDB
├── parser.js                  # Parser de archivos HTML
├── seed.js                    # Importador de datos a MongoDB
├── consultas.js               # Script de consultas
├── datos_mercadona.json       # Datos extraídos en formato JSON
├── docker-compose.yml         # Configuración de Docker
└── package.json               # Dependencias del proyecto
```

## 🚀 ¿Cómo funciona?

1. **Parser (`parser.js`)**: Recorre automáticamente todos los archivos HTML de la carpeta `html`, extrae los productos y sus datos relevantes (categoría, subcategoría, precio, imagen, etc.) y guarda el resultado en formato JSON.

2. **Seed (`seed.js`)**: Importa los datos del JSON a MongoDB usando Mongoose. Soporta tanto el formato en español (del parser actual) como el formato en inglés (para compatibilidad).

3. **Consultas (`consultas.js`)**: Permite realizar diversas consultas sobre los productos almacenados en la base de datos.

## 🔧 Requisitos Previos

- Node.js (v18 o superior)
- Docker y Docker Compose
- npm

## 📦 Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/danilo-ck/DAI.git
   cd DAI
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Levantar los contenedores de Docker (MongoDB y Mongo Express):
   ```bash
   docker-compose up -d
   ```

4. Verificar que los contenedores estén corriendo:
   ```bash
   docker ps
   ```

## 🎯 Uso

### 1️⃣ Parsear archivos HTML

Extrae los datos de los archivos HTML y genera `datos_mercadona.json`:

```bash
npm run parse
# o directamente: node parser.js
```

**Salida esperada:**
```
Procesando 4 archivo(s)...
  ✓ aceites.html -> 35 productos
  ✓ aguas.html -> 45 productos
  ✓ especias.html -> 49 productos
  ✓ salsas.html -> 20 productos

Guardado 149 productos en datos_mercadona.json
```

### 2️⃣ Importar datos a MongoDB

Vacía la base de datos y la repuebla con los datos del JSON:

```bash
npm run seed
# o directamente: node seed.js
```

**Salida esperada:**
```
✔ Database connected: mongodb://root:example@localhost:27017/DAI?authSource=admin
✔ Insertados 149 documentos
```

### 3️⃣ Realizar consultas

```bash
# Consulta general
npm run consultas

# Productos baratos (< 2€)
npm run consultas:baratos

# Productos baratos excluyendo agua
npm run consultas:baratos-no-agua

# Productos de la categoría "aceites"
npm run consultas:aceites

# Productos en garrafa
npm run consultas:garrafa
```

## 🗄️ Backup de la Base de Datos

### Crear un backup

```bash
# Crear backup en el contenedor
docker exec dai-mongo-1 mongodump \
  --username=root \
  --password=example \
  --authenticationDatabase=admin \
  --db=DAI \
  --out=/tmp/backup

# Copiar al host
docker cp dai-mongo-1:/tmp/backup ./backup

# Limpiar el backup temporal del contenedor
docker exec dai-mongo-1 rm -rf /tmp/backup
```

### Restaurar un backup

```bash
# Copiar el backup al contenedor
docker cp backup dai-mongo-1:/tmp/backup

# Restaurar la base de datos (con --drop para eliminar datos previos)
docker exec dai-mongo-1 mongorestore \
  --username=root \
  --password=example \
  --authenticationDatabase=admin \
  --db=DAI \
  --drop \
  /tmp/backup/DAI

# Limpiar
docker exec dai-mongo-1 rm -rf /tmp/backup
```

**Ver más detalles**: Consulta el archivo `backup/README.md` para instrucciones completas.

## 🌐 Interfaz Web (Mongo Express)

Una vez levantados los contenedores, puedes acceder a Mongo Express para ver y gestionar la base de datos visualmente:

```
http://localhost:8081
```

## 📊 Estructura de Datos

Cada producto contiene los siguientes campos:

```javascript
{
  title: "Aceite de oliva 0,4º Hacendado",
  price: 17.25,
  price_text: "17,25 €",
  unit_price_text: "Garrafa 5 L",
  image: "https://prod-mercadona.imgix.net/images/...",
  link: null,
  category: "aceite, vinagre y sal",
  subcategory: "aceite de oliva",
  source_file: "aceites.html"
}
```

## ✨ Características Destacadas

- **✅ Extracción automática de subcategorías**: El parser detecta correctamente las subcategorías desde los encabezados `<h2>` de cada sección HTML.
- **✅ Mapeo flexible**: `seed.js` soporta tanto nombres de campos en español como en inglés para máxima compatibilidad.
- **✅ Backup documentado**: Sistema completo de backup y restauración de la base de datos MongoDB.
- **✅ Múltiples consultas predefinidas**: Scripts npm para consultas comunes.
- **✅ Interfaz web**: Mongo Express para gestión visual de datos.

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **node-html-parser** - Parser de HTML
- **Docker** - Contenedorización
- **Mongo Express** - Interfaz web para MongoDB

## 📝 Scripts Disponibles

```json
{
  "parse": "node parser.js",
  "seed": "node seed.js",
  "consultas": "node consultas.js",
  "consultas:baratos": "node consultas.js baratos",
  "consultas:baratos-no-agua": "node consultas.js baratos-no-agua",
  "consultas:aceites": "node consultas.js aceites",
  "consultas:garrafa": "node consultas.js garrafa"
}
```

## 🐛 Solución de Problemas

### El parser no encuentra los archivos HTML
- Asegúrate de que los archivos HTML estén en la carpeta `html/`

### No se pueden insertar documentos en MongoDB
- Verifica que los contenedores de Docker estén corriendo: `docker ps`
- Verifica la conexión a MongoDB en `model/db.js`
- Asegúrate de que el puerto 27017 esté disponible

### Error al crear backup
- Verifica que el contenedor `dai-mongo-1` esté corriendo
- Verifica las credenciales de MongoDB (root/example)

---

**Autor**: Danilo CK  
**Repositorio**: [github.com/danilo-ck/DAI](https://github.com/danilo-ck/DAI)
