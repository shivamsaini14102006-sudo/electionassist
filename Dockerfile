FROM node:18-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json from the backend folder
COPY packages/backend/package*.json ./packages/backend/

# Navigate to the backend directory and install dependencies
WORKDIR /app/packages/backend
RUN npm install --production

# Copy the rest of the backend source code
COPY packages/backend/ ./

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Run the app
CMD ["npm", "start"]
