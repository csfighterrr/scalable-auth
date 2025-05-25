# Auth Service

This is an authentication and user profile service built with Node.js and Supabase.

## Features

- User authentication (register, login, logout)
- Password reset functionality
- User profile management
- Profile picture upload

## Prerequisites

- Node.js (v14 or later)
- Supabase account and project

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_API_KEY=your_supabase_api_key
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
PORT=3000
```

4. Set up your Supabase tables:

```sql
-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Read access policy
CREATE POLICY "Users can view their own profiles" 
  ON users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Update access policy
CREATE POLICY "Users can update their own profiles" 
  ON users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Delete access policy
CREATE POLICY "Users can delete their own profiles" 
  ON users 
  FOR DELETE 
  USING (auth.uid() = id);

-- Insert access policy
CREATE POLICY "Auth service can create profiles" 
  ON users 
  FOR INSERT 
  WITH CHECK (true);
```

5. Start the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/password-reset/request` - Request password reset
- `POST /api/auth/password-reset` - Reset password with token

### User Profile

- `GET /api/users/profile` - Get current user's profile
- `GET /api/users/profile/:userId` - Get a user's profile by ID
- `PUT /api/users/profile` - Update current user's profile
- `DELETE /api/users/profile` - Delete current user's account
- `POST /api/users/profile/upload-picture` - Upload profile picture

## License

MIT
# scalable-auth
# scalable-auth
