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

## API Documentation

Base URL: `http://localhost:3000`

### Authentication Endpoints

#### 1. Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password",
    "name": "John Doe"
  }'
```
Response (201):
```json
{
  "message": "User registered successfully. Please check your email for verification.",
  "userId": "user_id"
}
```

#### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```
Response (200):
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### 3. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout
```
Response (200):
```json
{
  "message": "Logged out successfully"
}
```

#### 4. Get Current User
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
Response (200):
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### 5. Request Password Reset
```bash
curl -X POST http://localhost:3000/api/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```
Response (200):
```json
{
  "message": "Password reset email sent. Please check your email."
}
```

#### 6. Reset Password
```bash
curl -X POST http://localhost:3000/api/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "new_password"
  }'
```
Response (200):
```json
{
  "message": "Password reset successful"
}
```

### User Profile Endpoints

#### 1. Get Current User's Profile
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
Response (200):
```json
{
  "profile": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "bio": "",
    "avatar_url": "",
    "phone": "",
    "address": ""
  }
}
```

#### 2. Get User Profile by ID
```bash
curl -X GET http://localhost:3000/api/users/profile/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
Response (200):
```json
{
  "profile": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "bio": "",
    "avatar_url": "",
    "phone": "",
    "address": ""
  }
}
```

#### 3. Update User Profile
```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "bio": "Software Developer",
    "phone": "+1234567890",
    "address": "123 Main St"
  }'
```
Response (200):
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Smith",
    "bio": "Software Developer",
    "avatar_url": "",
    "phone": "+1234567890",
    "address": "123 Main St"
  }
}
```

#### 4. Upload Profile Picture
```bash
curl -X POST http://localhost:3000/api/users/profile/upload-picture \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image": {
      "base64String": "BASE64_ENCODED_IMAGE",
      "filename": "profile.jpg",
      "contentType": "image/jpeg"
    }
  }'
```
Response (200):
```json
{
  "avatar_url": "http://storage-url/profile-picture.jpg"
}
```

#### 5. Delete User Profile
```bash
curl -X DELETE http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
Response (200):
```json
{
  "message": "User deleted successfully"
}
```

### Health Check Endpoint

#### Check Service Health
```bash
curl -X GET http://localhost:3000/health
```
Response (200):
```json
{
  "status": "ok",
  "service": "auth-service"
}
```

### Important Notes

1. All requests except registration, login, and health check require a valid JWT token in the Authorization header.
2. The token format should be: `Bearer YOUR_JWT_TOKEN`
3. For profile picture upload, the image should be base64 encoded and must not exceed the size limit (10MB).
4. All responses include appropriate HTTP status codes:
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 409: Conflict (e.g., email already exists)
   - 500: Internal Server Error
- `PUT /api/users/profile` - Update current user's profile
- `DELETE /api/users/profile` - Delete current user's account
- `POST /api/users/profile/upload-picture` - Upload profile picture

## License

MIT
