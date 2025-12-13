# 🌽 Bob's Corn - Technical Challenge

A full-stack application for Bob's Corn store with rate limiting functionality. Built with Vue.js, Node.js, TypeScript, and PostgreSQL.

## 📋 Features

- **Rate Limiting**: Enforces a fair policy of 1 corn per client per minute
- **Modern Frontend**: Beautiful, responsive UI built with Vue 3 and Tailwind CSS
- **Real-time Countdown**: Visual countdown timer showing when users can buy again
- **Statistics Tracking**: View total purchases and last purchase time
- **Type-Safe**: Full TypeScript implementation for both frontend and backend

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Quick Setup

1. **Set up the database**
   ```sql
   CREATE DATABASE bobs_corn;
   ```

2. **Configure environment variables**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/bobs_corn
   PORT=3000
   NODE_ENV=development
   ```
   
   Replace `username`, `password`, and `localhost:5432` with your PostgreSQL credentials.

3. **Install dependencies**
   
   Backend:
   ```bash
   cd backend
   npm install
   ```
   
   Frontend:
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
Buy a corn. Rate limited to 1 per minute per client.

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

The rate limiter enforces the business rule: **1 corn per client per minute**.

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
4. Wait for the countdown timer to reach 0
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

## 🎨 Design Decisions

1. **Client Identification**: Uses `x-client-id` header for better control, with IP fallback
2. **Rate Limit Window**: Sliding 60-second window checked against database
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **UX**: Real-time countdown timer and visual feedback for all actions
5. **Type Safety**: Full TypeScript implementation for better developer experience

## 📄 License

ISC

