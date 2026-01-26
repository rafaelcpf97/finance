# k6 Performance Testing

This directory contains k6 performance test scripts for both the monolith and microservices architectures.

## Prerequisites

Install k6 on your system:

### macOS
```bash
brew install k6
```

### Linux
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Windows
```bash
choco install k6
```

Or download from: https://k6.io/docs/getting-started/installation/

## Directory Structure

```
k6/
├── README.md                    # This file
├── config/
│   ├── monolith.js             # Monolith test configuration
│   └── microservices.js        # Microservices test configuration
├── scripts/
│   ├── monolith/
│   │   ├── smoke.js            # Smoke test (light load)
│   │   ├── load.js             # Load test (normal load)
│   │   ├── stress.js           # Stress test (high load)
│   │   └── spike.js            # Spike test (sudden load)
│   └── microservices/
│       ├── smoke.js            # Smoke test (light load)
│       ├── load.js             # Load test (normal load)
│       ├── stress.js           # Stress test (high load)
│       └── spike.js            # Spike test (sudden load)
└── utils/
    └── helpers.js               # Shared utility functions
```

## Running Tests

### Before Running Tests

1. **Start the application** you want to test:
   - For monolith: `cd monolith && docker-compose up -d`
   - For microservices: `cd microservices && docker-compose up -d`

2. **Wait for services to be ready** (check health endpoints):
   - Monolith: `http://localhost:3000/api/users` (or health check)
   - Microservices: `http://localhost:8000/health`

### Quick Start (Using Helper Script)

The easiest way to run tests is using the provided helper script:

```bash
# Run smoke test on monolith
./run-tests.sh monolith smoke

# Run load test on microservices
./run-tests.sh microservices load

# Run stress test with custom URL
./run-tests.sh monolith stress http://localhost:3000
```

### Running Tests Directly with k6

#### Running Monolith Tests

```bash
# Smoke test (light load - 1 user for 30 seconds)
k6 run scripts/monolith/smoke.js

# Load test (normal load - 10 users for 1 minute)
k6 run scripts/monolith/load.js

# Stress test (high load - 50 users for 2 minutes)
k6 run scripts/monolith/stress.js

# Spike test (sudden load spikes)
k6 run scripts/monolith/spike.js
```

#### Running Microservices Tests

```bash
# Smoke test (light load - 1 user for 30 seconds)
k6 run scripts/microservices/smoke.js

# Load test (normal load - 10 users for 1 minute)
k6 run scripts/microservices/load.js

# Stress test (high load - 50 users for 2 minutes)
k6 run scripts/microservices/stress.js

# Spike test (sudden load spikes)
k6 run scripts/microservices/spike.js
```

### Custom Configuration

You can override the base URL and other settings using environment variables:

```bash
# Test monolith with custom URL
BASE_URL=http://localhost:3000 k6 run scripts/monolith/load.js

# Test microservices with custom URL
BASE_URL=http://localhost:8000 k6 run scripts/microservices/load.js
```

## Test Scenarios

All tests follow a realistic user flow:

1. **Create User** - Register a new user
2. **Get User** - Retrieve user information
3. **Get Balance** - Check wallet balance
4. **Deposit** - Add funds to wallet
5. **Transfer** - Transfer funds between users
6. **Get Transaction History** - View transaction history

## Understanding Results

k6 provides detailed metrics including:

- **http_req_duration**: Request duration (p50, p95, p99)
- **http_req_failed**: Failed request rate
- **iterations**: Total test iterations
- **vus**: Virtual users
- **data_sent/received**: Network traffic

### Key Metrics to Monitor

- **p95/p99 latency**: Should be under acceptable thresholds
- **Error rate**: Should be < 1% for production workloads
- **Throughput**: Requests per second (RPS)

## Performance Benchmarks

### Expected Performance (Reference)

**Monolith:**
- p95 latency: < 200ms for simple operations
- p95 latency: < 500ms for complex operations (transfers)
- Error rate: < 0.1%

**Microservices:**
- p95 latency: < 300ms for simple operations (accounting for network hops)
- p95 latency: < 800ms for complex operations (transfers with multiple services)
- Error rate: < 0.1%

*Note: Actual performance depends on hardware, network, and database configuration.*

## Troubleshooting

### Tests fail with connection errors
- Ensure the application is running and accessible
- Check that ports are not blocked by firewall
- Verify BASE_URL is correct

### High error rates
- Check application logs for errors
- Verify database connections
- Check if services are overloaded

### Tests run but no data
- Ensure test data is being created properly
- Check that UUIDs are valid
- Verify API endpoints are correct
