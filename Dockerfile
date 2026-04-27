FROM node:18-alpine

# Set environment variable for production
ENV NODE_ENV=production

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json from the backend folder
COPY packages/backend/package*.json ./packages/backend/

# Navigate to the backend directory and install dependencies
WORKDIR /app/packages/backend
RUN npm install --production

# Go back to /app and copy all of packages (backend AND frontend)
WORKDIR /app
COPY packages/ ./packages/

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the app directly with node (optimized for fast startup)
WORKDIR /app/packages/backend
CMD ["node", "index.js"]
