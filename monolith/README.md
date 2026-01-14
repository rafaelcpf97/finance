# Digital Wallet Monolith

A monolithic web application for a digital wallet/payments system, built to be easily migrated to microservices architecture later.

## Architecture

This application follows a clean, layered architecture:

- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + Express (JavaScript)
- **Database**: PostgreSQL with Knex.js query builder
- **Containerization**: Docker with multi-stage builds

### Project Structure

```
finance-monolith/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── api/           # API client
│   │   └── types/         # TypeScript types
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/        # Express routes
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access layer
│   │   ├── database/      # Migrations and seeds
│   │   ├── config/        # Configuration
│   │   └── middleware/    # Express middleware
│   └── package.json
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose setup
└── README.md
```

## Features

- User registration
- View wallet balance
- Deposit funds
- Transfer money between users
- View transaction history
- View and manage notifications

## Prerequisites

- Docker and Docker Compose
- (Optional) Node.js 20+ and npm for local development

## Running with Docker

### Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd finance-monolith
```

2. Build and run with Docker Compose:
```bash
docker-compose up --build
```

This will:
- Build the React frontend
- Build the Node.js backend
- Start PostgreSQL database
- Run database migrations
- Start the application

The application will be available at `http://localhost:3000`

### Environment Variables

The application uses the following environment variables (set in `docker-compose.yml`):

- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment (development/production)

## Local Development

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database connection details
```

4. Run migrations:
```bash
npm run migrate
```

5. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` with proxy to backend API.

4. Build for production:
```bash
npm run build
```

This will build the React app into `server/public/` for serving by Express.

## API Endpoints

### Users
- `POST /api/users` - Create a new user
- `GET /api/users/:userId` - Get user by ID

### Wallets
- `GET /api/wallets/:userId/balance` - Get wallet balance
- `POST /api/wallets/:userId/deposit` - Deposit funds

### Transactions
- `POST /api/transactions/transfer` - Transfer money between users
- `GET /api/transactions/:userId` - Get transaction history (supports `page` and `pageSize` query params)

### Notifications
- `GET /api/notifications/:userId` - Get user notifications (supports `read` query param)
- `PATCH /api/notifications/:notificationId/read` - Mark notification as read

## Database Schema

### Users
- `id` (UUID, primary key)
- `name` (string)
- `email` (string, unique)
- `created_at`, `updated_at` (timestamps)

### Wallets
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to users)
- `balance` (decimal)
- `created_at`, `updated_at` (timestamps)

### Transactions
- `id` (UUID, primary key)
- `type` (string: DEPOSIT, TRANSFER_OUT, TRANSFER_IN)
- `amount` (decimal)
- `wallet_from_id` (UUID, nullable, foreign key to wallets)
- `wallet_to_id` (UUID, foreign key to wallets)
- `status` (string: COMPLETED, FAILED)
- `created_at`, `updated_at` (timestamps)

### Notifications
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to users)
- `type` (string)
- `message` (text)
- `read` (boolean)
- `created_at`, `updated_at` (timestamps)

## Design Decisions

### Monolithic Architecture
- All services are in a single codebase for easy migration later
- Clear separation of concerns (routes → controllers → services → repositories)
- Single database for all entities

### Code Organization
- **Repositories**: Handle all database operations
- **Services**: Contain business logic and orchestration
- **Controllers**: Handle HTTP requests/responses
- **Routes**: Define API endpoints with validation

### Future Microservices Migration
The code is structured to easily split into:
- User Service (users, wallets)
- Transaction Service (transactions)
- Notification Service (notifications)

Each service can be extracted with minimal changes to the service layer.

## Testing

The application is designed to be load-tested. Request logging is implemented to track:
- HTTP method
- Request path
- Response status code
- Request duration

## License

MIT
