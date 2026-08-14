# Finance Tracker - Deployment Guide

This guide covers deploying the Finance Tracker application using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Git (for cloning the repository)
- A domain name (optional, for production)

## Quick Start (Local Docker Deployment)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd finance-tracker
   ```

2. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your values:
   ```env
   SECRET_KEY=your-secure-random-secret-key
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

3. **Build and start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Documentation: http://localhost:8001/docs

## Production Deployment

### Option 1: Docker Compose (VPS/Cloud Server)

1. **Prepare the server**
   - Install Docker and Docker Compose
   - Ensure ports 80 and 8001 are available

2. **Configure environment variables**
   
   Create `.env` file with production values:
   ```env
   SECRET_KEY=<generate-a-secure-random-string>
   CORS_ORIGINS=https://your-domain.com
   DATABASE_URL=postgresql://postgres:your-password@db:5432/finance_tracker
   ```

3. **Update docker-compose.yml for production**
   - Change database passwords
   - Update CORS origins to your production domain
   - Consider adding SSL/TLS (see below)

4. **Deploy**
   ```bash
   docker-compose up -d --build
   ```

### Option 2: Separate Services (Recommended for Production)

#### Frontend Deployment (Vercel/Netlify)

1. **Build the frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to Vercel**
   - Connect your Git repository to Vercel
   - Set environment variable: `VITE_API_URL=https://your-backend-api.com/api`
   - Deploy

3. **Deploy to Netlify**
   - Connect your Git repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-api.com/api`

#### Backend Deployment (Render/Railway)

1. **Prepare backend**
   - Ensure all dependencies are in `requirements.txt`
   - Create `.env` file with production values

2. **Deploy to Render**
   - Connect your Git repository to Render
   - Select "Web Service"
   - Set environment variables:
     - `DATABASE_URL` (PostgreSQL connection string)
     - `SECRET_KEY` (generate a secure random string)
     - `CORS_ORIGINS` (your frontend URL)
   - Deploy

3. **Deploy to Railway**
   - Connect your Git repository to Railway
   - Add PostgreSQL service
   - Add Python service for backend
   - Configure environment variables

### Option 3: Cloud Platform (AWS/GCP/Azure)

#### AWS Deployment

1. **ECS (Elastic Container Service)**
   - Build and push Docker images to ECR
   - Create ECS task definitions
   - Set up Application Load Balancer
   - Configure RDS for PostgreSQL

2. **EC2 with Docker**
   - Launch EC2 instance
   - Install Docker and Docker Compose
   - Clone repository
   - Run `docker-compose up -d`

#### Google Cloud Deployment

1. **Cloud Run**
   - Build and push Docker images to GCR
   - Deploy services to Cloud Run
   - Use Cloud SQL for PostgreSQL

2. **Google Kubernetes Engine (GKE)**
   - Create Kubernetes cluster
   - Deploy using Kubernetes manifests
   - Configure Cloud SQL

## Database Setup

### PostgreSQL (Recommended for Production)

The docker-compose.yml includes a PostgreSQL service. To use it:

1. **Initialize the database**
   ```bash
   docker-compose up db
   ```

2. **Run migrations** (if using Alembic)
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

### SQLite (Development Only)

For development, you can use SQLite by setting:
```env
DATABASE_URL=sqlite:///./finance_tracker.db
```

## SSL/TLS Configuration (Production)

### Using Let's Encrypt with Nginx

1. **Install Certbot**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Obtain SSL certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal**
   Certbot automatically sets up renewal.

### Using Cloudflare

1. **Point your domain to Cloudflare**
2. **Enable SSL/TLS in Cloudflare dashboard**
3. **Use "Full" or "Full (Strict)" mode**

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finance_tracker

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=https://your-frontend-domain.com

# Server
HOST=0.0.0.0
PORT=8001

# Environment
ENVIRONMENT=production
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-domain.com/api
```

## Monitoring and Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Health Checks

- Backend health: `http://your-domain.com/health`
- API docs: `http://your-domain.com/docs`

## Backup and Restore

### Database Backup

```bash
# Backup
docker-compose exec db pg_dump -U postgres finance_tracker > backup.sql

# Restore
docker-compose exec -T db psql -U postgres finance_tracker < backup.sql
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v finance-tracker_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Restore volumes
docker run --rm -v finance-tracker_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change ports in docker-compose.yml
   - Or stop the conflicting service

2. **Database connection failed**
   - Check DATABASE_URL in .env
   - Ensure database service is running
   - Check network connectivity

3. **CORS errors**
   - Update CORS_ORIGINS to include your frontend URL
   - Check backend logs for CORS configuration

4. **Build failures**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild: `docker-compose build --no-cache`

## Security Best Practices

1. **Use strong secrets**
   - Generate secure random strings for SECRET_KEY
   - Use strong database passwords

2. **Enable HTTPS**
   - Use SSL/TLS for all connections
   - Redirect HTTP to HTTPS

3. **Regular updates**
   - Keep dependencies updated
   - Monitor security advisories

4. **Firewall configuration**
   - Only expose necessary ports
   - Use security groups (AWS) or firewall rules

5. **Database security**
   - Don't expose database port publicly
   - Use strong authentication
   - Regular backups

## Scaling

### Horizontal Scaling

1. **Load balancer**
   - Add a load balancer (Nginx, HAProxy, AWS ALB)
   - Deploy multiple backend instances

2. **Database scaling**
   - Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
   - Consider read replicas for read-heavy workloads

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Add caching (Redis)

## Support

For issues or questions:
- Check the logs: `docker-compose logs`
- Review API documentation: `/docs` endpoint
- Check environment variables configuration
