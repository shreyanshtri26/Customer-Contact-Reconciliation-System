# Bitespeed Identity Reconciliation System

A system to identify and link customer contacts based on email and phone number. This implementation handles contact deduplication, chain merging, and maintains relationships between primary and secondary contacts.

## Features

- Contact identification and linking via email OR phone number
- Automatic primary/secondary contact management
- Chain merging for multiple contacts
- Exact match detection (prevents duplicates)
- RESTful API endpoint with comprehensive validation
- Support for concurrent requests
- Proper error handling and validation

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## Setup

1. Clone the repository:
```bash
git clone https://github.com/shreyanshtri26/Customer-Contact-Reconciliation-System.git
cd customer-contact-reconciliation-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://postgres:Fb@123@localhost:5432/bitespeed"
PORT=3000
NODE_ENV=development
```

4. Set up the database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start the development server:
```bash
npm run dev
```


### Identify Contact

**Endpoint:** `POST /identify`

**Base URL:** `http://localhost:3000`

**Request Body:**
```json
{
  "email": "user@example.com",        // Optional string
  "phoneNumber": "+1234567890"        // Optional string
}
```

**Response Format:**
```json
{
  "contact": {
    "primaryContactId": 1,                    // ID of the oldest contact in chain
    "emails": ["primary@email.com", "secondary@email.com"],     // Array of all emails (primary first)
    "phoneNumbers": ["+1234567890", "+0987654321"],            // Array of all phones (primary first)
    "secondaryContactIds": [2, 3]             // Array of secondary contact IDs
  }
}
```

## API Examples

### 1. Create New Contact (Email Only)
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": [],
    "secondaryContactIds": []
  }
}
```

### 2. Create New Contact (Phone Only)
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "555-1234"}'
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 2,
    "emails": [],
    "phoneNumbers": ["555-1234"],
    "secondaryContactIds": []
  }
}
```

### 3. Create New Contact (Both Email and Phone)
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "phoneNumber": "555-1234"}'
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 3,
    "emails": ["user@example.com"],
    "phoneNumbers": ["555-1234"],
    "secondaryContactIds": []
  }
}
```

### 4. Add Secondary Contact (Matching Phone, New Email)
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "secondary@example.com", "phoneNumber": "555-1234"}'
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 3,
    "emails": ["user@example.com", "secondary@example.com"],
    "phoneNumbers": ["555-1234"],
    "secondaryContactIds": [4]
  }
}
```

### 5. Exact Match (No New Record Created)
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "phoneNumber": "555-1234"}'
```

**Response:** (Same as previous, no duplicate created)
```json
{
  "contact": {
    "primaryContactId": 3,
    "emails": ["user@example.com", "secondary@example.com"],
    "phoneNumbers": ["555-1234"],
    "secondaryContactIds": [4]
  }
}
```

### 6. Chain Merging (Two Separate Contact Chains)
```bash
# Create first chain
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "chain1@example.com", "phoneNumber": "111-1111"}'

# Create second chain
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "chain2@example.com", "phoneNumber": "222-2222"}'

# Merge chains
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "chain1@example.com", "phoneNumber": "222-2222"}'
```

**Response after merging:**
```json
{
  "contact": {
    "primaryContactId": 5,
    "emails": ["chain1@example.com", "chain2@example.com"],
    "phoneNumbers": ["111-1111", "222-2222"],
    "secondaryContactIds": [6]
  }
}
```

## Business Logic Rules

1. **Contact Linking**: Contacts are linked if they share either an email OR phone number
2. **Primary Contact**: The oldest contact in a chain (by creation time)
3. **Secondary Contact**: Any contact linked to a primary contact
4. **Chain Merging**: When linking separate chains, the older primary remains primary
5. **Exact Match**: If both email and phone match existing contact, no new record is created
6. **Response Ordering**: Primary contact's information appears first in arrays

## Error Handling

### Validation Errors
```json
{
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Invalid email format",
      "path": "email",
      "location": "body"
    }
  ]
}
```

### Missing Contact Information
```json
{
  "status": "error",
  "message": "Either email or phoneNumber must be provided"
}
```

### Service Errors
```json
{
  "status": "error",
  "message": "An error occurred while processing your request"
}
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project
- `npm start` - Start production server
- `npm test` - Run tests

## Database Schema

The system uses a PostgreSQL database with the following schema:

```sql
Contact {
  id: INTEGER (Primary Key, Auto-increment)
  phoneNumber: STRING (Nullable, VARCHAR(15))
  email: STRING (Nullable, VARCHAR(255))
  linkedId: INTEGER (Foreign Key to Contact.id, Nullable)
  linkPrecedence: ENUM('primary', 'secondary')
  createdAt: DATETIME
  updatedAt: DATETIME
  deletedAt: DATETIME (Nullable - for soft deletes)
}
```

### Key Relationships:
- **Primary Contact**: `linkedId = null`, `linkPrecedence = 'primary'`
- **Secondary Contact**: `linkedId = primaryContactId`, `linkPrecedence = 'secondary'`
- **Contact Chain**: All contacts linked through a common primary contact

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Express-validator
- **Security**: Helmet.js
- **Development**: ts-node-dev for hot reloading

## Testing

The system has been thoroughly tested with the following scenarios:

✅ New contact creation (email only, phone only, both)  
✅ Secondary contact linking  
✅ Exact match detection  
✅ Chain merging  
✅ Input validation  
✅ Long data handling  
✅ Concurrent request handling  
✅ Error scenarios  

All tests pass successfully and the system handles edge cases properly.
