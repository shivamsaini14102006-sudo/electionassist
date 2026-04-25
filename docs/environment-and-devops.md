# Environment and DevOps

## 1. Environment Requirements
- **Node.js**: v18.x or v20.x
- **Development OS**: Cross-platform (Windows/macOS/Linux)
- **API Key**: Gemini API key bound to `GEMINI_API_KEY` in the environment.

## 2. Local Setup Instructions
**Backend**:
```bash
cd packages/backend
npm install
# Create .env and add GEMINI_API_KEY=your_key
npm start # runs on port 3000
```

**Frontend**:
```bash
cd packages/frontend
# Serve using any static server (e.g. npx http-server or live server)
npx http-server -p 8080
```

## 3. DevOps (Optional Deployment)
- **Backend Server**: Deploy as a Google Cloud Run container using the `cloudrun` MCP server or manually via Docker.
- **Dockerfile**:
  ```dockerfile
  FROM node:20-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  EXPOSE 3000
  CMD ["node", "index.js"]
  ```
- **Frontend App**: Deploy statically to Firebase Hosting, Vercel, or Netlify.
