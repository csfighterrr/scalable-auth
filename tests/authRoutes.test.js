const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/index');
const authService = require('../src/services/authService');
const userService = require('../src/services/userService');

jest.mock('../src/services/authService');
jest.mock('../src/services/userService');

describe('Auth Endpoints', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
  });

  it('GET /health returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'auth-service' });
  });

  it('POST /api/auth/register creates a new user', async () => {
    userService.findUserByEmail.mockResolvedValue(null);
    authService.registerUser.mockResolvedValue({ user: { id: '123' } });
    userService.createUserProfile.mockResolvedValue();

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@example.com', password: 'password', name: 'NewUser' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('userId', '123');
  });

  it('POST /api/auth/login returns token and user data', async () => {
    authService.loginUser.mockResolvedValue({ user: { id: '123', email: 'test@example.com' } });
    userService.findUserById.mockResolvedValue({ id: '123', email: 'test@example.com', name: 'TestName' });
    authService.generateToken.mockReturnValue('testtoken');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token', 'testtoken');
    expect(res.body.user).toMatchObject({ id: '123', email: 'test@example.com', name: 'TestName' });
  });

  it('POST /api/auth/logout returns success message', async () => {
    authService.logoutUser.mockResolvedValue();

    const res = await request(app)
      .post('/api/auth/logout');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Logged out successfully' });
  });

  describe('Protected routes require token', () => {
    it('GET /api/auth/me without token returns 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('GET /api/auth/me with valid token returns user', async () => {
      const token = jwt.sign({ userId: '123' }, process.env.JWT_SECRET);
      userService.findUserById.mockResolvedValue({ id: '123', email: 'a@b.com', name: 'Name' });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toMatchObject({ id: '123', email: 'a@b.com', name: 'Name' });
    });

    it('POST /api/auth/password-reset/request sends email', async () => {
      authService.requestPasswordReset.mockResolvedValue();
      const res = await request(app)
        .post('/api/auth/password-reset/request')
        .send({ email: 'a@b.com' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('POST /api/auth/password-reset updates password', async () => {
      authService.updatePassword.mockResolvedValue();
      const res = await request(app)
        .post('/api/auth/password-reset')
        .send({ newPassword: 'newpassword' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
  });
});
