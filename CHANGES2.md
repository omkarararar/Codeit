# Changes - November 27, 2025

## Docker Configuration Fixes

### Fixed Issues
- **compose.yaml**: Corrected Dockerfile build context path
  - Changed from `context: ./server, dockerfile: ../Dockerfile` to `context: ., dockerfile: Dockerfile`
  
- **server/package.json**: Updated start script for production compatibility
  - Changed from `"start": "nodemon index.js"` to `"start": "node index.js"`
  - Added `"dev": "nodemon index.js"` for local development

- **Author Update**: Changed author field to "Omkar Panchawadkar"

### Current Setup
- **Backend**: Docker Compose with Redis + 3 Node.js servers + nginx load balancer (port 5000)
- **Frontend**: React dev server (port 3000)

### Running the Application
```bash
# Backend
cd Codeit
docker-compose up --build -d

# Frontend (separate terminal)
cd Codeit/client
npm start
```

Access at: http://localhost:3000
