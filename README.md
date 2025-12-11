# Coworking Space Booking API

Backend API for a platform where users can book workspaces and conference rooms in a coworking space. Built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Role-based access control (User/Admin)
- Room management (CRUD operations)
- Booking system with availability checking
- Real-time updates using Socket.io
- Redis caching support

## Technologies

- **Node.js** & **Express** - Server framework
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time communication
- **Redis** - Caching (optional)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Coworking-booking-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
MONGO_URI=mongodb://localhost:27017/coworking-booking
JWT_SECRET=your-secret-key-change-this-in-production
REDIS_URL=redis://localhost:6379
PORT=3000
```

5. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### Authentication (`/api/auth`)

#### Register User
- **POST** `/api/auth/register`
- Body: `{ "username": "string", "password": "string", "role": "User|Admin" }`
- Response: User object and success message

#### Login
- **POST** `/api/auth/login`
- Body: `{ "username": "string", "password": "string" }`
- Response: JWT token and user info

### Rooms (`/api/rooms`)

#### Create Room (Admin only)
- **POST** `/api/rooms`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "name": "string", "capacity": number, "type": "workspace|conference" }`

#### Get All Rooms
- **GET** `/api/rooms`
- Response: List of all rooms

#### Update Room (Admin only)
- **PUT** `/api/rooms/:id`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "name": "string", "capacity": number, "type": "workspace|conference" }`

#### Delete Room (Admin only)
- **DELETE** `/api/rooms/:id`
- Headers: `Authorization: Bearer <token>`

### Bookings (`/api/bookings`)

#### Create Booking
- **POST** `/api/bookings`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "roomId": "string", "startTime": "ISO date", "endTime": "ISO date" }`
- Note: Checks room availability before creating booking

#### Get Bookings
- **GET** `/api/bookings`
- Headers: `Authorization: Bearer <token>`
- Response: User's bookings (or all bookings for Admin)

#### Update Booking
- **PUT** `/api/bookings/:id`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "roomId": "string", "startTime": "ISO date", "endTime": "ISO date" }` (all fields optional)
- Note: Checks room availability before updating. Users can only update their own bookings

#### Cancel Booking
- **DELETE** `/api/bookings/:id`
- Headers: `Authorization: Bearer <token>`
- Note: Users can only cancel their own bookings

## Socket.io Events

### Emitted Events

- **bookingCreated**: Emitted when a new booking is created
  - Payload: `{ bookingId, roomId, userId, startTime, endTime }`

- **bookingUpdated**: Emitted when a booking is updated
  - Payload: `{ bookingId, roomId, userId, startTime, endTime }`

- **bookingCancelled**: Emitted when a booking is cancelled
  - Payload: `{ bookingId, roomId, userId }`

## Database Models

### User
- `username` (String, unique, required)
- `password` (String, required, hashed)
- `role` (String, enum: ['User', 'Admin'], default: 'User')

### Room
- `name` (String, required)
- `capacity` (Number, required)
- `type` (String, enum: ['workspace', 'conference'], required)

### Booking
- `roomId` (ObjectId, ref: Room, required)
- `userId` (ObjectId, ref: User, required)
- `startTime` (Date, required)
- `endTime` (Date, required)

## Error Handling

The API includes comprehensive error handling for:
- Invalid credentials
- Unauthorized access
- Missing required fields
- Room availability conflicts
- Database errors

All errors return appropriate HTTP status codes and error messages.

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Role-based access control
- Input validation on all endpoints

## License

ISC
