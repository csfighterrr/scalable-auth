const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/index');
const userService = require('../src/services/userService');
const supabase = require('../src/config/supabase');

jest.mock('../src/services/userService');
jest.mock('../src/config/supabase', () => {
  const mockAuthAdmin = { deleteUser: jest.fn().mockResolvedValue({ error: null }) };
  const mockFrom = jest.fn().mockImplementation(() => ({
    delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    update: () => ({ eq: () => Promise.resolve({ error: null }) }),
  }));
  const mockStorage = {
    from: () => ({
      upload: () => Promise.resolve({ data: {}, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: 'http://url' } }),
    }),
  };
  return {
    auth: { admin: mockAuthAdmin },
    from: mockFrom,
    storage: mockStorage,
  };
});

describe('User Endpoints', () => {
  let token;
  beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
    token = jwt.sign({ userId: '123' }, process.env.JWT_SECRET);
  });

  it('GET /api/users/profile without token returns 401', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/users/profile with token returns user profile', async () => {
    userService.findUserById.mockResolvedValue({ id: '123', email: 'a@b.com', name: 'Name', password: 'hashed' });
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.profile).toEqual({ id: '123', email: 'a@b.com', name: 'Name' });
  });

  it('GET /api/users/profile/:userId returns specified user profile', async () => {
    userService.findUserById.mockResolvedValue({ id: '456', email: 'b@c.com', name: 'Other', password: 'hashed' });
    const res = await request(app)
      .get('/api/users/profile/456')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.profile).toEqual({ id: '456', email: 'b@c.com', name: 'Other' });
  });

  it('PUT /api/users/profile updates user profile', async () => {
    const updated = { id: '123', email: 'a@b.com', name: 'NewName', bio: '', avatar_url: '', phone: '', address: '' };
    userService.updateUserProfile.mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'NewName' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Profile updated successfully');
    expect(res.body.profile).toEqual(updated);
  });

  it('DELETE /api/users/profile deletes user profile', async () => {
    const res = await request(app)
      .delete('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'User deleted successfully' });
  });

  it('POST /api/users/profile/upload-picture uploads profile picture', async () => {
    const image = { base64String: 'dGVzdA==', filename: 'test.png', contentType: 'image/png' };
    const res = await request(app)
      .post('/api/users/profile/upload-picture')
      .set('Authorization', `Bearer ${token}`)
      .send({ image });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('avatar_url', 'http://url');
  });
});
