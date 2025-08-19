# Stage 8: Order Feature Implementation Guide

Complete implementation guide for building an order management system with cart functionality, order processing, and admin management features using Node.js/TypeScript with Prisma ORM.

## 📋 Prerequisites
- Node.js/TypeScript setup with Prisma ORM
- Database setup completed
- User authentication system in place
- Product catalog functionality implemented
- Cart functionality already implemented

## 🛠️ Implementation Steps

### Part 1: Database Models & Schema

#### Create Three Core Models:
1. **Order Model** (`Order`)
2. **Order Product Model** (`OrderProduct`) - Many-to-many relation
3. **Order Event Model** (`OrderEvent`) - Order status history

#### Order Event Status Enum:
```typescript
enum OrderEventStatus {
  PENDING
  ACCEPTED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}
```

#### Schema Structure:
- **Order**: `userID`, `netAmount` (decimal), `address` (string), `status` (OrderEventStatus, default: PENDING)
- **OrderProduct**: `orderID`, `productID`, `quantity` (int)
- **OrderEvent**: `orderID`, `status` (OrderEventStatus, default: PENDING)

#### Relationships:
- User → Orders (one-to-many)
- Order → OrderProducts (one-to-many)
- Order → OrderEvents (one-to-many)
- Product → OrderProducts (one-to-many)

#### Formatted Address Computed Field:
```typescript
// Extend Prisma client with computed field
const prisma = new PrismaClient().$extends({
  result: {
    address: {
      formattedAddress: {
        needs: { lineOne: true, lineTwo: true, city: true, country: true, pinCode: true },
        compute(address) {
          return `${address.lineOne}, ${address.lineTwo}, ${address.city}, ${address.country} - ${address.pinCode}`;
        }
      }
    }
  }
});
```

#### Migration Command:
```bash
# Create migration for order tables
npx prisma migrate dev --name "create_order_tables"
```

### Part 2: Order Processing (Complex Implementation)

#### Create Order Controller - 7-Step Process:

**Step 1: Create Database Transaction**
```typescript
return await prismaClient.$transaction(async (transaction) => {
  // All operations inside transaction
});
```

**Step 2: List Cart Items & Validation**
```typescript
const cartItems = await transaction.cartItem.findMany({
  where: { userId: request.user.id },
  include: { product: true }
});

if (cartItems.length === 0) {
  return response.json({ message: "Cart is empty" });
}
```

**Step 3: Calculate Total Price**
```typescript
const price = cartItems.reduce((previousValue: number, currentValue) => {
  return previousValue + (currentValue.quantity * currentValue.product.price);
}, 0);
```

**Step 4: Fetch User Address**
```typescript
const address = await transaction.address.findFirst({
  where: { id: request.user.defaultShippingAddress }
});
```

**Step 5: Create Order & Order Products**
```typescript
const order = await transaction.order.create({
  data: {
    userId: request.user.id,
    netAmount: price,
    address: address.formattedAddress,
    products: {
      create: cartItems.map(cart => ({
        productId: cart.productId,
        quantity: cart.quantity
      }))
    }
  }
});
```

**Step 6: Create Order Event (Default: PENDING)**
```typescript
await transaction.orderEvent.create({
  data: {
    orderId: order.id,
    status: 'PENDING' // Default status
  }
});
```

**Step 7: Empty Cart**
```typescript
await transaction.cartItem.deleteMany({
  where: { userId: request.user.id }
});
```

### Part 3: User Order Management Routes

#### List Orders
```typescript
const orders = await prismaClient.order.findMany({
  where: { userId: request.user.id },
  include: { products: true }
});
```

#### Get Order by ID
```typescript
const order = await prismaClient.order.findFirstOrThrow({
  where: { id: request.params.id },
  include: {
    products: true,
    events: true
  }
});
```

#### Cancel Order (Assignment Tasks)
- Wrap in transaction
- Check if user is canceling their own order
- Update order status to CANCELLED
- Create order event for cancellation
- **Order Model & Migration**
  - Orders table (user_id, total_amount, status, shipping_address)
  - Order_items table (order_id, product_id, quantity, price)
  - Define order statuses (pending, processing, shipped, delivered, cancelled)

- **Checkout Process**
  - Shipping address form
  - Order summary display
  - Payment method selection
  - Order validation and creation
  - Cart cleanup after successful order

- **Order Controller Methods**
  - `checkout()` - Display checkout form
  - `placeOrder()` - Process and create order
  - `orderConfirmation()` - Show success page
  - `orderHistory()` - User's order list
  - `orderDetails()` - Individual order view

### Part 3: User Order Management
- **Order History Page**
  - List all user orders with pagination
  - Display order date, total, and status
  - Quick status indicators (badges/colors)
  - "View Details" links for each order

- **Order Details View**
  - Complete order information
  - Itemized product list with quantities
  - Shipping address display
  - Order status timeline
  - Download invoice option (if applicable)

- **Order Status Updates**
  - Real-time status tracking
  - Email notifications for status changes
  - Cancel order option (if applicable)

### Part 4: Admin Management Features

#### User Management APIs:
- **List Users** (Paginated): `GET /users?skip=0&take=5`
- **Get User by ID**: `GET /users/:id` (includes addresses)
- **Change User Role**: `PUT /users/:id/role`

#### User Management Implementation:
```typescript
// List Users (Paginated)
const users = await prismaClient.user.findMany({
  skip: Number(request.query.skip) || 0,
  take: 5
});

// Get User by ID
const user = await prismaClient.user.findFirstOrThrow({
  where: { id: request.params.id },
  include: { addresses: true }
});

// Change User Role
await prismaClient.user.update({
  where: { id: request.params.id },
  data: { role: request.body.role }
});
```

#### Order Management APIs:
- **List All Orders**: `GET /orders?status=PENDING&skip=0&take=5`
- **Change Order Status**: `PUT /orders/:id/status`
- **List User Orders**: `GET /orders/users/:id`

#### Order Management Implementation:
```typescript
// List All Orders with Status Filter
let whereClause = {};
if (request.query.status) {
  whereClause = { status: request.query.status };
}

const orders = await prismaClient.order.findMany({
  where: whereClause,
  skip: Number(request.query.skip) || 0,
  take: 5
});

// Change Order Status (with Transaction)
await prismaClient.$transaction([
  prismaClient.order.update({
    where: { id: request.params.id },
    data: { status: request.body.status }
  }),
  prismaClient.orderEvent.create({
    data: {
      orderId: request.params.id,
      status: request.body.status
    }
  })
]);
```

### Part 5: Route Organization & Structure

#### Order Routes (`orders.ts`):
```typescript
// User Routes
POST   /orders          // Create Order
GET    /orders          // List User Orders  
GET    /orders/:id      // Get Order by ID
PUT    /orders/:id/cancel // Cancel Order

// Admin Routes (require admin middleware)
GET    /admin/orders           // List All Orders
PUT    /admin/orders/:id/status // Change Order Status
GET    /admin/orders/users/:id  // List Orders by User
```

#### Important Route Ordering:
- Place specific routes (`/index`, `/users/:id`) BEFORE parameterized routes (`/:id`)
- Parameterized routes can intercept specific routes if placed first
- **Admin Orders Dashboard**
  - All orders overview with filters
  - Status-based filtering (pending, processing, etc.)
  - Search by order ID or customer name
  - Order statistics and metrics

- **Order Management Features**
  - Update order status dropdown
  - Bulk actions for multiple orders
  - Order details modal/page
  - Print shipping labels functionality
  - Customer information access

- **Admin Controller Methods**
  - `adminOrders()` - Orders listing with filters
  - `updateOrderStatus()` - Change order status
  - `orderDetails()` - Admin view of order details
  - `generateReports()` - Sales and order reports

### Part 6: Key Implementation Details

#### Database Schema Additions:
- **Current Status Field**: Add `status` field to Order model for quick access
- **Order History**: OrderEvent table maintains complete status change history
- **Address Storage**: Store computed formatted address as string in orders

#### Transaction Management:
- **Critical Operations**: All order creation steps must be in single transaction
- **Rollback Safety**: If any step fails, entire order creation rolls back
- **Data Consistency**: Ensures cart is only emptied after successful order creation

#### Error Handling:
```typescript
// Custom exceptions for different scenarios
throw new NotFoundException("Order not found", ERROR_CODE.ORDER_NOT_FOUND);
throw new NotFoundException("User not found", ERROR_CODE.USER_NOT_FOUND);
```

#### Validation Requirements:
- Cart must not be empty before order creation
- User must own the order being cancelled
- Order status transitions must be valid
- Product inventory should be checked (future enhancement)

### Part 7: Testing & Verification

#### API Testing Checklist:
- [ ] Create order with valid cart items
- [ ] Handle empty cart scenario  
- [ ] Calculate prices correctly
- [ ] Store formatted address properly
- [ ] Create order events with correct status
- [ ] Empty cart after successful order
- [ ] List orders with pagination
- [ ] Filter orders by status
- [ ] Cancel orders (user validation)
- [ ] Admin status updates work
- [ ] Route ordering is correct

#### Database Verification:
- Order record created with correct totals
- OrderProduct records match cart items
- OrderEvent created with PENDING status
- Cart items deleted after order creation
- Status updates create new events
- User addresses formatted correctly

### Part 8: Advanced Features (Future Implementation)

#### Product Search (Next Video):
- Full-text search implementation in Prisma
- Search API for both users and admins
- Product filtering and pagination

#### Enhanced Features:
- Inventory management and stock validation
- Order tracking with delivery updates  
- Email notifications for status changes
- Bulk order operations for admin
- Order export and reporting
- Payment gateway integration
- Shipping cost calculations

### Part 9: Assignment Tasks

#### Student Assignments from Videos:
1. **Cancel Order Enhancement**:
   - Wrap cancel order in transaction
   - Validate user owns the order being cancelled
   - Create proper error handling

2. **Search API**:
   - Implement full-text search for products
   - Add pagination to search results
   - Support filtering by categories

3. **Status Validation**:
   - Create validation schema for status changes
   - Implement business rules for status transitions
   - Add proper error messages

### Part 10: Project Structure

#### Controller Organization:
```
controllers/
├── orders.ts        // User order operations
├── admin/orders.ts  // Admin order management  
├── users.ts         // User management
└── products.ts      // Product search
```

#### Route Organization:
```
routes/
├── orders.ts        // Order-related routes
├── users.ts         // User management routes
└── products.ts      // Product search routes
```
## 🔍 Troubleshooting Common Issues

#### Route Order Problems:
- **Issue**: `/index` route not working
- **Solution**: Place specific routes before parameterized routes (/:id)
- **Example**: Define `/orders/index` before `/orders/:id`

#### Transaction Failures:
- **Issue**: Order creation partially completes
- **Solution**: Wrap all operations in Prisma transaction
- **Check**: Ensure all await statements are inside transaction function

#### Status Filter Not Working:
- **Issue**: Query parameters not filtering correctly  
- **Solution**: Use `request.query.status` not `request.params.status`
- **Verify**: Check if status is passed as query parameter (?status=PENDING)

#### Cart Empty After Failed Order:
- **Issue**: Cart cleared even when order fails
- **Solution**: Only clear cart inside successful transaction
- **Prevention**: Use transaction rollback for failures

#### Address Not Formatting:
- **Issue**: Formatted address showing undefined
- **Solution**: Ensure computed field extension is properly configured
- **Check**: Verify all required address fields are present



---
