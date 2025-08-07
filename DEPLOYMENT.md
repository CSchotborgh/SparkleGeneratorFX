# Deployment Guide for SparkleGeneratorFX™

This guide covers deployment strategies and configurations for SparkleGeneratorFX™ across different environments.

## 🚀 Quick Deployment

### Replit Deployment (Recommended)

SparkleGeneratorFX™ is optimized for Replit deployment with automatic environment setup.

1. **Import to Replit**
```bash
# Fork the repository on GitHub first, then import to Replit
https://replit.com/github/yourusername/SparkleGeneratorFX
```

2. **Environment Setup**
Replit automatically detects and installs dependencies from `pyproject.toml`.

3. **Database Configuration**
```bash
# PostgreSQL is auto-configured in Replit
# No additional setup required
```

4. **Run the Application**
```bash
python main.py
```

The application will be available at your Replit URL (typically `https://yourusername-sparklegeneratorfx.replit.app`).

### Docker Deployment

For containerized deployment:

1. **Create Dockerfile**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY pyproject.toml .
RUN pip install -e .

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=main.py
ENV FLASK_ENV=production

# Run the application
CMD ["python", "main.py"]
```

2. **Build and Run**
```bash
# Build the image
docker build -t sparklegeneratorfx .

# Run with environment variables
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/dbname \
  sparklegeneratorfx
```

### Heroku Deployment

1. **Create Required Files**

`Procfile`:
```
web: python main.py
```

`runtime.txt`:
```
python-3.11.7
```

2. **Deploy to Heroku**
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Deploy
git push heroku main
```

### VPS/Cloud Server Deployment

For deployment on Ubuntu/Debian servers:

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip python3-venv nginx postgresql -y

# Create application user
sudo useradd -m -s /bin/bash sparklegfx
sudo su - sparklegfx
```

2. **Application Setup**
```bash
# Clone repository
git clone https://github.com/yourusername/SparkleGeneratorFX.git
cd SparkleGeneratorFX

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -e .
```

3. **Database Setup**
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE sparklegfx;
CREATE USER sparklegfx_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE sparklegfx TO sparklegfx_user;
\q
```

4. **Systemd Service**
Create `/etc/systemd/system/sparklegfx.service`:
```ini
[Unit]
Description=SparkleGeneratorFX Application
After=network.target

[Service]
Type=simple
User=sparklegfx
WorkingDirectory=/home/sparklegfx/SparkleGeneratorFX
Environment=DATABASE_URL=postgresql://sparklegfx_user:secure_password@localhost/sparklegfx
ExecStart=/home/sparklegfx/SparkleGeneratorFX/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

5. **Nginx Configuration**
Create `/etc/nginx/sites-available/sparklegfx`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /home/sparklegfx/SparkleGeneratorFX/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

6. **Start Services**
```bash
# Enable and start application
sudo systemctl enable sparklegfx
sudo systemctl start sparklegfx

# Enable nginx site
sudo ln -s /etc/nginx/sites-available/sparklegfx /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

## 🔧 Environment Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | SQLite file | Production |
| `FLASK_ENV` | Flask environment | `production` | No |
| `SECRET_KEY` | Flask secret key | Auto-generated | Production |
| `PORT` | Server port | `5000` | No |
| `HOST` | Server host | `0.0.0.0` | No |

### Production Configuration

```python
# config.py
import os

class ProductionConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'fallback-secret-key'
    DATABASE_URL = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
```

### Development Configuration

```python
class DevelopmentConfig:
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///dev.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = True
```

## 📊 Performance Optimization

### Production Optimizations

1. **Static File Serving**
```nginx
# Nginx configuration for static files
location /static {
    root /path/to/SparkleGeneratorFX;
    expires 1y;
    add_header Cache-Control "public, immutable";
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
}
```

2. **Database Optimization**
```python
# Database connection pooling
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True
)
```

3. **CDN Integration**
```html
<!-- Use CDN for external libraries -->
<script src="https://cdn.jsdelivr.net/npm/kaboom@3000.0.1/dist/kaboom.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
```

### Monitoring Setup

1. **Application Monitoring**
```python
# Add to main.py for basic monitoring
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

@app.before_request
def log_request_info():
    app.logger.info('Request: %s %s', request.method, request.url)
```

2. **Performance Metrics**
```javascript
// Client-side performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
            console.log(`${entry.name}: ${entry.duration}ms`);
        }
    });
});

performanceObserver.observe({entryTypes: ['measure']});
```

## 🔒 Security Configuration

### HTTPS Setup with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Security Headers

```nginx
# Nginx security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### Rate Limiting

```python
# Flask-Limiter for rate limiting
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["1000 per day", "100 per hour"]
)

@app.route('/api/presets', methods=['POST'])
@limiter.limit("5 per minute")
def create_preset():
    # Implementation
    pass
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -e .
    - name: Run tests
      run: |
        python -m pytest tests/
        
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U sparklegfx_user -d sparklegfx
```

2. **Port Already in Use**
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

3. **Permission Issues**
```bash
# Fix file permissions
sudo chown -R sparklegfx:sparklegfx /home/sparklegfx/SparkleGeneratorFX
sudo chmod +x /home/sparklegfx/SparkleGeneratorFX/main.py
```

### Log Analysis

```bash
# View application logs
sudo journalctl -u sparklegfx -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Load Balancer Setup**
```nginx
upstream sparklegfx_backend {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}

server {
    location / {
        proxy_pass http://sparklegfx_backend;
    }
}
```

2. **Database Replication**
```python
# Read/write splitting
SQLALCHEMY_DATABASE_URI = 'postgresql://user:pass@master:5432/db'
SQLALCHEMY_BINDS = {
    'read_only': 'postgresql://user:pass@replica:5432/db'
}
```

### Vertical Scaling

- **CPU**: Multi-core processing for physics calculations
- **Memory**: Optimize particle object pooling
- **Storage**: SSD for database performance
- **Network**: CDN for static assets

---

This deployment guide provides comprehensive instructions for deploying SparkleGeneratorFX™ in various environments while maintaining performance, security, and scalability.