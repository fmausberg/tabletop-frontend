# /myfinances-backend/Dockerfile

# 1. Base image
FROM node:22.14.0-slim

# 2. Set working directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy app code
COPY . .

# Set environment variable for API URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 6. Build Next.js
RUN npm run build

# 7. Set production environment
ENV NODE_ENV=production
# 8. Make Next.js listen on all interfaces
ENV HOST=0.0.0.0

# 9. Start the app
CMD ["npm", "run", "start"]

# EOF /myfinances-backend/Dockerfile
