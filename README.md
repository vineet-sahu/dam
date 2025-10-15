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

## 🚀 Quick Start (Day 1 Setup)

### Step 1: Clone and Setup Project

```bash
# Create project directory
mkdir dam-platform && cd dam-platform

# Copy the structure script and run it
chmod +x setup.sh
./setup.sh

# Initialize git
git init
```

### Step 2: Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, MinIO, and BullMQ Board
docker-compose up -d

# Verify all services are running
docker-compose ps

# Check logs if needed
docker-compose logs -f
```

**Services Available:**
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MinIO API: `localhost:9000`
- MinIO Console: `http://localhost:9001` (admin/minioadmin123)
- BullMQ Dashboard: `http://localhost:3001`

### Step 3: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Backend will run on `http://localhost:3000`

Test it:
```bash
curl http://localhost:3000/health
```

## 🧪 Testing Day 1 Setup

### 1. Check MinIO
Visit: `http://localhost:9001`
- Login: minioadmin / minioadmin123
- Verify buckets exist: `originals`, `thumbnails`, `transcoded`

### 2. Check Redis
```bash
docker exec -it dam_redis redis-cli ping
# Should return: PONG
```

### 3. Check Backend Health
```bash
curl http://localhost:3000/health
```

### 4. Check BullMQ Board
Visit: `http://localhost:3001` - Should show empty queues

## 📁 Project Structure

```
dam-platform/
├── backend/              # Express API
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── controllers/ # Business logic
│   │   ├── services/    # External services (MinIO, Queue)
│   │   ├── models/      # Database models
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Helper functions
│   ├── server.js        # Entry point
│   └── package.json
├── workers/             # Background job processors
├── frontend/            # React application
├── docker/              # Dockerfiles
└── docker-compose.yml   # Development services
```

## 🔧 Development Workflow

### Running Services Individually

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

## 📝 Next Steps (Day 2)

- [ ] Create database schema (Sequelize models)
- [ ] Implement file upload endpoint
- [ ] Test file upload to MinIO
- [ ] Add basic asset listing endpoint

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Submit PR

## 📄 License

MIT


project-root/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   └── assetController.ts
│   ├── middleware/
│   │   └── upload.ts
│   ├── models/
│   │   ├── Asset.ts
│   │   └── User.ts
│   ├── routes/
│   │   └── asset.routes.ts
│   ├── types/
│   │   └── Asset.ts
│   ├── server.ts 
│   └── app.ts
├── package.json
├── tsconfig.json
├── .env
├── .gitignore
└── dist/          