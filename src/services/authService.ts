import jwt from 'jsonwebtoken';
import supabase from '../config/supabase';

export interface UserTokenPayload {
  userId: string;
  email: string;
}

export async function registerUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logoutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

export function generateToken(user: UserTokenPayload): string {
  const secret = process.env.JWT_SECRET as string;
  // access tokens expire in 1 hour
  return jwt.sign({ userId: user.userId, email: user.email }, secret, { expiresIn: '1h' });
}

// generate refresh token with 3 days expiry
export function generateRefreshToken(user: UserTokenPayload): string {
  const refreshSecret = process.env.JWT_REFRESH_SECRET as string;
  return jwt.sign({ userId: user.userId, email: user.email }, refreshSecret, { expiresIn: '3d' });
}

export function verifyToken(token: string): UserTokenPayload {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as UserTokenPayload;
}

// verify refresh token
export function verifyRefreshToken(token: string): UserTokenPayload {
  const refreshSecret = process.env.JWT_REFRESH_SECRET as string;
  return jwt.verify(token, refreshSecret) as UserTokenPayload;
}
