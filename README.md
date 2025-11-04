# KYC/KYB Backend API

This repository contains the backend API for the KYC/KYB project. It is built with NestJS, a progressive Node.js framework for building efficient, reliable, and scalable server-side applications.

## Features

- **Authentication:** Secure user authentication and authorization using JWT and Google OAuth.
- **User Management:** Create, read, update, and delete users.
- **Subscriber Management:** Manage subscribers and their associated users.
- **Email Service:** Send emails for password resets and welcome messages.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v14 or later)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/YasserEma/kyc-kyb-backend.git
   cd kyc-kyb-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root of the project and add the following environment variables:

   ```
   DATABASE_URL=your-database-url
   JWT_SECRET=your-jwt-secret
   GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id
   GOOGLE_OAUTH_CLIENT_SECRET=your-google-oauth-client-secret
   GOOGLE_OAUTH_CALLBACK_URL=your-google-oauth-callback-url
   EMAIL_HOST=your-email-host
   EMAIL_PORT=your-email-port
   EMAIL_SECURE=your-email-secure
   EMAIL_USER=your-email-user
   EMAIL_PASS=your-email-pass
   EMAIL_FROM=your-email-from
   FRONTEND_URL=your-frontend-url
   ```

### Running the Application

1. **Start the database:**

   ```bash
   docker-compose up -d
   ```

2. **Run the application:**

   ```bash
   npm run start:dev
   ```

The application will be running on `http://localhost:3000`.
