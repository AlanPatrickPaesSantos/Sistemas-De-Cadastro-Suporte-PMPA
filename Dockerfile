# Estágio 1: Build do Frontend (Vite)
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copia arquivos de dependência do projeto raiz
COPY package*.json ./
RUN npm install

# Copia todo o código-fonte
COPY . .

# Executa o build do frontend (gera a pasta /dist)
RUN npm run build

# Estágio 2: Ambiente de Execução (Produção)
FROM node:20-alpine

WORKDIR /app

# Define porta padrão
ENV PORT=5001
ENV NODE_ENV=production

# Copia apenas as dependências do BACKEND para economizar espaço
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copia os arquivos do backend necessários
COPY backend/ ./backend/

# Copia o frontend compilado do estágio anterior para a pasta esperada pelo server.js
COPY --from=build-stage /app/dist ./dist

# Expõe a porta do servidor
EXPOSE 5001

# Comando de inicialização
CMD ["node", "backend/server.js"]
