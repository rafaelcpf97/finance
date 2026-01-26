#!/bin/bash

# Monitoring Stack Setup Script
# This script helps set up the monitoring infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

print_info "Setting up monitoring stack..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if finance-network exists
if ! docker network inspect finance-network > /dev/null 2>&1; then
    print_warning "finance-network does not exist. Creating it..."
    docker network create finance-network
    print_info "Created finance-network"
else
    print_info "finance-network already exists"
fi

# Start monitoring stack
print_info "Starting monitoring stack..."
cd "$SCRIPT_DIR"
docker-compose up -d

# Wait for services to be ready
print_info "Waiting for services to start..."
sleep 5

# Check service status
print_info "Checking service status..."
docker-compose ps

print_info ""
print_info "Monitoring stack is ready!"
print_info ""
print_info "Access the services:"
print_info "  - Grafana:     http://localhost:3030 (admin/admin)"
print_info "  - Prometheus:  http://localhost:9090"
print_info "  - cAdvisor:    http://localhost:8080"
print_info ""
print_warning "Remember to change the default Grafana password after first login!"
