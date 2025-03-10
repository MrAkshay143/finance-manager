/**
 * Form Validation Utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 */
export function isStrongPassword(password) {
  if (password.length < 8) return false;
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber;
}

/**
 * Get password strength feedback
 */
export function getPasswordStrength(password) {
  if (!password) return { score: 0, feedback: 'Password is required' };
  
  let score = 0;
  let feedback = [];
  
  // Length check
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters');
  } else {
    score += 1;
  }
  
  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push('Add an uppercase letter');
  } else {
    score += 1;
  }
  
  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push('Add a lowercase letter');
  } else {
    score += 1;
  }
  
  // Number check
  if (!/[0-9]/.test(password)) {
    feedback.push('Add a number');
  } else {
    score += 1;
  }
  
  // Special character check
  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Add a special character');
  } else {
    score += 1;
  }
  
  // Return score and feedback
  return {
    score,
    feedback: feedback.join(', ') || 'Strong password',
    isStrong: score >= 4
  };
}

/**
 * Validate amount format (positive number with up to 2 decimal places)
 */
export function isValidAmount(amount) {
  if (typeof amount === 'number') {
    return amount > 0;
  }
  
  if (typeof amount === 'string') {
    const amountRegex = /^[0-9]+(\.[0-9]{1,2})?$/;
    return amountRegex.test(amount) && parseFloat(amount) > 0;
  }
  
  return false;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDate(date) {
  if (!date) return false;
  
  // Check format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  // Check if date is valid
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Validate form fields
 * @param {Object} fields - Object with field names as keys and validation rules as values
 * @param {Object} values - Object with field names as keys and field values as values
 * @returns {Object} - Object with field names as keys and error messages as values
 */
export function validateForm(fields, values) {
  const errors = {};
  
  Object.entries(fields).forEach(([field, rules]) => {
    const value = values[field];
    
    // Required check
    if (rules.required && (!value || value.trim() === '')) {
      errors[field] = `${rules.label || field} is required`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return;
    
    // Email check
    if (rules.type === 'email' && !isValidEmail(value)) {
      errors[field] = `${rules.label || field} must be a valid email address`;
    }
    
    // Password check
    if (rules.type === 'password' && rules.strong && !isStrongPassword(value)) {
      errors[field] = `${rules.label || field} must be at least 8 characters and include uppercase, lowercase, and numbers`;
    }
    
    // Amount check
    if (rules.type === 'amount' && !isValidAmount(value)) {
      errors[field] = `${rules.label || field} must be a positive number`;
    }
    
    // Date check
    if (rules.type === 'date' && !isValidDate(value)) {
      errors[field] = `${rules.label || field} must be a valid date`;
    }
    
    // Min length check
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = `${rules.label || field} must be at least ${rules.minLength} characters`;
    }
    
    // Max length check
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${rules.label || field} must be at most ${rules.maxLength} characters`;
    }
    
    // Custom validation
    if (rules.validate && typeof rules.validate === 'function') {
      const customError = rules.validate(value, values);
      if (customError) {
        errors[field] = customError;
      }
    }
  });
  
  return errors;
} 