automatic trigger
check trigger ho rha ha ya nhi

trriger test
check jenkins

## Docker Deployment Guide (Universal Health Records / E-Prescription)

### 1. Requirements
- Docker Desktop with Docker Compose

### 2. Run with Docker Compose
Start both frontend and backend containers in background:
```bash
docker compose up -d --build
```

### 3. Access URLs
- **Frontend App**: http://localhost or http://localhost:5173
- **Backend Health Check**: http://localhost:5000/api/health
- **Nginx Proxied Health Check**: http://localhost/api/health

### 4. Useful Docker Commands
```bash
# Check status of containers
docker compose ps

# View logs
docker compose logs -f

# View backend logs only
docker logs -f eprescription-backend

# View frontend logs only
docker logs -f eprescription-frontend

# Stop all containers
docker compose down
```
