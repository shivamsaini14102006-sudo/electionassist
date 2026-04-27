FROM node:18-alpine

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

# Start the app from the backend directory
WORKDIR /app/packages/backend
CMD ["npm", "start"]
