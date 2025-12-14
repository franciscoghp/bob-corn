# 🌽 Bob's Corn - Technical Challenge

A full-stack application for Bob's Corn store with rate limiting functionality. Built with Vue.js, Node.js, TypeScript, and PostgreSQL.

> 🚀 **Quick Start for Evaluators**: See below for setup in 5 minutes!

## 📋 Features

- **Rate Limiting**: Enforces a fair policy of 1 corn per client per ~59 seconds
- **Modern Frontend**: Beautiful, responsive UI built with Vue 3 and Tailwind CSS
- **Real-time Countdown**: Visual countdown timer showing when users can buy again
- **Statistics Tracking**: View total purchases and last purchase time
- **Type-Safe**: Full TypeScript implementation for both frontend and backend

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker Desktop (installed and running)
- **Database**: Docker (automatic setup)

**Manual Setup:**

See Database Setup Options below.


### Database Setup Options

#### Step 1: Choose Your Database Option

##### 🎯 RECOMMENDED for Evaluators: Docker Compose (Local, automatic)

1. **Install Docker Desktop** (if you don't have it): [docker.com](https://www.docker.com/products/docker-desktop)

2. **Make sure Docker Desktop is running**

3. **Start the database:**
   ```bash
   docker-compose up -d
   ```
   This creates and starts PostgreSQL automatically.

3. **To stop the database:**
   ```bash
   docker-compose down
   ```

4. **To stop and delete data:**
   ```bash
   docker-compose down -v
   ```


#### Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

**For Docker Compose:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bobs_corn
PORT=3000
NODE_ENV=development
```


#### Step 3: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Running the Application

**Development Mode:**

1. **Start the backend server** (from `backend/` directory)
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at `http://localhost:3000`
   - Database tables will be created automatically on first run
   - You should see: `✅ Database connection established` and `✅ Database schema initialized successfully`

2. **Start the frontend development server** (from `frontend/` directory)
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`
   - Open this URL in your browser to use the application

**Production Build:**

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview  # Preview the production build
```

## ✅ Verification

After configuring any of the database options, start the backend:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connection established
✅ Database schema initialized successfully
🌽 Bob's Corn API running on port 3000
```

If you see these messages, everything is working correctly.

1. **Backend working:** Visit `http://localhost:3000/health` - you should see `{"status":"ok",...}`
2. **Frontend working:** You should see the Bob's Corn interface
3. **Rate Limiting:** Try buying corn twice in a row - the second time should show error 429

## 🐛 Troubleshooting

### Error: "DATABASE_URL not set"
- Make sure you created the `.env` file in the `backend/` folder
- Verify the connection path is correct
- Copy `backend/env.example` to `backend/.env` and fill in the values

### Error: "Connection refused" or "ECONNREFUSED"
- Verify Docker is running: `docker ps`
- Start the container: `docker-compose up -d`
- Check logs: `docker-compose logs postgres`

### Error: "Cannot find module"
- Run `npm install` in both folders (backend and frontend)
- Make sure you're in the correct directory

### Frontend not connecting to backend
- Verify backend is running on port 3000
- Verify proxy in `vite.config.ts` points to `http://localhost:3000`

## 🏗️ Architecture

### Backend Structure
```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   │   ├── cornController.ts
│   │   └── statsController.ts
│   ├── db/              # Database configuration
│   │   └── connection.ts
│   ├── middleware/      # Express middleware
│   │   └── rateLimiter.ts
│   └── index.ts         # Application entry point
├── package.json
└── tsconfig.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── services/        # API service layer
│   │   └── api.ts
│   ├── App.vue          # Main component
│   ├── main.ts          # Application entry point
│   └── style.css        # Global styles
├── index.html
├── package.json
└── vite.config.ts
```

## 🔧 API Endpoints

### POST `/api/buy-corn`
Buy a corn. Rate limited to 1 per ~59 seconds per client.

**Headers:**
- `x-client-id`: Unique client identifier (required)

**Response (200):**
```json
{
  "success": true,
  "message": "🌽 Corn purchased successfully!",
  "purchase": {
    "id": 1,
    "purchasedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Response (429 - Too Many Requests):**
```json
{
  "error": "Too Many Requests",
  "message": "You can only buy 1 corn per minute. Please wait before trying again.",
  "retryAfter": 45
}
```

### GET `/api/stats/:clientId`
Get statistics for a specific client.

**Response (200):**
```json
{
  "clientId": "client_123",
  "totalPurchases": 5,
  "lastPurchase": "2024-01-01T12:00:00.000Z"
}
```

### GET `/health`
Health check endpoint.

**Response (200):**
```json
{
  "status": "ok"
}
```

## 🎯 Rate Limiting Strategy

The rate limiter enforces the business rule: **1 corn per client per ~59 seconds**.

**Implementation:**
- Uses `x-client-id` header for client identification (falls back to IP address)
- Checks database for purchases in the last 60 seconds
- Returns 429 status with `retryAfter` seconds if limit exceeded
- Uses PostgreSQL indexes for efficient queries

**Database Schema:**
```sql
CREATE TABLE corn_purchases (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_client_time ON corn_purchases(client_id, purchased_at DESC);
CREATE INDEX idx_client_id ON corn_purchases(client_id);
```

## 🧪 Testing

To test the rate limiting:

1. Open the frontend in your browser
2. Click "Buy Corn" button
3. Try clicking again immediately - you should see a 429 error
4. Wait for the countdown timer to reach 0 (~59 seconds)
5. You can now buy again

## 🛠️ Technologies Used

- **Frontend:**
  - Vue 3 (Composition API)
  - TypeScript
  - Tailwind CSS
  - Vite
  - Axios

- **Backend:**
  - Node.js
  - Express.js
  - TypeScript
  - PostgreSQL (pg)
  - CORS

## 📝 Notes

- Client IDs are stored in browser localStorage for persistence
- The rate limiter uses a "fail closed" strategy (denies requests if database check fails)
- Database connection pooling is configured for optimal performance
- The frontend automatically syncs with the backend rate limit status
- The database initializes automatically when starting the backend
- Rate limiting is 1 corn per ~59 seconds per client
- The countdown timer updates automatically in the frontend

## 🎨 Design Decisions

1. **Client Identification**: Uses `x-client-id` header for better control, with IP fallback
2. **Rate Limit Window**: Sliding 60-second window checked against database
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **UX**: Real-time countdown timer and visual feedback for all actions
5. **Type Safety**: Full TypeScript implementation for better developer experience

## 📄 License

ISC

