# Stage 07: Cart Implementation


This stage implements a complete shopping cart system for the e-commerce application. Users can add products to their cart, modify quantities, remove items, and view their cart contents.

### Features
- Add products to cart with specified quantities
- Update item quantities in cart
- Remove items from cart
- View all cart items with product details
- User-specific cart isolation
- Product existence validation



### Step 1: Database Model Setup

Create the CartItem model in your Prisma schema:

```prisma
model CartItem {
  id        Int     @id @default(autoincrement())
  userId    Int
  productId Int
  quantity  Int
  user      User    @relation(fields: [userId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
  
  @@map("cart_items")
}

model User {
  id        Int        @id @default(autoincrement())
  // ... existing fields
  cartItems CartItem[]
  
  @@map("users")
}

model Product {
  id        Int        @id @default(autoincrement())
  // ... existing fields
  cartItems CartItem[]
  
  @@map("products")
}
```

Run migration:
```bash
npx prisma migrate dev --name "create_cart_table"
```

### Step 2: Validation Schemas

Create validation schemas for cart operations:

```typescript
// cart.ts
import { z } from 'zod';

export const createCartSchema = z.object({
  productId: z.number(),
  quantity: z.number()
});

export const changeQuantitySchema = z.object({
  quantity: z.number()
});
```

### Step 3: Controller Implementation

#### Add Item to Cart Controller
```typescript
export const addItemToCart = async (req: Request, res: Response) => {
  try {
    const validatedData = createCartSchema.parse(req.body);
    
    // Fetch product to ensure it exists
    const product = await prismaClient.product.findFirstOrThrow({
      where: { id: validatedData.productId }
    });
    
    const cart = await prismaClient.cartItem.create({
      data: {
        userId: req.user.id,
        productId: product.id,
        quantity: validatedData.quantity
      }
    });
    
    res.json(cart);
  } catch (error) {
    throw new NotFoundException("Product not found");
  }
};
```

#### Delete Item from Cart Controller
```typescript
export const deleteItemFromCart = async (req: Request, res: Response) => {
  await prismaClient.cartItem.delete({
    where: {
      id: parseInt(req.params.id)
    }
  });
  
  res.json({ success: true });
};
```

#### Change Quantity Controller
```typescript
export const changeQuantity = async (req: Request, res: Response) => {
  const validatedData = changeQuantitySchema.parse(req.body);
  
  const updatedCart = await prismaClient.cartItem.update({
    where: {
      id: parseInt(req.params.id)
    },
    data: {
      quantity: validatedData.quantity
    }
  });
  
  res.json(updatedCart);
};
```

#### Get Cart Controller
```typescript
export const getCart = async (req: Request, res: Response) => {
  const cart = await prismaClient.cartItem.findMany({
    where: {
      userId: req.user.id
    },
    include: {
      product: true
    }
  });
  
  res.json(cart);
};
```

### Step 4: Route Configuration

```typescript
// routes/cart.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import {
  addItemToCart,
  deleteItemFromCart,
  changeQuantity,
  getCart
} from '../controllers/cart';

const router = Router();

router.post('/', authMiddleware, addItemToCart);
router.get('/', authMiddleware, getCart);
router.put('/:id', authMiddleware, changeQuantity);
router.delete('/:id', authMiddleware, deleteItemFromCart);

export default router;
```

## API Reference

### Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/cart` | Add item to cart | Yes |
| GET | `/cart` | Get user's cart items | Yes |
| PUT | `/cart/:id` | Update item quantity | Yes |
| DELETE | `/cart/:id` | Remove item from cart | Yes |

### Request/Response Examples

#### Add Item to Cart
**Request:**
```json
POST /cart
{
  "productId": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "id": 46,
  "userId": 8,
  "productId": 1,
  "quantity": 2
}
```

#### Get Cart Items
**Request:**
```json
GET /cart
```

**Response:**
```json
[
  {
    "id": 46,
    "userId": 8,
    "productId": 1,
    "quantity": 2,
    "product": {
      "id": 1,
      "name": "Product Name",
      "price": 99.99,
      "description": "Product description"
    }
  }
]
```

#### Update Quantity
**Request:**
```json
PUT /cart/46
{
  "quantity": 6
}
```

**Response:**
```json
{
  "id": 46,
  "userId": 8,
  "productId": 1,
  "quantity": 6
}
```

#### Delete Cart Item
**Request:**
```json
DELETE /cart/46
```

**Response:**
```json
{
  "success": true
}
```

## Database Schema

### Relationships
- **User → CartItem**: One-to-Many
- **Product → CartItem**: One-to-Many
- **CartItem → User**: Many-to-One
- **CartItem → Product**: Many-to-One

### Constraints
- `quantity`: Must be a positive integer
- `productId`: Must reference existing product
- `userId`: Automatically set from authenticated user

## Error Handling

### Error Codes
```typescript
enum ErrorCode {
  PRODUCT_NOT_FOUND = 2001,
  CART_ITEM_NOT_FOUND = 2002,
  UNAUTHORIZED_CART_ACCESS = 2003
}
```

### Exception Types
- `NotFoundException`: Product/Cart item not found
- `UnauthorizedException`: User accessing another user's cart
- `ValidationException`: Invalid quantity or product ID

### Error Response Format
```json
{
  "message": "Product not found",
  "errorCode": 2001,
  "details": {}
}
```

## Assignments

### Assignment 1: Cart Item Ownership Validation
**Requirement:** Check if user is deleting/updating their own cart item.

**Implementation:**
```typescript
// In deleteItemFromCart and changeQuantity controllers
const cartItem = await prismaClient.cartItem.findFirstOrThrow({
  where: { id: parseInt(req.params.id) }
});

if (cartItem.userId !== req.user.id) {
  throw new UnauthorizedException("Cannot modify another user's cart item");
}
```

### Assignment 2: Duplicate Product Handling
**Requirement:** If product already exists in cart, increase quantity instead of creating new item.

**Implementation:**
```typescript
// In addItemToCart controller
const existingCartItem = await prismaClient.cartItem.findFirst({
  where: {
    userId: req.user.id,
    productId: validatedData.productId
  }
});

if (existingCartItem) {
  const updatedCart = await prismaClient.cartItem.update({
    where: { id: existingCartItem.id },
    data: {
      quantity: existingCartItem.quantity + validatedData.quantity
    }
  });
  return res.json(updatedCart);
}

// Continue with creating new cart item...
```


## Best Practices

### Security
- Always validate cart item ownership
- Use authentication middleware for all endpoints
- Validate product existence before adding to cart

### Performance
- Use `include` to fetch related data in single query
- Consider adding indexes on `userId` and `productId`
- Implement cart cleanup for abandoned items

### Business Logic
- Handle duplicate products intelligently
- Validate quantity limits if applicable
- Consider stock availability before adding to cart

## Common Issues & Solutions

### Issue: Port conflicts during development
**Solution:** Kill existing processes or use different port
```bash
lsof -ti:3000 | xargs kill -9
```

### Issue: Cart items persisting after product deletion
**Solution:** Add cascade delete or handle orphaned items
```prisma
product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
```

### Issue: Race conditions in quantity updates
**Solution:** Use database transactions for atomic operations
