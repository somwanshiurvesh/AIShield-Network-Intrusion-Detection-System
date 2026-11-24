FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Create public directory and index.html (required for react-scripts build)
RUN mkdir -p public
COPY public/ ./public/

# Copy all frontend files
COPY . .

# Set the API URL environment variable at build time
ARG REACT_APP_API_URL=http://localhost:8001
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build the application in production mode
ENV NODE_ENV=production
RUN GENERATE_SOURCEMAP=true npm run build

# Install serve globally for serving static files
RUN npm install -g serve

# Expose port
EXPOSE 3001

# Serve the built application with more verbose output for debugging
CMD ["serve", "-s", "build", "-l", "3001", "--debug"] 