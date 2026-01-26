# Finance App - Microservices Architecture

This is a microservices-based implementation of a digital wallet/payments application, designed for research comparing monolithic vs microservices architectures.

## Architecture Overview

The application consists of:

- **API Gateway** (`api-gateway`): Single entry point that routes requests to appropriate microservices
- **User Service** (`user-service`): Manages user data
- **Wallet Service** (`wallet-service`): Manages wallet balances
- **Transaction Service** (`transaction-service`): Orchestrates deposits and transfers
- **Notification Service** (`notification-service`): Manages user notifications

Each service has its own PostgreSQL database, and services communicate via HTTP.

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development, optional)

## Configuration

The `docker-compose.yml` file uses environment variables for configuration. You can:

1. **Use default values** (no configuration needed) - all services will use sensible defaults
2. **Create a `.env` file** in the project root to customize values:

```bash
# Copy the example file (if available) or create .env with:
POSTGRES_IMAGE=postgres:15-alpine
DB_USER=postgres
DB_PASSWORD=postgres
DB_INTERNAL_PORT=5432

# Database external ports
USERS_DB_PORT=5433
WALLET_DB_PORT=5434
TRANSACTION_DB_PORT=5435
NOTIFICATION_DB_PORT=5436

# Service ports
USER_SERVICE_PORT=3001
WALLET_SERVICE_PORT=3002
TRANSACTION_SERVICE_PORT=3003
NOTIFICATION_SERVICE_PORT=3004
API_GATEWAY_PORT=8080

# Network
NETWORK_NAME=finance-network

# Node environment
NODE_ENV=production

# Health check settings
HEALTHCHECK_INTERVAL=10s
HEALTHCHECK_TIMEOUT=5s
HEALTHCHECK_RETRIES=5
```

All variables have default values, so the system will work without a `.env` file.

## Quick Start

1. **Start all services:**
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build Docker images for all services
   - Start 4 PostgreSQL databases (one per service)
   - Start all microservices
   - Run database migrations automatically
   - Start the API Gateway on port 8080
   - **Automatically start the monitoring stack** (Prometheus, Grafana, cAdvisor, Node Exporter)

2. **Verify services are running:**
   ```bash
   # Check API Gateway
   curl http://localhost:8000/health
   
   # Check individual services
   curl http://localhost:3001/health  # User Service
   curl http://localhost:3002/health  # Wallet Service
   curl http://localhost:3003/health  # Transaction Service
   curl http://localhost:3004/health  # Notification Service
   ```

3. **Access monitoring dashboards:**
   - **Grafana**: http://localhost:3030 (admin/admin) - Visualization dashboards
   - **Prometheus**: http://localhost:9090 - Metrics collection
   - **cAdvisor**: http://localhost:8080 - Container metrics
   - **Node Exporter**: http://localhost:9100/metrics - Host metrics
   
   All services expose metrics at `/metrics` endpoint (e.g., `http://localhost:8000/metrics`)

## API Gateway Endpoints

The API Gateway exposes the following endpoints at `http://localhost:8080/api`:

### Users
- `POST /api/users` - Create a new user (also creates a wallet)
- `GET /api/users/:userId` - Get user by ID

### Wallets
- `GET /api/wallets/:userId/balance` - Get wallet balance
- `POST /api/wallets/:userId/deposit` - Deposit funds

### Transactions
- `POST /api/transactions/transfer` - Transfer money between users
  ```json
  {
    "fromUserId": "uuid",
    "toUserId": "uuid",
    "amount": 100.50
  }
  ```
- `GET /api/transactions/:userId?page=1&pageSize=20` - Get transaction history

### Notifications
- `GET /api/notifications/:userId?read=false` - Get notifications
- `PATCH /api/notifications/:notificationId/read` - Mark notification as read

## Front-end Integration

The existing React front-end from the monolith can be used with minimal changes. The front-end API client uses `/api` as the base URL, which should be configured to point to the API Gateway.

### Option 1: Development Proxy
Configure your front-end build tool (Vite/Webpack) to proxy `/api` requests to `http://localhost:8080/api`.

### Option 2: Update API Base URL
Update the front-end `client.ts` file to use the API Gateway URL:
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

### Option 3: Serve Front-end through API Gateway
Modify the API Gateway to serve static files (similar to the monolith) or use a reverse proxy like Nginx.

## Service Ports

### Application Services
- **API Gateway**: 8000
- **User Service**: 3001
- **Wallet Service**: 3002
- **Transaction Service**: 3003
- **Notification Service**: 3004

### Monitoring Services (started automatically)
- **Grafana**: 3030
- **Prometheus**: 9090
- **cAdvisor**: 8080
- **Node Exporter**: 9100

⚠️ **Note**: If you run both monolith and microservices, monitoring services will conflict on ports. Only one monitoring stack will start.

## Database Ports

- **users-db**: 5433
- **wallet-db**: 5434
- **transaction-db**: 5435
- **notification-db**: 5436

## Database Migrations

Migrations run automatically when services start via the Docker Compose command. To run migrations manually:

```bash
# For a specific service
docker-compose exec user-service npm run migrate
docker-compose exec wallet-service npm run migrate
docker-compose exec transaction-service npm run migrate
docker-compose exec notification-service npm run migrate
```

## Development

### Running Services Locally

Each service can be run locally for development:

```bash
# User Service
cd user-service
npm install
npm run migrate
npm run dev

# Wallet Service
cd wallet-service
npm install
npm run migrate
npm run dev

# Transaction Service
cd transaction-service
npm install
npm run migrate
npm run dev

# Notification Service
cd notification-service
npm install
npm run migrate
npm run dev

# API Gateway
cd api-gateway
npm install
npm run dev
```

Make sure to set appropriate environment variables (see `.env.example` files in each service directory, or use the values from `docker-compose.yml`).

## Project Structure

```
finance-app/
├── api-gateway/          # API Gateway service
│   ├── src/
│   │   ├── routes/       # Route definitions
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Service clients (HTTP calls to microservices)
│   │   └── middleware/  # Logging, error handling
│   └── Dockerfile
├── user-service/         # User microservice
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/     # Business logic
│   │   ├── repositories/ # Database access
│   │   └── database/migrations/
│   └── Dockerfile
├── wallet-service/       # Wallet microservice
├── transaction-service/  # Transaction microservice
├── notification-service/ # Notification microservice
├── docker-compose.yml    # Orchestration configuration
└── README.md
```

## Architecture Notes

### Service Communication
- Services communicate via synchronous HTTP calls
- The API Gateway aggregates responses from multiple services
- The Transaction Service orchestrates complex operations (transfers) by calling User, Wallet, and Notification services

### Data Consistency
- Each service maintains its own database
- Transactions are coordinated by the Transaction Service
- No distributed transactions are used (eventual consistency model)

### Error Handling
- Each service returns consistent error responses: `{ error: { message, statusCode } }`
- The API Gateway forwards errors from downstream services

### Logging
- Each service logs request method, path, status code, and duration
- Logs are prefixed with service name for easy identification

## Performance Considerations

This architecture is designed for research comparing:
- **Performance**: Latency differences between monolith and microservices
- **Scalability**: Ability to scale individual services independently
- **Operational Complexity**: Deployment, monitoring, and debugging overhead

### Instrumentation
All services include request logging with duration metrics. For detailed performance analysis, consider:
- Adding distributed tracing (e.g., OpenTelemetry)
- Adding metrics collection (e.g., Prometheus)
- Monitoring service health and response times

## Troubleshooting

### Services not starting
- Check database health: `docker-compose ps`
- Check service logs: `docker-compose logs <service-name>`
- Verify database connections in service logs

### Migration errors
- Ensure databases are healthy before services start
- Check migration files are present in each service
- Run migrations manually if needed (see above)

### Connection errors between services
- Verify all services are on the same Docker network (`finance-network`)
- Check service URLs in environment variables
- Ensure dependent services are started before dependent services

## Stopping Services

```bash
docker-compose down
```

To remove volumes (deletes all data):
```bash
docker-compose down -v
```

## License

This project is for research purposes.
