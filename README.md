## Stage 05 - Auth Middleware Implementation Guide

## Overview

This guide demonstrates how to create an authentication middleware that protects API routes using JWT tokens. The middleware will extract user information from JWT tokens sent in request headers and make it available to protected routes.

## Prerequisites

- Express.js application setup
- Prisma ORM configured
- JWT (jsonwebtoken) library installed
- Environment variables configured with JWT_SECRET

## Step 1: Create Unauthorized Exception

First, create a custom exception class to handle unauthorized access attempts.


**View file** &nbsp;|&nbsp;  [ open -> exceptions/unauthorized.ts  ](./src/exceptions/unauthorized.ts)

<br/>

## Step 2: Extend Express Request Type

Create type definitions to extend the Express Request object with a user property.

**View file** &nbsp;|&nbsp;  [ open -> types/express.d.ts  ](./src/types/express.d.ts)

<br/>

## Step 3: Implement Auth Middleware

Create the main authentication middleware with these key steps:

### Step 3.1: Extract Token from Headers

```typescript
// middleware/auth.ts
import * as JWT from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../exceptions/UnauthorizedException';
import { prismaClient } from '../lib/prisma';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Step 1: Extract token from authorization header
  const token = req.headers.authorization;
}
```

### Step 3.2: Validate Token Presence

```typescript
// Step 2: Check if token is present
if (!token) {
  return next(new UnauthorizedException("Unauthorized", "UNAUTHORIZED"));
}
```

### Step 3.3: Verify Token and Extract Payload

```typescript
try {
  // Step 3: Verify token and extract payload
  const payload = JWT.verify(token, process.env.JWT_SECRET!) as any;
  
  // Step 4: Get user from payload
  const user = await prismaClient.user.findFirst({
    where: {
      id: payload.userId
    }
  });

  // Check if user exists
  if (!user) {
    return next(new UnauthorizedException("Unauthorized", "UNAUTHORIZED"));
  }

  // Step 5: Attach user to request object
  req.user = user;
  
  // Continue to next middleware/controller
  next();
  
} catch (error) {
  // Token is malformed or invalid
  return next(new UnauthorizedException("Unauthorized", "UNAUTHORIZED"));
}
```

<br/>

**View file** &nbsp;|&nbsp;  [ open -> middleware/auth.ts  ](./src/middlewares/auth.ts)

<br/>

## Step 4: Create Protected Controller

Create a "getCurrentUser" controller that returns the current logged-in user information.

```typescript
// controllers/auth.ts
import { Request, Response } from 'express';

export const getCurrentUser = (req: Request, res: Response) => {
  // User is available from middleware
  res.json(req.user);
};
```

## Step 5: Define Protected Routes

Set up routes that use the auth middleware.

```typescript
// routes/auth.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getCurrentUser } from '../controllers/authController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/current-user', authMiddleware, errorHandler(getCurrentUser));

export default router;
```

### Authentication Flow

1. **Token Extraction**: Middleware extracts JWT token from `authorization` header
2. **Token Validation**: Verifies token signature and expiration using JWT_SECRET
3. **Payload Extraction**: Extracts user information (userId) from token payload
4. **User Lookup**: Queries database to fetch complete user information
5. **Request Enhancement**: Attaches user object to request for use in controllers
6. **Route Protection**: Only authenticated users can access protected routes

### Error Handling

The middleware handles several error scenarios:
- Missing authorization header
- Invalid or malformed JWT tokens
- Expired tokens
- User not found in database
- Database connection errors

### Security Considerations

- Always use HTTPS in production to protect tokens in transit
- Set appropriate JWT expiration times
- Consider implementing token refresh mechanisms
- Store JWT_SECRET securely using environment variables
- Validate token payload structure


<br/>

##

## Role-Based Access Control (RBAC) Extension

### Step 7: Adding Role Support to User Model

To implement role-based access control, first extend your Prisma user model with role support.

#### 7.1: Create Role Enum in Prisma Schema

```prisma
// schema.prisma
enum Role {
  ADMIN
  USER
}

model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  password String
  role     Role   @default(USER)
  // ... other fields
}
```

#### 7.2: Generate Migration

```bash
npx prisma migrate dev --name add_roles_to_user
```

#### 7.3: Update User Roles via Prisma Studio

1. Start Prisma Studio:
```bash
npx prisma studio
```

2. Navigate to `http://localhost:5555`
3. Open the User model
4. Edit any user record and change role from `USER` to `ADMIN`
5. Save the changes

### Step 8: Implement Role-Based Middleware

Create middleware to check user roles for specific operations.

```typescript
// middleware/admin.ts
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../exceptions/UnauthorizedException';
import { Role } from '@prisma/client';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Assumes authMiddleware has already run and attached user to request
  if (!req.user) {
    return next(new UnauthorizedException("Authentication required", "UNAUTHORIZED"));
  }

  // Check if user has admin role
  if (req.user.role !== Role.ADMIN) {
    return next(new UnauthorizedException("Admin access required", "FORBIDDEN"));
  }

  // User is admin, continue to next middleware/controller
  next();
};
```

### Step 9: Generic Role Checker Middleware

For more flexibility, create a generic role checker:

**Optional**

```typescript
// middleware/roleMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../exceptions/UnauthorizedException';
import { Role } from '@prisma/client';

export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedException("Authentication required", "UNAUTHORIZED"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new UnauthorizedException(`Access denied. Required roles: ${allowedRoles.join(', ')}`, "FORBIDDEN"));
    }

    next();
  };
};
```

### Step 10: Usage Examples

#### Protecting Admin-Only Routes

```typescript
// routes/productRoutes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { createProduct, updateProduct } from '../controllers/productController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// Only admins can create products
router.post('/products', 
  authMiddleware, 
  adminMiddleware, 
  errorHandler(createProduct)
);

// Only admins can update products
router.put('/products/:id', 
  authMiddleware, 
  adminMiddleware, 
  errorHandler(updateProduct)
);

export default router;
```



## Common Issues and Solutions

### TypeScript Errors
- Ensure proper type definitions for Express Request extension
- Use `as any` temporarily for JWT payload if strict typing causes issues

### Token Format
- Ensure frontend sends token in correct header format
- Consider supporting both `Bearer token` and direct token formats

### Database Queries
- Optimize user lookup queries with appropriate indexes
- Consider caching user information for better performance

### Role Management
- Implement proper role assignment workflows
- Consider role inheritance and permission cascading
- Audit role changes for security compliance

## Product CRUD Operations with Role-Based Access

### Step 11: Product Model Schema

First, update your Prisma schema to include a Product model with proper field types:

```prisma
// schema.prisma
model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String   @db.Text  // Required for MySQL to allow unlimited characters
  price       Float
  tags        String?  // Comma-separated values
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("products")
}
```

**Note**: The `@db.Text` annotation is specifically required for MySQL to handle unlimited characters. PostgreSQL treats regular `String` as text by default.

### Step 12: Product Controllers Implementation

#### 12.1: Update Product Controller

```typescript
// controllers/productController.ts
import { Request, Response } from 'express';
import { prismaClient } from '../lib/prisma';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ErrorCode } from '../exceptions/ErrorCode';

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = req.body;
    
    // Convert tags array to comma-separated string if provided
    if (product.tags) {
      product.tags = product.tags.join(',');
    }
    
    const updatedProduct = await prismaClient.product.update({
      where: {
        id: +req.params.id  // Type cast string to number
      },
      data: product
    });
    
    res.json(updatedProduct);
    
  } catch (error) {
    throw new NotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND);
  }
};
```

#### 12.2: Delete Product Controller (Assignment)

```typescript
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const deletedProduct = await prismaClient.product.delete({
      where: {
        id: +req.params.id
      }
    });
    
    res.json({ message: "Product deleted successfully", product: deletedProduct });
    
  } catch (error) {
    throw new NotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND);
  }
};
```

#### 12.3: List Products with Pagination

```typescript
export const listProducts = async (req: Request, res: Response) => {
  // Get total count for pagination
  const count = await prismaClient.product.count();
  
  // Get paginated products
  const products = await prismaClient.product.findMany({
    skip: req.query.skip ? +req.query.skip : 0,  // Type cast to number, default 0
    take: 5  // Hard-coded limit controlled by backend
  });
  
  res.json({
    count,
    data: products
  });
};
```

#### 12.4: Get Product by ID

```typescript
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prismaClient.product.findFirstOrThrow({
      where: {
        id: +req.params.id
      }
    });
    
    res.json(product);
    
  } catch (error) {
    throw new NotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND);
  }
};
```

#### 12.5: Create Product Controller (Admin Only)

```typescript
export const createProduct = async (req: Request, res: Response) => {
  const product = req.body;
  
  // Convert tags array to comma-separated string if provided
  if (product.tags) {
    product.tags = product.tags.join(',');
  }
  
  const newProduct = await prismaClient.product.create({
    data: product
  });
  
  res.json(newProduct);
};
```

### Step 13: Product Routes with Role Protection

```typescript
// routes/productRoutes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  listProducts, 
  getProductById 
} from '../controllers/productController';
import { errorHandler } from '../middleware/errorHandler';

const productsRouters = Router();

// Public routes (no authentication required)
productsRouters.get('/products', errorHandler(listProducts));           // GET /products
productsRouters.get('/products/:id', errorHandler(getProductById));    // GET /products/:id

// Admin-only routes (authentication + admin role required)
productsRouters.post('/products', 
  authMiddleware, 
  adminMiddleware, 
  errorHandler(createProduct)
);                                                             // POST /products

productsRouters.put('/products/:id', 
  authMiddleware, 
  adminMiddleware, 
  errorHandler(updateProduct)
);                                                             // PUT /products/:id

productsRouters.delete('/products/:id', 
  authMiddleware, 
  adminMiddleware, 
  errorHandler(deleteProduct)
);                                                             // DELETE /products/:id

export default productsRouters;
```

### Step 14: Exception Handling

Create a NotFoundException for product-related errors:

```typescript
// exceptions/not-found.ts
export class NotFoundException extends HttpException {
  constructor(message: string, errorCode: ErrorCode) {
    super(message, errorCode, 404, null);
  }
}

```

### Step 15: API Testing Examples

#### Using Postman

**1. Create Product (Admin Only)**
```
POST /products
Headers: 
  authorization: your_admin_jwt_token
  Content-Type: application/json
Body:
{
  "name": "Sample Product",
  "description": "Product description",
  "price": 99.99,
  "tags": ["electronics", "gadgets"]
}
```

**2. Update Product (Admin Only)**
```
PUT /products/46
Headers: 
  authorization: your_admin_jwt_token
  Content-Type: application/json
Body:
{
  "price": 100
}
```

**3. List Products (Public)**
```
GET /products?skip=5
```

**4. Get Product by ID (Public)**
```
GET /products/50
```

**5. Delete Product (Admin Only)**
```
DELETE /products/46
Headers: 
  authorization: your_admin_jwt_token
```

### Pagination Details

The pagination system works as follows:
- **skip**: Number of records to skip (for page offset)
- **take**: Number of records to return (hard-coded to 5)
- **count**: Total number of products (for frontend pagination logic)

**Examples:**
- Page 1: `skip=0` (or omit skip parameter)
- Page 2: `skip=5`
- Page 3: `skip=10`

### Data Transformation Notes

**Tags Handling:**
- Frontend sends: `["electronics", "gadgets"]`
- Backend stores: `"electronics,gadgets"`
- This allows flexible tag management while maintaining simple string storage

**Type Casting:**
- URL parameters (`req.params.id`) are always strings
- Database expects numbers for ID fields
- Use `+req.params.id` or `parseInt(req.params.id)` for conversion
