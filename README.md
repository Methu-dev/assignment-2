# Vehicle Rental Management System

A comprehensive RESTful API for managing vehicle rentals, built with **TypeScript**, **Express.js**, and **PostgreSQL**. This system provides complete functionality for admin vehicle management, customer bookings, and rental tracking.

##  Live URL

 **Note**: Configure and deploy to your hosting platform (Heroku, AWS, DigitalOcean, etc.)

 Local Development: `http://localhost:5000` (or set `PORT` environment variable)

##  Features

### Core Modules

#### Authentication Module

- User registration with role-based access (admin/customer)
- Secure JWT-based authentication
- Login/logout functionality
- Password hashing with bcrypt
- Role-based authorization middleware

#### Vehicle Management

- Admin can create, read, update, and delete vehicles
- Vehicle types: Car, Bike, Van, SUV
- Real-time availability status tracking
- Daily rental price management
- Unique registration number enforcement

####  User Management

- User profile retrieval and updates
- Admin can view all users
- Customers can only update their own profiles
- User deletion with active booking validation

#### Booking System

- Create bookings with automatic price calculation
- Multiple booking status tracking (active, cancelled, returned)
- Customer can view and cancel their own bookings
- Admin can mark bookings as returned
- Automatic vehicle availability updates
- Date validation (end date must be after start date)
- Prevention of double-booking vehicles

## Technology Stack

| Category           | Technology              |
| ------------------ | ----------------------- |
| **Runtime**        | Node.js (v24+)          |
| **Language**       | TypeScript 5.3+         |
| **Framework**      | Express.js 4.18+        |
| **Database**       | PostgreSQL 12+          |
| **Authentication** | JWT (jsonwebtoken 9.0+) |
| **Security**       | bcrypt 5.1+             |
| **Dev Tools**      | ts-node, TypeScript     |

# Prerequisites

- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **PostgreSQL**: v12 or higher (optional for local development with in-memory fallback)
- **Git**: for version control

## Setup & Installation

### 1. Clone Repository

```bash
git clone https://github.com/ZakariaZack98/L2-vehicle-rental.git
cd L2-vehicle-rental
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/vehicle_rental_db

# JWT Secret (min 32 characters recommended)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long

# Server Port (default: 5000)
PORT=5000

# Node Environment
NODE_ENV=development
```

**For Local Development (without PostgreSQL):**

- Omit `DATABASE_URL` to use in-memory database fallback
- Omit `JWT_SECRET` to use development default
- The system will warn you that these are development-only configurations

### 4. Database Setup (PostgreSQL)

If using PostgreSQL, create the database and run migrations:

```bash
# Create database
createdb vehicle_rental_db

# Run the application - it will auto-create tables
npm run dev
```

The application automatically creates required tables on startup:

- `users` - User accounts with roles
- `vehicles` - Available vehicles for rental
- `bookings` - Rental bookings and history

## Usage Instructions

### Development Server

```bash
# Start with default port (5000)
npm run dev

# Start with custom port
PORT=3000 npm run dev
```

The server will start and automatically initialize the database schema.

**Output:**

```
Database tables initialized successfully
Server is running on port 5000
```

### Build for Production

```bash
npm run build
npm start
```

### Running Tests

#### Service Layer Tests (Direct)

Tests the core business logic without HTTP:

```bash
npx ts-node scripts/test-users-vehicles.ts
npx ts-node scripts/test-bookings-direct.ts
```

#### API Endpoint Tests (cURL)

Tests the HTTP API with real requests:

```bash
# Start server first
PORT=5000 npm run dev &

# Run endpoint tests
bash scripts/test-api-endpoints.sh
bash scripts/test-booking-curl.sh
```

## API Endpoints

### Authentication Endpoints

```
POST   /api/v1/auth/signup          Register new user
POST   /api/v1/auth/signin          Login and get JWT token
```

### Vehicle Endpoints

```
GET    /api/v1/vehicles             Get all vehicles (public)
GET    /api/v1/vehicles/:vehicleId  Get vehicle by ID (public)
POST   /api/v1/vehicles             Create vehicle (admin only)
PUT    /api/v1/vehicles/:vehicleId  Update vehicle (admin only)
DELETE /api/v1/vehicles/:vehicleId  Delete vehicle (admin only)
```

### User Endpoints

```
GET    /api/v1/users                Get all users (admin only)
PUT    /api/v1/users/:userId        Update user (authenticated)
DELETE /api/v1/users/:userId        Delete user (admin only)
```

### Booking Endpoints

```
GET    /api/v1/bookings             Get bookings (customer sees own, admin sees all)
POST   /api/v1/bookings             Create booking (authenticated)
PUT    /api/v1/bookings/:bookingId  Cancel or return booking (authenticated)
```

## Authentication Usage

Include JWT token in requests:

```bash
curl -X GET http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Example Workflows

### User Registration & Login

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "phone": "01712345678",
    "role": "customer"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Create a Booking

```bash
curl -X POST http://localhost:5000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "customer_id": 1,
    "vehicle_id": 1,
    "rent_start_date": "2025-12-15",
    "rent_end_date": "2025-12-20"
  }'
```

### Cancel a Booking

```bash
curl -X PUT http://localhost:5000/api/v1/bookings/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status": "cancelled"}'
```

## Project Structure

```
src/
├── app.ts                          Main Express app setup
├── server.ts                       Server entry point
├── config/
│   ├── database.ts                 Database connection & in-memory fallback
│   └── schema.ts                   Database schema initialization
├── middleware/
│   ├── auth.ts                     JWT authentication & authorization
│   └── globalErrorHandler.ts       Global error handler
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts      Signup/signin logic
│   │   ├── auth.service.ts         User registration & password hashing
│   │   └── auth.routes.ts          Auth endpoints
│   ├── users/
│   │   ├── users.controller.ts     User management logic
│   │   ├── users.service.ts        User DB operations
│   │   └── users.routes.ts         User endpoints
│   ├── vehicles/
│   │   ├── vehicles.controller.ts  Vehicle management logic
│   │   ├── vehicles.service.ts     Vehicle DB operations
│   │   └── vehicles.routes.ts      Vehicle endpoints
│   └── bookings/
│       ├── bookings.controller.ts  Booking logic
│       ├── bookings.service.ts     Booking DB operations
│       └── bookings.routes.ts      Booking endpoints
└── utils/
    ├── jwt.ts                      JWT token generation & verification
    └── password.ts                 Password hashing & comparison

scripts/
├── test-api-endpoints.sh           API endpoint tests (vehicles & users)
├── test-booking-curl.sh            Booking API endpoint tests
├── test-users-vehicles.ts          Service layer tests
└── test-bookings-direct.ts         Direct booking service tests
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "User-friendly error message",
  "errors": "Detailed error information"
}
```

**HTTP Status Codes:**

- `200` - Successful GET/PUT
- `201` - Successful POST (resource created)
- `400` - Bad request (validation error)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found (resource doesn't exist)
- `500` - Server error

## Security Features

-  Password hashing with bcrypt (10 salt rounds)
-  JWT token-based authentication (7-day expiration)
-  Role-based access control (RBAC)
-  SQL injection prevention via parameterized queries
-  Authorization middleware for protected routes
-  Input validation on all endpoints

## Database Schema

### Users Table

```sql
- id (PRIMARY KEY)
- name (VARCHAR)
- email (UNIQUE)
- password (hashed)
- phone (VARCHAR)
- role (admin/customer)
- created_at (TIMESTAMP)
```

### Vehicles Table

```sql
- id (PRIMARY KEY)
- vehicle_name (VARCHAR)
- type (car/bike/van/SUV)
- registration_number (UNIQUE)
- daily_rent_price (DECIMAL)
- availability_status (available/booked)
- created_at (TIMESTAMP)
```

### Bookings Table

```sql
- id (PRIMARY KEY)
- customer_id (FOREIGN KEY → users)
- vehicle_id (FOREIGN KEY → vehicles)
- rent_start_date (DATE)
- rent_end_date (DATE)
- total_price (DECIMAL)
- status (active/cancelled/returned)
- created_at (TIMESTAMP)
```

## Development Notes

### In-Memory Database (Development)

When `DATABASE_URL` is not set, the system uses an in-memory fallback database. This is **development-only** and data will be lost on server restart.

### Default JWT Secret

If `JWT_SECRET` is not set, a development default is used. A warning is logged to the console.

** For Production:**

- Always set `DATABASE_URL` to a production PostgreSQL instance
- Always set a secure, unique `JWT_SECRET` (minimum 32 characters)
- Set `NODE_ENV=production`

## Documentation

- **API Documentation**: Test with provided curl scripts
- **Service Tests**: See `scripts/` directory for direct service testing
- **Module Documentation**: Inline comments in controller and service files

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

##  License

This project is licensed under the ISC License - see `package.json` for details.

##  Author

**Methu Islam**  
Email: engmethu@gmail.com  
GitHub: https://github.com/Methu-dev (https://github.com/Methu-dev/assignment-2)

---

## Troubleshooting

### Port Already in Use

```bash
# Use a different port
PORT=3000 npm run dev
```

### Database Connection Error

```bash
# Check PostgreSQL is running
# Linux/Mac: pg_isready
# Windows: Check Services or use psql to test

# Or use development mode (without DATABASE_URL)
npm run dev  # Will use in-memory fallback
```

### JWT Token Errors

- Token expired: Login again to get a new token
- Invalid token: Ensure token is passed in Authorization header format: `Bearer <token>`

### CORS Issues

Add to your frontend requests:

```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

---

**Last Updated**: December 2025  
**Version**: v24.11.1

