# Simple E-commerce Backend - Node.js & Express

A production-grade e-commerce backend API built with Node.js, Express, TypeScript, and Prisma. This project demonstrates best practices for building scalable e-commerce applications with comprehensive features including user authentication, product management, shopping cart, and order processing.

## 🚀 Features

- **User Management**: Registration, login, and profile management
- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin/User)
- **Product Management**: CRUD operations with full-text search capabilities
- **Shopping Cart**: Add, update, and remove items from cart
- **Order Management**: Complete order processing workflow
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Database**: Prisma ORM with relational database design
- **TypeScript**: Full type safety throughout the application

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Database** (PostgreSQL, MySQL, or SQLite)
- **Git**

## 🛠 Tech Stack

### Core Dependencies

| Package | Purpose |
|---------|---------|
| **express** | Fast, unopinionated web framework for Node.js |
| **@prisma/client** & **prisma** | Modern database toolkit and ORM |
| **typescript** | Static type checking for JavaScript |
| **jsonwebtoken** | JWT token generation and verification |
| **bcrypt** | Password hashing and verification |
| **zod** | Schema validation library |

### Security & Performance

| Package | Purpose |
|---------|---------|
| **helmet** | Security middleware for Express apps |
| **cors** | Cross-Origin Resource Sharing middleware |
| **express-rate-limit** | Rate limiting middleware |
| **compression** | Response compression middleware |

### Development Tools

| Package | Purpose |
|---------|---------|
| **ts-node-dev** | Development server with auto-restart |
| **nodemon** | Monitor for changes and restart server |
| **@types/*** | TypeScript type definitions |

### File Handling

| Package | Purpose |
|---------|---------|
| **multer** | Middleware for handling multipart/form-data (file uploads) |

## 📁 Project Structure

```
src/
├── controllers/     # Route handlers
├── middleware/      # Custom middleware functions
├── models/         # Database models (Prisma)
├── routes/         # API route definitions
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
├── validation/     # Zod validation schemas
└── index.ts        # Application entry point
```

## 🗄 Database Schema

The application includes the following main entities:

- **Users**: User authentication and profile information
- **Products**: Product catalog with details and pricing
- **Cart**: Shopping cart items for users
- **Orders**: Order management and history
- **Order-Product Relations**: Many-to-many relationship between orders and products

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd simple-ecommerce-backend-nodejs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="your-database-connection-string"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Server Configuration
PORT=3000
NODE_ENV=development

# Other configurations as needed
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
# Build the project
npm run build

# Start the production server
npm start
```

## 📚 API Routes

### Authentication Routes
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile

### Product Routes
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `GET /products/search` - Full-text search products
- `POST /products` - Create product (Admin only)
- `PUT /products/:id` - Update product (Admin only)
- `DELETE /products/:id` - Delete product (Admin only)

### Cart Routes
- `GET /cart` - Get user's cart items
- `POST /cart` - Add item to cart
- `PUT /cart/:id` - Update cart item
- `DELETE /cart/:id` - Remove item from cart

### Order Routes
- `GET /orders` - Get user's orders
- `POST /orders` - Create new order
- `GET /orders/:id` - Get order details
- `PUT /orders/:id` - Update order status (Admin only)

## 🔒 Authentication & Authorization

The application implements:

- **JWT-based authentication** for secure API access
- **Role-based authorization** (Admin/User permissions)
- **Password hashing** using bcrypt
- **Protected routes** with middleware validation

## 🔍 Key Features Implemented

### 1. Full-Text Search
Implemented using Prisma's full-text search capabilities for efficient product searching.

### 2. Input Validation
Using Zod schemas for robust request validation and type safety.

### 3. Error Handling
Comprehensive error handling with proper HTTP status codes and error messages.

### 4. Security Best Practices
- Helmet for security headers
- CORS configuration
- Rate limiting to prevent abuse
- Input sanitization and validation

## 🧪 Development Scripts

```bash
# Start development server with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run ESLint for code quality
npm run lint

# Format code with Prettier
npm run format
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

Ensure all necessary environment variables are set in your production environment:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `NODE_ENV=production`



---

**Happy Coding! 🚀**