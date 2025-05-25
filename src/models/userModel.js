/**
 * User model schema
 * This file defines the user schema and validation rules
 */

/**
 * User schema definition
 */
const userSchema = {
  id: {
    type: 'string',
    format: 'uuid',
    required: true
  },
  email: {
    type: 'string',
    format: 'email',
    required: true
  },
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100
  },
  bio: {
    type: 'string',
    required: false,
    maxLength: 500
  },
  avatar_url: {
    type: 'string',
    format: 'uri',
    required: false
  },
  phone: {
    type: 'string',
    required: false,
    maxLength: 20
  },
  address: {
    type: 'string',
    required: false,
    maxLength: 200
  },
  role: {
    type: 'string',
    enum: ['user', 'admin'],
    default: 'user'
  },
  created_at: {
    type: 'string',
    format: 'date-time'
  },
  updated_at: {
    type: 'string',
    format: 'date-time'
  }
};

/**
 * Validates user data against schema
 * @param {Object} userData - User data to validate
 * @param {boolean} isPartial - If true, only validates provided fields
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
function validateUser(userData, isPartial = false) {
  const errors = [];
  
  // Loop through schema fields for validation
  for (const [field, rules] of Object.entries(userSchema)) {
    // Skip validation if field is not provided and we're doing partial validation
    if (isPartial && userData[field] === undefined) {
      continue;
    }
    
    const value = userData[field];
    
    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Skip further validation if value is not provided
    if (value === undefined || value === null) {
      continue;
    }
    
    // Type validation
    if (rules.type === 'string' && typeof value !== 'string') {
      errors.push(`${field} must be a string`);
    }
    
    // String length validation
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be no more than ${rules.maxLength} characters`);
      }
    }
    
    // Format validation
    if (rules.format === 'email' && typeof value === 'string') {
      // Simple email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${field} must be a valid email address`);
      }
    }
    
    // URI format validation
    if (rules.format === 'uri' && typeof value === 'string') {
      try {
        new URL(value);
      } catch {
        errors.push(`${field} must be a valid URL`);
      }
    }
    
    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  userSchema,
  validateUser
};
