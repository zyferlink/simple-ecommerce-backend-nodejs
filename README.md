# Stage 06: Address Table Implementation



This stage implements a complete address management system for users in an e-commerce application. The implementation includes database modeling, CRUD operations, authentication integration, and default address management.



### Step 1: Database Model Setup

Create the Address model in your Prisma schema:

```prisma
model Address {
  id       Int    @id @default(autoincrement())
  line1    String
  line2    String?
  city     String
  country  String
  zipCode  String
  userId   Int
  user     User   @relation(fields: [userId], references: [id])
  
  @@map("addresses")
}

model User {
  id                     Int       @id @default(autoincrement())
  // ... existing fields
  addresses              Address[]
  defaultShippingAddressId Int?
  defaultBillingAddressId  Int?
  
  @@map("users")
}
```

Run migration:
```bash
npx prisma migrate dev --name "add_addresses_table"
```

### Step 2: Validation Schema

Create validation schemas using Zod:

```typescript
// users.ts
export const addressSchema = z.object({
  line1: z.string(),
  line2: z.string().nullable(),
  zipCode: z.string(),
  country: z.string(),
  city: z.string()
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  defaultShippingAddressId: z.number().optional(),
  defaultBillingAddressId: z.number().optional()
});
```

### Step 3: Controller Implementation

#### Add Address Controller
```typescript
export const addAddress = async (req: Request, res: Response) => {
  try {
    const validatedData = addressSchema.parse(req.body);
    
    const address = await prismaClient.address.create({
      data: {
        ...validatedData,
        userId: req.user.id
      }
    });
    
    res.json(address);
  } catch (error) {
    // Handle validation errors
  }
};
```

#### List Addresses Controller
```typescript
export const listAddresses = async (req: Request, res: Response) => {
  const addresses = await prismaClient.address.findMany({
    where: {
      userId: req.user.id
    }
  });
  
  res.json(addresses);
};
```

#### Delete Address Controller
```typescript
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    await prismaClient.address.delete({
      where: {
        id: parseInt(req.params.id)
      }
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    throw new NotFoundException("Address not found");
  }
};
```

#### Update User Controller
```typescript
export const updateUser = async (req: Request, res: Response) => {
  const validatedData = updateUserSchema.parse(req.body);
  
  // Validate shipping address ownership
  if (validatedData.defaultShippingAddress) {
    const shippingAddress = await prismaClient.address.findFirstOrThrow({
      where: { id: validatedData.defaultShippingAddress }
    });
    
    if (shippingAddress.userId !== req.user.id) {
      throw new BadRequestException("Address does not belong to user");
    }
  }
  
  // Similar validation for billing address
  
  const updatedUser = await prismaClient.user.update({
    where: { id: req.user.id },
    data: validatedData
  });
  
  res.json(updatedUser);
};
```

### Step 4: Route Configuration

```typescript
// routes/users.ts
import { authMiddleware } from '../middlewares/auth';

router.post('/address', authMiddleware, addAddress);
router.get('/address', authMiddleware, listAddresses);
router.delete('/address/:id', authMiddleware, deleteAddress);
router.put('/', authMiddleware, updateUser);
```

## API Reference

### Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users/address` | Create new address | Yes |
| GET | `/users/address` | List user addresses | Yes |
| DELETE | `/users/address/:id` | Delete address | Yes |
| PUT | `/users` | Update user profile | Yes |

### Request/Response Examples

#### Create Address
**Request:**
```json
POST /users/address
{
  "line1": "C 6/671",
  "line2": "Parking Road",
  "city": "Delhi",
  "country": "India",
  "pinCode": "110001"
}
```

**Response:**
```json
{
  "id": 1,
  "line1": "C 6/671",
  "line2": "Parking Road",
  "city": "Delhi",
  "country": "India",
  "pinCode": "110001",
  "userId": 8
}
```

#### Update User with Default Addresses
**Request:**
```json
PUT /users
{
  "name": "John Doe",
  "defaultShippingAddress": 1,
  "defaultBillingAddress": 2
}
```

## Database Schema

### Relationships
- **User → Address**: One-to-Many
- **User → DefaultShippingAddress**: One-to-One (nullable)
- **User → DefaultBillingAddress**: One-to-One (nullable)

### Constraints
- `pinCode`: Must be exactly 6 characters
- `line1`, `city`, `country`: Required fields
- `line2`: Optional field
- Address ownership validation enforced in application layer

## Error Handling

### Error Codes
```typescript
enum ErrorCode {
  USER_NOT_FOUND = 1001,
  ADDRESS_NOT_FOUND = 1004,
  ADDRESS_DOES_NOT_BELONG = 1005
}
```

### Exception Types
- `NotFoundException`: User/Address not found
- `BadRequestException`: Address ownership violation
- `ValidationException`: Zod schema validation failures

### Error Response Format
```json
{
  "message": "Address not found",
  "errorCode": 1004,
  "details": {}
}
```

## Testing

### Test Cases

#### Unit Tests
- ✅ Address creation with valid data
- ✅ Address creation with invalid pin code
- ✅ Address deletion by owner
- ✅ Address deletion by non-owner (should fail)
- ✅ Default address assignment validation

#### Integration Tests
- ✅ Full CRUD flow for addresses
- ✅ Authentication middleware integration
- ✅ Database transaction handling



## Best Practices

### Security
- Always validate address ownership before operations
- Use authentication middleware for all endpoints
- Sanitize user input through Zod schemas

### Performance
- No pagination needed for addresses (limited per user)
- Index on `userId` for efficient queries
- Use `findFirstOrThrow` for better error handling

### Code Organization
- Separate validation schemas in dedicated file
- Group related controllers in modules
- Consistent error handling patterns

## Migration Commands

```bash
# Initial address table
npx prisma migrate dev --name "add_addresses_table"

# Add default address fields
npx prisma migrate dev --name "add_default_addresses"

# Reset database (development only)
npx prisma migrate reset
```

## Next Steps
- Implement cart functionality
- Add address validation with external APIs
- Implement bulk address operations
- Add address analytics and reporting