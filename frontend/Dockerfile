# Use Node 20+ for modern Vite/React support
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (for faster caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run Vite and allow external access (--host)
CMD ["npm", "run", "dev", "--", "--host"]