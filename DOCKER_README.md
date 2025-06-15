# Auth Service Docker Image

A scalable authentication service built with Node.js and Express, integrated with Supabase for database operations.

## Features

- User registration and authentication
- JWT token-based authentication
- Password hashing with bcrypt
- Supabase integration
- CORS enabled
- Comprehensive logging
- Input validation middleware

## Quick Start

### Using Docker

```bash
# Pull the image
docker pull your-dockerhub-username/auth-service:latest

# Run with environment variables
docker run -p 3000:3000 \
  -e SUPABASE_URL=your_supabase_url \
  -e SUPABASE_API_KEY=your_supabase_api_key \
  -e JWT_SECRET=your_jwt_secret \
  -e JWT_EXPIRES_IN=24h \
  your-dockerhub-username/auth-service:latest
```

### Using Docker Compose

```yaml
version: '3.8'
services:
  auth-service:
    image: your-dockerhub-username/auth-service:latest
    ports:
      - "3000:3000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_API_KEY=${SUPABASE_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
      - NODE_ENV=production
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_API_KEY` | Your Supabase API key | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | No (default: 24h) |
| `NODE_ENV` | Node environment | No (default: production) |
| `PORT` | Server port | No (default: 3000) |

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Routes
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)

## Health Check

The service exposes a health check endpoint at `/health`

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation
- CORS configuration
- Rate limiting (recommended to add reverse proxy)

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/your-username/auth-service).

## License

ISC License
