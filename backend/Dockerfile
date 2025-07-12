FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001

# Para desenvolvimento local (Docker)
CMD ["npm", "run", "dev"]
