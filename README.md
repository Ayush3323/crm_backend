# BR CRM Backend API

A comprehensive backend API for the BR CRM system built with Express.js and NoSQL file-based database.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete CRUD operations for users with different roles (Admin, Sub Admin, Manager, Employee)
- **Task Management**: Create, assign, track, and manage tasks with progress tracking
- **Machine Management**: Monitor and manage industrial machines with maintenance tracking
- **Analytics**: Comprehensive dashboard analytics and reporting
- **Security**: Password hashing, rate limiting, CORS protection, and input validation
- **NoSQL Database**: File-based JSON database using lowdb for easy setup and portability

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: NoSQL (lowdb with JSON file storage)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Security**: helmet, express-rate-limit
- **Logging**: morgan
- **File Upload**: multer
- **Email**: nodemailer

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd brcrm/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example config file
   cp config.env.example config.env
   
   # Edit config.env with your settings
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## Environment Variables

Create a `config.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (for password reset, notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Forgot password
- `PUT /api/auth/resetpassword/:resettoken` - Reset password

### Users (Admin/Sub Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/reset-password` - Reset user password

### Tasks
- `GET /api/tasks` - Get all tasks (with pagination and filtering)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task (Admin/Sub Admin/Manager)
- `PUT /api/tasks/:id` - Update task (Admin/Sub Admin/Manager)
- `DELETE /api/tasks/:id` - Delete task (Admin/Sub Admin)
- `PUT /api/tasks/:id/progress` - Update task progress
- `POST /api/tasks/:id/comments` - Add comment to task

### Machines
- `GET /api/machines` - Get all machines (with pagination and filtering)
- `GET /api/machines/:id` - Get single machine
- `POST /api/machines` - Create machine (Admin/Sub Admin/Manager)
- `PUT /api/machines/:id` - Update machine (Admin/Sub Admin/Manager)
- `DELETE /api/machines/:id` - Delete machine (Admin/Sub Admin)
- `PUT /api/machines/:id/status` - Update machine status
- `POST /api/machines/:id/maintenance` - Add maintenance record

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/tasks` - Get task analytics
- `GET /api/analytics/machines` - Get machine analytics
- `GET /api/analytics/users` - Get user analytics

## Database Schema

### User
```javascript
{
  id: String,
  name: String,
  email: String,
  password: String (hashed),
  role: String (Admin, Sub Admin, Manager, Employee),
  status: String (Active, Inactive, Suspended),
  avatar: String,
  department: String,
  phone: String,
  address: String,
  lastLogin: Date,
  emailVerified: Boolean,
  twoFactorEnabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```javascript
{
  id: String,
  title: String,
  description: String,
  assignedTo: String (user ID),
  employees: [String] (user IDs),
  deadline: Date,
  priority: String (Low, Medium, High, Urgent),
  status: String (Pending, In Progress, Completed, Cancelled),
  progress: Number (0-100),
  machine: String (machine ID),
  category: String,
  attachments: [String],
  comments: [{
    id: String,
    user: String (user ID),
    userName: String,
    comment: String,
    createdAt: Date
  }],
  createdBy: String (user ID),
  createdAt: Date,
  updatedAt: Date
}
```

### Machine
```javascript
{
  id: String,
  name: String,
  model: String,
  serialNumber: String,
  status: String (Operational, Maintenance, Repair, Offline),
  location: String,
  department: String,
  efficiency: Number (0-100),
  assignedTechnician: String (user ID),
  maintenance: {
    lastMaintenance: Date,
    nextMaintenance: Date,
    interval: Number (days)
  },
  specifications: Object,
  alerts: [String],
  maintenanceHistory: [{
    id: String,
    type: String,
    description: String,
    cost: Number,
    technician: String (user ID),
    technicianName: String,
    date: Date,
    status: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication & Authorization

### JWT Token
- Tokens are sent in the Authorization header: `Bearer <token>`
- Token expiration: 7 days (configurable)

### Role-Based Access Control
- **Admin**: Full access to all features
- **Sub Admin**: Full access except user deletion
- **Manager**: Can create/update tasks and machines, view analytics
- **Employee**: Can view assigned tasks, update progress, add comments

## Error Handling

The API uses centralized error handling with consistent error responses:

```javascript
{
  "success": false,
  "message": "Error description"
}
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express.js
- **Input Validation**: Request body validation
- **JWT Security**: Secure token generation and verification

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

### File Structure
```
backend/
├── config/
│   ├── database.js
│   └── config.env
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── taskController.js
│   ├── machineController.js
│   └── analyticsController.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Task.js
│   └── Machine.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── tasks.js
│   ├── machines.js
│   └── analytics.js
├── utils/
│   └── dbHelpers.js
├── data/
│   └── db.json (auto-generated)
├── uploads/
├── server.js
├── package.json
└── README.md
```

## Production Deployment

1. **Set environment variables** for production
2. **Update JWT_SECRET** to a strong, unique key
3. **Configure email settings** for password reset functionality
4. **Set up proper logging** and monitoring
5. **Use HTTPS** in production
6. **Regular backups** of the `data/db.json` file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License. 