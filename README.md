# Bitespeed Identity Reconciliation System

A system to identify and link customer contacts based on email and phone number.

## 🚀 Live API Endpoint

**Base URL:** `https://bitespeed-identity-reconciliation.onrender.com`

**Identify Contact Endpoint:** `POST /api/identify`

**Full URL:** `https://bitespeed-identity-reconciliation.onrender.com/api/identify`

## Features

- Contact identification and linking
- Automatic primary/secondary contact management
- Chain merging for multiple contacts
- RESTful API endpoint
- Production-ready deployment on Render.com

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## Setup

### Local Development

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
DATABASE_URL="postgresql://username:password@localhost:5432/bitespeed"
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

### Production Deployment on Render.com

1. **Fork/Clone this repository** to your GitHub account

2. **Sign up/Login to Render.com**

3. **Create a new Web Service:**
   - Connect your GitHub repository
   - Choose "Web Service"
   - Set the following configuration:
     - **Name:** `bitespeed-identity-reconciliation`
     - **Environment:** `Node`
     - **Build Command:** `npm install && npm run prisma:generate && npm run build`
     - **Start Command:** `npm start`
     - **Plan:** Free

4. **Add Environment Variables:**
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = Your PostgreSQL connection string
   - `PORT` = `3000`

5. **Deploy:** Click "Create Web Service"

## API Usage

### Identify Contact

**Endpoint:** `POST /api/identify`

**Request Body:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": ["+1234567890"],
    "secondaryContactIds": []
  }
}
```

### Testing the Live API

You can test the live API using curl:

```bash
# Test with email only
curl -X POST https://bitespeed-identity-reconciliation.onrender.com/api/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test with phone only
curl -X POST https://bitespeed-identity-reconciliation.onrender.com/api/identify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "555-1234"}'

# Test with both email and phone
curl -X POST https://bitespeed-identity-reconciliation.onrender.com/api/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": "555-1234"}'
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project
- `npm start` - Start production server
- `npm test` - Run tests

## Database Schema

The system uses a PostgreSQL database with the following schema:

- Contact
  - id (Primary Key)
  - email (Optional)
  - phoneNumber (Optional)
  - linkedId (Foreign Key to Contact)
  - linkPrecedence ('primary' or 'secondary')
  - createdAt
  - updatedAt
  - deletedAt (Soft delete)

## Technology Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Security:** Helmet.js for security headers
- **Validation:** Express-validator
- **Deployment:** Render.com
- **Development:** ts-node-dev for hot reloading

## API Features

### Contact Linking Rules

1. **New Customer:** Creates primary contact if no matches found
2. **Partial Match:** Creates secondary contact linked to existing primary
3. **Exact Match:** Returns existing contact chain without creating duplicates
4. **Chain Merging:** Merges separate contact chains, keeping oldest as primary

### Response Format

- `primaryContactId`: ID of the oldest contact in the chain
- `emails`: Array with primary contact's email first, then all secondary emails
- `phoneNumbers`: Array with primary contact's phone first, then all secondary phones
- `secondaryContactIds`: Array of all secondary contact IDs linked to the primary

### Error Handling

- **400 Bad Request:** Invalid input validation
- **500 Internal Server Error:** Server-side errors
- **Proper error messages** for debugging

## Testing Scenarios

The API has been tested with the following scenarios:

1. ✅ Create new contact with email only
2. ✅ Create new contact with phone only
3. ✅ Create new contact with both email and phone
4. ✅ Add secondary contact with matching phone, new email
5. ✅ Add secondary contact with matching email, new phone
6. ✅ Request with exact match (no duplicate creation)
7. ✅ Merge two separate primary contact chains
8. ✅ Handle null/empty email and phone number values
9. ✅ Test with very long email addresses and phone numbers
10. ✅ Concurrent requests with same contact information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License
