# Database Structure - Anna Seva Portal

This document outlines the MongoDB database structure with separate collections for different user types.

## Collections Overview

### 1. **users** Collection
Base authentication collection for all users.

**Fields:**
- `_id`: ObjectId (Primary Key)
- `name`: String - Full name
- `email`: String - Unique email address
- `password`: String - Hashed password (bcrypt)
- `role`: String - User role ('cardholder', 'distributor', 'admin')
- `createdAt`: Date - Account creation timestamp

**Indexes:**
- Unique index on `email`

---

### 2. **cardholders** Collection
Detailed information for ration card holders.

**Fields:**
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId - Reference to users._id
- `name`: String - Cardholder name
- `email`: String - Contact email
- `cardNumber`: String - Ration card number
- `phone`: String - Contact phone number
- `status`: String - Account status ('active', 'inactive', 'suspended')
- `entitlements`: Object - Monthly entitlements
  - `rice`: Number - Rice quota in kg
  - `wheat`: Number - Wheat quota in kg
  - `sugar`: Number - Sugar quota in kg
- `createdAt`: Date - Profile creation timestamp
- `updatedAt`: Date - Last update timestamp (optional)

**Indexes:**
- Index on `userId`
- Unique index on `cardNumber`

**Default Entitlements:**
- Rice: 5 kg/month
- Wheat: 5 kg/month
- Sugar: 2 kg/month

---

### 3. **distributors** Collection
Detailed information for Fair Price Shop owners/operators.

**Fields:**
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId - Reference to users._id
- `ownerName`: String - Shop owner's name
- `email`: String - Contact email
- `shopName`: String - Fair Price Shop name
- `licenseNumber`: String - FPS license number
- `phone`: String - Contact phone number
- `address`: String - Shop physical address
- `status`: String - Account status ('active', 'inactive', 'suspended')
- `rating`: Number - Shop rating (0-5)
- `totalOrders`: Number - Total orders processed
- `createdAt`: Date - Profile creation timestamp
- `updatedAt`: Date - Last update timestamp (optional)

**Indexes:**
- Index on `userId`
- Unique index on `licenseNumber`

---

## Database Relationships

```
users (1) ----< (1) cardholders
  |
  └-----< (1) distributors
```

- Each user can have one cardholder profile OR one distributor profile (based on role)
- The `userId` field in cardholders/distributors references `users._id`

---

## API Endpoints

### Cardholder APIs

**GET** `/api/cardholder/profile`
- Get current cardholder's profile
- Auth: Required (cardholder role)
- Returns: Cardholder details

**PUT** `/api/cardholder/profile`
- Update current cardholder's profile
- Auth: Required (cardholder role)
- Body: `{ name?, phone?, cardNumber? }`

**GET** `/api/cardholder/list`
- Get all cardholders
- Auth: Required (any authenticated user)
- Returns: Array of cardholders

### Distributor APIs

**GET** `/api/distributor/profile`
- Get current distributor's profile
- Auth: Required (distributor role)
- Returns: Distributor details

**PUT** `/api/distributor/profile`
- Update current distributor's profile
- Auth: Required (distributor role)
- Body: `{ ownerName?, shopName?, phone?, address?, licenseNumber? }`

**GET** `/api/distributor/list`
- Get all distributors
- Auth: Required (any authenticated user)
- Returns: Array of distributors

---

## Registration Flow

### Cardholder Registration
1. User submits registration form with:
   - Name, Email, Password, Phone, Card Number
2. System creates entry in `users` collection with role='cardholder'
3. System creates linked entry in `cardholders` collection with default entitlements
4. JWT token issued with userId and role

### Distributor Registration
1. User submits registration form with:
   - Owner Name, Email, Password, Shop Name, License Number, Phone, Address
2. System creates entry in `users` collection with role='distributor'
3. System creates linked entry in `distributors` collection
4. JWT token issued with userId and role

---

## Security Considerations

1. **Password Storage**: All passwords are hashed using bcrypt
2. **JWT Tokens**: Stored in HttpOnly cookies to prevent XSS attacks
3. **Role-Based Access**: API routes verify user role from JWT token
4. **Data Isolation**: Sensitive fields (userId) excluded from API responses
5. **Unique Constraints**: Email, cardNumber, and licenseNumber are unique

---

## Future Enhancements

- **orders** collection for tracking transactions
- **stock** collection for inventory management
- **complaints** collection for grievance redressal
- **notifications** collection for alerts and updates
- **audit_logs** collection for tracking all changes

---

## Environment Variables

Required in `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/anna_seva_db
JWT_SECRET=your-secret-key-here
```

---

## Database Initialization

No manual initialization required. Collections are created automatically when first document is inserted.

Recommended: Create indexes for better performance:
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
db.cardholders.createIndex({ userId: 1 })
db.cardholders.createIndex({ cardNumber: 1 }, { unique: true })
db.distributors.createIndex({ userId: 1 })
db.distributors.createIndex({ licenseNumber: 1 }, { unique: true })
```
