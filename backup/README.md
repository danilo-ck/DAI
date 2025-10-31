# Backup de la Base de Datos MongoDB

## Información del Backup

- **Base de datos**: DAI
- **Colecciones**: productos
- **Documentos**: 149 productos
- **Fecha de creación**: Ver timestamp de los archivos
- **Usuario**: root
- **Contenedor**: dai-mongo-1

## Contenido del Backup

```
backup/
└── DAI/
    ├── prelude.json              # Metadata del backup
    ├── productos.bson            # Datos de la colección (55KB)
    └── productos.metadata.json   # Metadata de la colección
```

## Cómo Restaurar el Backup

### Opción 1: Restaurar dentro del contenedor Docker

```bash
# Copiar el backup al contenedor
docker cp backup dai-mongo-1:/tmp/backup

# Ejecutar mongorestore dentro del contenedor
docker exec dai-mongo-1 mongorestore \
  --username=root \
  --password=example \
  --authenticationDatabase=admin \
  --db=DAI \
  /tmp/backup/DAI

# Limpiar
docker exec dai-mongo-1 rm -rf /tmp/backup
```

### Opción 2: Restaurar eliminando datos previos

```bash
# Copiar el backup al contenedor
docker cp backup dai-mongo-1:/tmp/backup

# Restaurar con --drop para eliminar colecciones existentes primero
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

### Opción 3: Restaurar solo la colección de productos

```bash
docker cp backup dai-mongo-1:/tmp/backup

docker exec dai-mongo-1 mongorestore \
  --username=root \
  --password=example \
  --authenticationDatabase=admin \
  --db=DAI \
  --collection=productos \
  /tmp/backup/DAI/productos.bson

docker exec dai-mongo-1 rm -rf /tmp/backup
```

## Crear un Nuevo Backup

```bash
# Crear backup dentro del contenedor
docker exec dai-mongo-1 mongodump \
  --username=root \
  --password=example \
  --authenticationDatabase=admin \
  --db=DAI \
  --out=/tmp/backup

# Copiar al host
docker cp dai-mongo-1:/tmp/backup ./backup-$(date +%Y%m%d-%H%M%S)

# Limpiar
docker exec dai-mongo-1 rm -rf /tmp/backup
```

## Verificar el Backup

```bash
# Ver estructura del backup
ls -lh backup/DAI/

# Ver metadata
cat backup/DAI/productos.metadata.json
```
