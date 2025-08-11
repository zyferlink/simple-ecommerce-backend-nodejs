## Stage 04 - Error Handling Implementation

## Overview
This stage implements comprehensive error handling for the backend API using custom exception classes, validation, and generic error handling patterns.

## Features Implemented
- Custom HTTP exception classes
- Error codes enumeration
- Input validation using Zod
- Generic error handler function
- Express error middleware
- Different exception types (BadRequest, NotFound, UnprocessableEntity, InternalException)

## File Structure
```
src/
├── exceptions/
│   ├── root.ts              # Base HTTP exception class and 
│   ├── bad-request.ts       # 400 Bad Request exception
│   ├── not-found.ts         # 404 Not Found exception
│   ├── validation.ts        # 422 Unprocessable Entity 
│   └── internal-exception.ts # 500 Internal Server Error 
├── middlewares/
│   └── errors.ts            # Error handling middleware
├── schemas/
│   └── users.ts             # Zod validation schemas
├── error-handler.ts         # Generic error handler 
└── controllers/
    └── auth.ts              # Updated controllers 
```

## Step-by-Step Implementation

### 1. Install Dependencies
```bash
npm install zod
```

### 2. Create Base Exception Class (`src/exceptions/root.ts`)
- Create `HTTPException` class extending JavaScript's `Error` class
- Properties:
  - `message: string` - Error message
  - `errorCode: number` - Unique error identifier for frontend
  - `statusCode: number` - HTTP status code
  - `errors: any` - Additional error details
- Create `ErrorCodes` enum with:
  - `USER_NOT_FOUND = 1001`
  - `USER_ALREADY_EXISTS = 1002`
  - `INCORRECT_PASSWORD = 1003`
  - `UNPROCESSABLE_ENTITY = 2001`
  - `INTERNAL_EXCEPTION = 3001`

### 3. Create Specific Exception Classes

#### Bad Request Exception (`src/exceptions/bad-request.ts`)
- Extends `HTTPException`
- Status code: 400
- Used for client-side errors

**View file** &nbsp;|&nbsp;  [ open -> bad-request.ts  ](./src/exceptions/bad-request.ts)

##

#### Not Found Exception (`src/exceptions/not-found.ts`)
- Extends `HTTPException`
- Status code: 404
- Used when resources don't exist

**View file** &nbsp;|&nbsp;  [ open -> not-found.ts  ](./src/exceptions/not-found.ts)

##

#### Validation Exception (`src/exceptions/validation.ts`)
- Class: `UnprocessableEntity`
- Extends `HTTPException`
- Status code: 422
- Used for validation errors

**View file** &nbsp;|&nbsp;  [ open -> validation.ts  ](./src/exceptions/validation.ts)

##

#### Internal Exception (`src/exceptions/internal-exception.ts`)
- Extends `HTTPException`
- Status code: 500
- Used for unhandled server errors

**View file** &nbsp;|&nbsp;  [ open -> internal-exception.ts  ](./src/exceptions/internal-exception.ts)

##

### 4. Create Error Middleware (`src/middlewares/errors.ts`)
- Function signature: `(error: HTTPException, req: Request, res: Response, next: NextFunction)`
- Returns JSON response with:
  - `message`
  - `errorCode`
  - `errors`
- Sets appropriate HTTP status code

**View file** &nbsp;|&nbsp;  [ open -> errors.ts  ](./src/middlewares/errors.ts)

##

### 5. Create Validation Schema (`src/schema/users.ts`)
```typescript
import { z } from 'zod';

export const SIGNUP_SCHEMA = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6)
});
```

**View file** &nbsp;|&nbsp;  [ open -> users.ts  ](./src/schemas/users.ts)

##

### 6. Implement Generic Error Handler (`src/error-handler.ts`)
- Higher-order function that wraps controllers
- Automatically handles try-catch blocks
- Differentiates between handled and unhandled errors
- Converts unhandled errors to `InternalException`

**View file** &nbsp;|&nbsp;  [ open -> error-handler.ts  ](./src/error-handler.ts)

##

### 7. Update Express App (`src/index.ts`)
- Add error middleware: `app.use(errorMiddleware)`
- Must be added after all routes

**View file** &nbsp;|&nbsp;  [ open -> index.ts  ](./src/index.ts)

##

### 8. Update Controllers (`src/controllers/auth.ts`)

#### Signup Controller Updates:
- Add validation: `SIGNUP_SCHEMA.parse(req.body)`
- Replace generic errors with specific exceptions
- Remove manual try-catch blocks (handled by error handler)

**View file** &nbsp;|&nbsp;  [ open -> auth.ts  ](./src/controllers/auth.ts)

##

#### Login Controller Updates:
- Replace `throw new Error()` with:
  - `throw new NotFoundException("User not found", ErrorCodes.USER_NOT_FOUND)`
  - `throw new BadRequestException("Incorrect password", ErrorCodes.INCORRECT_PASSWORD)`

### 9. Update Routes (`src/routes/auth.ts`)
- Wrap all controllers with error handler:
```typescript
import { errorHandler } from '../error-handler';

router.post('/signup', errorHandler(signup));
router.post('/login', errorHandler(login));
```

## Error Response Format
```json
{
  "message": "User not found",
  "errorCode": 1001,
  "errors": null
}
```

## Validation Error Response Format
```json
{
  "message": "Unprocessable entity",
  "errorCode": 2001,
  "errors": [
    {
      "path": ["name"],
      "message": "Required"
    }
  ]
}
```

## Best Practices Implemented

### 1. Consistent Error Structure
- All errors follow the same response format
- Frontend can handle errors uniformly using error codes

### 2. Separation of Concerns
- Each exception type has its own class
- Validation logic separated from business logic
- Error handling centralized in middleware

### 3. Generic Error Handling
- No repetitive try-catch blocks in controllers
- Automatic differentiation between handled/unhandled errors
- Consistent error responses across the application

### 4. Frontend Integration
- Error codes enable localization on frontend
- Structured error responses for easy parsing
- HTTP status codes for proper client handling

## Testing the Implementation

### Test Validation Errors
```bash
# Missing required fields
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{}'

# Response: 422 with validation errors
```

### Test User Already Exists
```bash
# Create user twice with same email
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'

# Response: 400 with USER_ALREADY_EXISTS error code
```

### Test User Not Found
```bash
# Login with non-existent user
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@test.com","password":"123456"}'

# Response: 404 with USER_NOT_FOUND error code
```

### Test Incorrect Password
```bash
# Login with wrong password
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrongpassword"}'

# Response: 400 with INCORRECT_PASSWORD error code
```

## Key Benefits
- **Maintainable**: Centralized error handling reduces code duplication
- **Scalable**: Easy to add new exception types
- **Developer Friendly**: Clear error messages and consistent structure
- **Frontend Ready**: Error codes enable proper client-side handling
- **Production Ready**: Handles both expected and unexpected errors gracefully

---
