# Digital Asset Management (DAM) Platform

A scalable platform for managing digital assets with background processing, object storage, and distributed architecture.

## 🏗️ Architecture

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Queue System**: BullMQ + Redis
- **Object Storage**: MinIO (S3-compatible)
- **Database**: PostgreSQL
- **Container Orchestration**: Docker Swarm

## 📋 Prerequisites

- Docker Desktop installed and running
- Node.js 18+ (for local development)
- Git


```bash
# Stop all services
docker-compose down

# Start only specific services
docker-compose up postgres redis minio -d

# View logs for specific service
docker-compose logs -f minio
```

### Backend Development

```bash
cd backend
npm run dev  # Auto-reloads on file changes
```

## 🐛 Troubleshooting

### MinIO buckets not created
```bash
docker-compose up minio_setup
```

### Port already in use
```bash
# Check what's using the port
lsof -i :3000  # or 5432, 6379, 9000

# Change port in .env file or docker-compose.yml
```

### Reset everything
```bash
docker-compose down -v  # Removes volumes too
docker-compose up -d
```     
