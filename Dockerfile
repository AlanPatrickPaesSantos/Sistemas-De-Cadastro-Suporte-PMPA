# Estágio 1: Build do Frontend (Vite)
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copia arquivos de dependência do frontend para instalar antes do build (caching eficiente)
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copia todo o código-fonte do repositório
COPY . .

# Executa o build do frontend dentro da nova pasta correspondente
RUN cd frontend && npm run build

# Estágio 2: Ambiente de Execução (Produção)
FROM node:20-alpine

WORKDIR /app

# Define variáveis de ambiente de produção
ENV PORT=5001
ENV NODE_ENV=production

# Copia apenas as dependências do BACKEND para poupar espaço no container final
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copia o restante do backend
COPY backend/ ./backend/

# Copia o build estático do frontend do estágio 1 para a raiz onde o server.js o servirá
COPY --from=build-stage /app/dist ./dist

# Expõe a porta operacional padrão
EXPOSE 5001

# Ponto de entrada do sistema integrado
CMD ["node", "backend/server.js"]
