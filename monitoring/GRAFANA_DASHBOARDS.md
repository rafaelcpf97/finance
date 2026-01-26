# Recommended Grafana Dashboards

This document lists popular Grafana dashboards you can import from grafana.com to visualize your metrics.

## How to Import Dashboards

1. Go to Grafana: http://localhost:3030
2. Click **"+"** → **"Import dashboard"**
3. Enter the **Dashboard ID** or upload the JSON file
4. Select **Prometheus** as the data source
5. Click **"Import"**

## Recommended Dashboards

### 1. Node Exporter Full (Host Metrics)
**Dashboard ID: `1860`**

- **What it shows**: Complete host-level metrics (CPU, memory, disk, network, load average)
- **Best for**: Monitoring server/system resources
- **URL**: https://grafana.com/grafana/dashboards/1860

**Metrics used**:
- `node_cpu_seconds_total`
- `node_memory_MemTotal_bytes`
- `node_disk_io_time_seconds_total`
- `node_network_receive_bytes_total`
- And many more...

---

### 2. Docker Container & Host Metrics
**Dashboard ID: `179`**

- **What it shows**: Docker container metrics from cAdvisor (CPU, memory, network, I/O per container)
- **Best for**: Monitoring individual containers
- **URL**: https://grafana.com/grafana/dashboards/179

**Metrics used**:
- `container_cpu_usage_seconds_total`
- `container_memory_usage_bytes`
- `container_network_receive_bytes_total`
- `container_network_transmit_bytes_total`

---

### 3. Prometheus Stats
**Dashboard ID: `2`**

- **What it shows**: Prometheus server health and performance metrics
- **Best for**: Monitoring Prometheus itself
- **URL**: https://grafana.com/grafana/dashboards/2

---

### 4. HTTP Request Rate and Duration
**Dashboard ID: `11719`** or **`14958`**

- **What it shows**: HTTP request rates, durations, error rates
- **Best for**: Monitoring your application HTTP metrics
- **URL**: 
  - https://grafana.com/grafana/dashboards/11719
  - https://grafana.com/grafana/dashboards/14958

**Note**: You may need to adjust metric names to match your custom metrics:
- `http_requests_total` → `*_http_requests_total` (monolith_http_requests_total, api_gateway_http_requests_total, etc.)
- `http_request_duration_seconds` → `*_http_request_duration_seconds`

---

### 5. Node Exporter for Prometheus
**Dashboard ID: `11074`**

- **What it shows**: Comprehensive Node Exporter metrics with better organization
- **Best for**: Alternative to dashboard 1860 with different visualization style
- **URL**: https://grafana.com/grafana/dashboards/11074

---

### 6. Docker Monitoring
**Dashboard ID: `893`**

- **What it shows**: Docker container monitoring with cAdvisor
- **Best for**: Another option for container metrics
- **URL**: https://grafana.com/grafana/dashboards/893

---

### 7. Kubernetes / Docker / Container Metrics
**Dashboard ID: `8588`**

- **What it shows**: Container metrics with nice visualizations
- **Best for**: Modern container monitoring
- **URL**: https://grafana.com/grafana/dashboards/8588

---

## Custom Application Metrics Dashboards

Since your application exposes custom metrics with prefixes (e.g., `monolith_http_requests_total`, `api_gateway_http_requests_total`), you can:

### Option 1: Use a Generic HTTP Dashboard and Modify Queries

Import dashboard **11719** or **14958** and modify the PromQL queries to match your metric names:

**Example modifications**:
```promql
# Original
sum(rate(http_requests_total[5m])) by (job)

# Modified for your metrics
sum(rate({__name__=~".*_http_requests_total"}[5m])) by (job)
```

### Option 2: Create Custom Dashboard

Use the queries from `monitoring/QUICKSTART.md` to create your own dashboard with panels for:
- HTTP Request Rate
- HTTP Request Duration (p95, p99)
- HTTP Error Rate
- Service-specific metrics

---

## Quick Import Commands

You can also import dashboards via Grafana API or by downloading JSON:

1. **Download JSON**: Visit the dashboard page on grafana.com and click "Download JSON"
2. **Import JSON**: In Grafana, go to "+" → "Import" → "Upload JSON file"

---

## Dashboard Compatibility

| Dashboard ID | Works Out of Box | Needs Modification |
|--------------|------------------|-------------------|
| 1860 (Node Exporter) | ✅ Yes | No |
| 179 (Docker/cAdvisor) | ✅ Yes | No |
| 2 (Prometheus Stats) | ✅ Yes | No |
| 11719 (HTTP Metrics) | ⚠️ Partial | Yes - adjust metric names |
| 11074 (Node Exporter) | ✅ Yes | No |
| 893 (Docker) | ✅ Yes | No |
| 8588 (Containers) | ✅ Yes | No |

---

## Tips

1. **Start with Node Exporter (1860) and Docker (179)** - These work immediately
2. **For HTTP metrics**, create custom panels using the queries in `QUICKSTART.md`
3. **Combine dashboards** - Import multiple dashboards and organize them in folders
4. **Save as favorites** - Star dashboards you use frequently
5. **Create variables** - Use Grafana variables to filter by service, job, etc.

---

## Example: Creating a Custom Application Dashboard

1. Create new dashboard: "+" → "Create" → "Dashboard"
2. Add panels with these queries:

**HTTP Request Rate**:
```promql
sum(rate({__name__=~".*_http_requests_total"}[5m])) by (job)
```

**HTTP Request Duration (p95)**:
```promql
histogram_quantile(0.95, sum(rate({__name__=~".*_http_request_duration_seconds_bucket"}[5m])) by (le, job))
```

**HTTP Error Rate**:
```promql
sum(rate({__name__=~".*_http_requests_total",status_code=~"5.."}[5m])) by (job)
```

**Container CPU Usage**:
```promql
rate(container_cpu_usage_seconds_total{name=~"finance.*|api-gateway|user-service|wallet-service|transaction-service|notification-service"}[5m]) * 100
```

**Container Memory Usage**:
```promql
container_memory_usage_bytes{name=~"finance.*|api-gateway|user-service|wallet-service|transaction-service|notification-service"} / 1024 / 1024
```

---

## Resources

- **Grafana Dashboard Library**: https://grafana.com/grafana/dashboards/
- **PromQL Documentation**: https://prometheus.io/docs/prometheus/latest/querying/basics/
- **Grafana Documentation**: https://grafana.com/docs/grafana/latest/dashboards/
