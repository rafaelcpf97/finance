# Quick Start Guide - Monitoring Stack

## Prerequisites

1. Docker and Docker Compose installed
2. Finance app services running (monolith or microservices)

## Step 1: Start Monitoring Stack

```bash
cd monitoring
./setup.sh
```

Or manually:
```bash
cd monitoring
docker-compose up -d
```

## Step 2: Verify Services

Check that all services are running:
```bash
docker-compose ps
```

You should see:
- prometheus (port 9090)
- grafana (port 3001)
- cadvisor (port 8080)
- node-exporter (port 9100)

## Step 3: Access Grafana

1. Open http://localhost:3030
2. Login with:
   - Username: `admin`
   - Password: `admin`
3. **Change the password** when prompted

## Step 4: Verify Metrics Collection

### Check Prometheus Targets

1. Open http://localhost:9090/targets
2. All targets should show as "UP"

### Check Service Metrics

Test that services are exposing metrics:
```bash
# Monolith
curl http://localhost:3000/metrics

# API Gateway
curl http://localhost:8000/metrics

# User Service
curl http://localhost:3001/metrics
```

## Step 5: Create Dashboard in Grafana

1. Go to Grafana → Dashboards → New Dashboard
2. Add panels with these Prometheus queries:

### HTTP Request Rate
```
sum(rate(http_requests_total[5m])) by (job)
```

### HTTP Request Duration (p95)
```
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, job))
```

### HTTP Error Rate
```
sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (job)
```

### Container CPU Usage
```
rate(container_cpu_usage_seconds_total{name=~"finance.*|api-gateway|user-service|wallet-service|transaction-service|notification-service"}[5m]) * 100
```

### Container Memory Usage
```
container_memory_usage_bytes{name=~"finance.*|api-gateway|user-service|wallet-service|transaction-service|notification-service"} / 1024 / 1024
```

## Step 6: Run k6 Tests with Metrics Export

```bash
# Set Prometheus remote write URL
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write

# Run tests
cd ../k6
./run-tests.sh monolith load
./run-tests.sh microservices load
```

k6 metrics will be pushed to Prometheus automatically.

## Troubleshooting

### Services not showing in Prometheus

1. **Check network connectivity:**
   ```bash
   docker network inspect finance-network
   ```

2. **Verify services are on the network:**
   - Microservices should be on `finance-network`
   - Monolith should be on `finance-network` if running in Docker
   - If monolith runs on host, Prometheus uses `host.docker.internal:3000`

3. **Check Prometheus logs:**
   ```bash
   docker-compose logs prometheus
   ```

### Metrics endpoint not working

1. **Verify prom-client is installed:**
   ```bash
   # In service directory
   npm list prom-client
   ```

2. **Rebuild services:**
   ```bash
   # Microservices
   cd ../microservices
   docker-compose build
   docker-compose up -d
   
   # Monolith
   cd ../monolith
   docker-compose build
   docker-compose up -d
   ```

## Next Steps

- Create custom dashboards for your specific needs
- Set up alerting rules in Prometheus
- Configure Grafana alerting for notifications
- Explore additional metrics and visualizations

For more details, see [README.md](./README.md)
