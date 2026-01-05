FROM node:22-alpine

WORKDIR /app

# Copiar manifests primero (mejor cache)
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el resto
COPY . .

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "tienda.js"]
