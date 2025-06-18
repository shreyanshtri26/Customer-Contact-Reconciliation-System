# Bitespeed Identity Reconciliation System

A system to identify and link customer contacts based on email and phone number.

## Live API Endpoint

**Base URL:** `https://customer-contact-reconciliation-system.vercel.app`

**Identify Contact Endpoint:** `POST /api/identify`

**Full URL:** `https://customer-contact-reconciliation-system.vercel.app/api/identify`

## Features

- Contact identification and linking
- Automatic primary/secondary contact management
- Chain merging for multiple contacts
- RESTful API endpoint

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
DATABASE_URL="postgresql://bitespeed_user:xdtYDyqgtlTyln149VjoA341J7NNBUzz@dpg-d19bdifgi27c73flbrcg-a.oregon-postgres.render.com/bitespeed_2k3b"
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

## Testing the Live API

You can test the live API using curl:

```bash
# Create new contact
curl -X POST https://customer-contact-reconciliation-system.vercel.app/api/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": "1234567890"}'

# Add secondary contact
curl -X POST https://customer-contact-reconciliation-system.vercel.app/api/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "secondary@example.com", "phoneNumber": "1234567890"}'

# Test exact match (should not create duplicate)
curl -X POST https://customer-contact-reconciliation-system.vercel.app/api/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": "1234567890"}'
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
- **Deployment:** Vercel
- **Database Hosting:** Render
- **Security:** Helmet.js for security headers
- **Validation:** Express-validator
- **Development:** ts-node-dev for hot reloading
