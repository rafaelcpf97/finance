# Monitoring Stack - Prometheus + Grafana + cAdvisor

This directory contains the monitoring infrastructure for the Finance App, including Prometheus for metrics collection, Grafana for visualization, and cAdvisor for container metrics.

## Architecture

- **Prometheus**: Time-series database that scrapes metrics from all services
- **Grafana**: Visualization and dashboarding platform
- **cAdvisor**: Container metrics exporter
- **Node Exporter**: Host-level system metrics

## Prerequisites

- Docker and Docker Compose
- The finance-network Docker network will be created automatically by docker-compose

## Important Notes

⚠️ **Port Conflicts**: If you run both monolith and microservices simultaneously, they will both try to start monitoring services on the same ports (9090, 3001, 8080, 9100). Only one set of monitoring services will start successfully. This is expected behavior - you only need one monitoring stack running.

💡 **Tip**: If you want to monitor both architectures, start one at a time, or use the standalone monitoring stack and configure it to scrape both.

## Quick Start

**Note**: The monitoring stack is now automatically started when you run either the monolith or microservices docker-compose. You don't need to start it separately unless you want to run it standalone.

### Option 1: Automatic (Recommended)

The monitoring stack starts automatically with:
- **Microservices**: `cd microservices && docker-compose up -d`
- **Monolith**: `cd monolith && docker-compose up -d`

### Option 2: Standalone

If you want to run monitoring separately:
```bash
cd monitoring
docker-compose up -d
```

2. **Access the services:**
   - **Grafana**: http://localhost:3030 (admin/admin)
   - **Prometheus**: http://localhost:9090
   - **cAdvisor**: http://localhost:8080
   - **Node Exporter**: http://localhost:9100/metrics

3. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

## Configuration

### Prometheus

Prometheus is configured to scrape metrics from:
- Monolith application (port 3000)
- All microservices (API Gateway, User, Wallet, Transaction, Notification services)
- cAdvisor (container metrics)
- Node Exporter (host metrics)
- k6 (load testing metrics)

Configuration file: `prometheus/prometheus.yml`

### Grafana

Grafana is pre-configured with:
- Prometheus datasource (automatically configured)
- Finance App dashboard (automatically loaded)

Default credentials:
- Username: `admin`
- Password: `admin`

**Important**: Change the default password after first login!

### Metrics Endpoints

All services expose metrics at `/metrics`:
- Monolith: http://localhost:3000/metrics
- API Gateway: http://localhost:8000/metrics
- User Service: http://localhost:3001/metrics
- Wallet Service: http://localhost:3002/metrics
- Transaction Service: http://localhost:3003/metrics
- Notification Service: http://localhost:3004/metrics

## k6 Integration

To export k6 metrics to Prometheus during load tests:

```bash
# Set Prometheus remote write URL
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write

# Run tests (metrics will be exported automatically)
cd ../k6
./run-tests.sh monolith load
./run-tests.sh microservices load
```

k6 will push metrics to Prometheus using the remote write API.

## Available Metrics

### Application Metrics

- `*_http_requests_total`: Total HTTP requests by method, route, and status code
- `*_http_request_duration_seconds`: HTTP request duration histogram
- `*_http_requests_in_flight`: Current in-flight requests

### System Metrics (from cAdvisor)

- `container_cpu_usage_seconds_total`: CPU usage per container
- `container_memory_usage_bytes`: Memory usage per container
- `container_network_receive_bytes_total`: Network receive bytes
- `container_network_transmit_bytes_total`: Network transmit bytes

### k6 Metrics (when using remote write)

- `k6_http_reqs_total`: Total HTTP requests
- `k6_http_req_duration`: Request duration
- `k6_vus`: Virtual users
- `k6_iterations_total`: Total test iterations

## Dashboards

### Finance App Dashboard

The default dashboard includes:
- HTTP Request Rate
- HTTP Request Duration (p95)
- HTTP Error Rate
- Container CPU Usage
- Container Memory Usage
- Service Health Status
- Total Requests

### Recommended Dashboards from grafana.com

You can import popular dashboards from the Grafana dashboard library:

**Most Useful Dashboards**:
- **Node Exporter Full** (ID: `1860`) - Host/system metrics
- **Docker Container & Host Metrics** (ID: `179`) - Container metrics from cAdvisor
- **Prometheus Stats** (ID: `2`) - Prometheus server health

**How to Import**:
1. Go to Grafana → Dashboards → Import
2. Enter the Dashboard ID (e.g., `1860`)
3. Select Prometheus as the data source
4. Click Import

For a complete list of recommended dashboards and instructions, see [GRAFANA_DASHBOARDS.md](./GRAFANA_DASHBOARDS.md)

## Troubleshooting

### Prometheus can't scrape services

1. **Check if services are running:**
   ```bash
   docker ps
   ```

2. **Verify network connectivity:**
   ```bash
   docker network inspect finance-network
   ```

3. **Check Prometheus targets:**
   - Go to http://localhost:9090/targets
   - Verify all targets are "UP"

4. **For monolith running on host:**
   - If monolith runs on the host (not in Docker), Prometheus uses `host.docker.internal:3000`
   - On Linux, you may need to add `extra_hosts` to docker-compose.yml:
     ```yaml
     extra_hosts:
       - "host.docker.internal:host-gateway"
     ```

### Grafana can't connect to Prometheus

1. **Check if Prometheus is running:**
   ```bash
   docker-compose ps prometheus
   ```

2. **Verify datasource configuration:**
   - Go to Grafana → Configuration → Data Sources
   - Check that Prometheus URL is `http://prometheus:9090`

### Services not exposing metrics

1. **Verify prom-client is installed:**
   ```bash
   # In each service directory
   npm list prom-client
   ```

2. **Check if /metrics endpoint exists:**
   ```bash
   curl http://localhost:3000/metrics
   ```

3. **Rebuild services:**
   ```bash
   # For microservices
   cd ../microservices
   docker-compose build
   docker-compose up -d
   
   # For monolith
   cd ../monolith
   docker-compose build
   docker-compose up -d
   ```

## Stopping the Monitoring Stack

```bash
cd monitoring
docker-compose down
```

To also remove volumes (this will delete all stored metrics and Grafana data):
```bash
docker-compose down -v
```

## Data Retention

- **Prometheus**: 30 days (configured in docker-compose.yml)
- **Grafana**: Persistent (stored in Docker volume)

## Production Considerations

For production use, consider:

1. **Security:**
   - Change default Grafana credentials
   - Use authentication for Prometheus
   - Secure network access

2. **Scalability:**
   - Use Prometheus federation for multiple instances
   - Consider Thanos or Cortex for long-term storage
   - Use Grafana Cloud or self-hosted with proper scaling

3. **Alerting:**
   - Configure Alertmanager for Prometheus alerts
   - Set up Grafana alerting rules
   - Integrate with notification channels (Slack, PagerDuty, etc.)

4. **Resource Limits:**
   - Add resource limits to docker-compose.yml
   - Monitor Prometheus storage usage
   - Configure retention policies

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [cAdvisor Documentation](https://github.com/google/cadvisor)
- [k6 Prometheus Remote Write](https://k6.io/docs/results-output/real-time/prometheus-remote-write/)
