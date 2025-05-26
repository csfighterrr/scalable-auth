export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  role?: 'user' | 'admin';
  created_at: string;
  updated_at?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const userSchema = {
  id: { type: 'string', format: 'uuid', required: true },
  email: { type: 'string', format: 'email', required: true },
  name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
  bio: { type: 'string', required: false, maxLength: 500 },
  avatar_url: { type: 'string', format: 'uri', required: false },
  phone: { type: 'string', required: false, maxLength: 20 },
  address: { type: 'string', required: false, maxLength: 200 },
  role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
  created_at: { type: 'string', format: 'date-time', required: true },
  updated_at: { type: 'string', format: 'date-time', required: false },
};

export function validateUser(userData: Record<string, any>, isPartial = false): ValidationResult {
  const errors: string[] = [];

  for (const [field, rules] of Object.entries(userSchema)) {
    if (isPartial && userData[field] === undefined) continue;
    const value = userData[field];
    if (!isPartial && rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    if (value === undefined || value === null) continue;
    if (rules.type === 'string' && typeof value !== 'string') {
      errors.push(`${field} must be a string`);
    }
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be no more than ${rules.maxLength} characters`);
      }
    }
    if (rules.format === 'email' && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${field} must be a valid email address`);
      }
    }
    if (rules.format === 'uri' && typeof value === 'string') {
      try {
        new URL(value);
      } catch {
        errors.push(`${field} must be a valid URL`);
      }
    }
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }
  }

  return { isValid: errors.length === 0, errors };
}
