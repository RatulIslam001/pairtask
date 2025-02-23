import { createMocks } from 'node-mocks-http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { POST } from '@/app/api/auth/register/route';
import { User } from '@/models/user';

describe('Registration API', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should create a new user successfully', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      },
      headers: {
        'x-csrf-token': 'test-token',
      },
      cookies: {
        'csrf-token': 'test-token',
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('User registered successfully');
    expect(data.user.name).toBe('Test User');
    expect(data.user.email).toBe('test@example.com');
    expect(data.user.password).toBeUndefined();
  });

  it('should return error for existing email', async () => {
    await User.create({
      name: 'Existing User',
      email: 'test@example.com',
      password: 'password123',
    });

    const { req } = createMocks({
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      },
      headers: {
        'x-csrf-token': 'test-token',
      },
      cookies: {
        'csrf-token': 'test-token',
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User with this email already exists');
  });

  it('should validate input data', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        name: 'T', // Too short
        email: 'invalid-email',
        password: '123', // Too short
      },
      headers: {
        'x-csrf-token': 'test-token',
      },
      cookies: {
        'csrf-token': 'test-token',
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it('should check CSRF token', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      },
      headers: {
        'x-csrf-token': 'wrong-token',
      },
      cookies: {
        'csrf-token': 'test-token',
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Invalid CSRF token');
  });
}); 