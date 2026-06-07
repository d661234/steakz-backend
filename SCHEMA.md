# Steakz MIS Database Schema

## Enum: Role
Used for RBAC across the system.
- `ADMIN`
- `HQ_MANAGER`
- `BRANCH_MANAGER`
- `WAITER`
- `CUSTOMER`
- `OPEN_ACCESS`

## Enum: OrderStatus
Tracks the lifecycle of an order.
- `PLACED`
- `COOKING`
- `FINISHED_COOKING`
- `SERVED`
- `BILLED`
- `PAID`

## Models

### User
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `password_hash`: String
- `role`: Role (Enum)
- `branch_id`: Relation to Branch (Optional)
- `allergies`: String Array (Customer profiles)

### Branch
- `id`: UUID (Primary Key)
- `name`: String (Unique)
- `location_address`: String

### Menu
- `id`: UUID (Primary Key)
- `branch_id`: Relation to Branch
- `item_name`: String
- `price`: Decimal
- `availability_status`: Boolean

### Table
- `id`: UUID (Primary Key)
- `branch_id`: Relation to Branch
- `table_number_identifier`: String
- `seating_capacity`: Int

### Order
- `id`: UUID (Primary Key)
- `branch_id`: Relation to Branch
- `table_id`: Relation to Table
- `customer_id`: Relation to User (Optional)
- `status`: OrderStatus (Enum)
- `total_amount`: Decimal
- `propagated_allergies`: String Array
