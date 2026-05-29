# NotaireFlow - Legal Transaction Management System

## Overview
A full-stack application for **Notaires** to manage legal cases and **clients** to track their transactions securely.

## Features Delivered
- **Authentication**: JWT-based login for Notaires and Clients
- **API Endpoints**:
  - Client dashboard (`GET /api/dossiers/client/:id`)
  - Dossier management (`PUT /api/dossiers/:id`) with role checks
  - AI contract generation (`POST /api/contracts/generate`)
  - Document upload with role-based access
  - Payment receipts (`POST /api/payments`)
- **Middleware**: Role validation for Notaires and Clients

## Getting Started
1. **Clone the repo**: `git clone <repo-url>`
2. **Install dependencies**: `npm install`
3. **Set up Prisma**: `npx prisma db push`
4. **Run the application**: `npm run dev`

### Environment Variables
Create a `.env` file in your project root:
```env
JWT_SECRET='your_secure_jwt_key'
OPENAI_API_KEY='your_openai_api_key'
```

## Deployment
This app can be deployed to:
- **Vercel**: Use the Vercel CLI (`vercel --prod`) to deploy
- **Render**: Deploy using the provided Dockerfile
- **AWS**: Configure EC2 instance with Node.js and PostgreSQL

## Usage
- **Notaires**:
  - Use the admin dashboard to update dossiers and generate contracts
  - Upload client documents via `documents/upload`
- **Clients**:
  - View their dossier and transaction history via the client dashboard

## Final Notes
All features are secured with role-based access control. Ensure you:
- Keep environment variables secure
- Validate all backend responses before sending to client-side
- Test AI-generated contracts for edge cases
