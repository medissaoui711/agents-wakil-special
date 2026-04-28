#!/bin/bash

# Deployment script for Wakalat
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
echo "🚀 Deploying Wakalat to $ENVIRONMENT..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
command -v docker >/dev/null 2>&1 || { print_error "Docker is required but not installed. Aborting."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { print_error "Docker Compose is required but not installed. Aborting."; exit 1; }

print_status "Prerequisites check passed"

# Create necessary directories
mkdir -p data
print_status "Created data directory"

# Build and start containers
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Building for production..."
    docker-compose -f docker-compose.yml up --build -d
else
    print_status "Building for development..."
    docker-compose up --build -d
fi

# Wait for services to be healthy
print_status "Waiting for services to start..."
sleep 10

# Health checks
echo ""
echo "🔍 Running health checks..."

# Check backend
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    print_status "Backend is healthy"
else
    print_error "Backend health check failed"
    exit 1
fi

# Check frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    print_status "Frontend is accessible"
else
    print_error "Frontend health check failed"
    exit 1
fi

echo ""
echo "================================"
print_status "Deployment successful! 🎉"
echo "================================"
echo ""
echo "📱 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop: docker-compose down"
echo "   Restart: docker-compose restart"
echo ""
echo "📚 Next steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Register a new account or login"
echo "   3. Explore the agent network!"
echo ""
