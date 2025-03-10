'use client';

import { useState } from 'react';
import { validateForm } from '@/utils/validation';

export default function Form({
  fields,
  initialValues = {},
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  isSubmitting = false,
  className = '',
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: inputValue
    }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm(fields, values);
    setErrors(formErrors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(fields).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // If no errors, submit form
    if (Object.keys(formErrors).length === 0) {
      onSubmit(values);
    }
  };
  
  // Render form fields
  const renderField = (name, field) => {
    const { label, type = 'text', placeholder, options, className = '', ...rest } = field;
    const value = values[name] || '';
    const error = touched[name] && errors[name];
    
    // Common props for all input types
    const commonProps = {
      id: name,
      name,
      value,
      onChange: handleChange,
      className: `w-full px-3 py-2 border ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${className}`,
      ...rest
    };
    
    // Render different input types
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={placeholder || label}
            rows={field.rows || 3}
          />
        );
        
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={!!value}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={name} className="ml-2 block text-sm text-gray-700">
              {label}
            </label>
          </div>
        );
        
      case 'radio':
        return (
          <div className="space-y-2">
            {options.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${name}-${option.value}`}
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor={`${name}-${option.value}`} className="ml-2 block text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
        
      default:
        return (
          <input
            type={type}
            {...commonProps}
            placeholder={placeholder || label}
          />
        );
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {Object.entries(fields).map(([name, field]) => (
          <div key={name} className="form-group">
            {field.type !== 'checkbox' && (
              <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
            )}
            
            {renderField(name, field)}
            
            {touched[name] && errors[name] && (
              <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
            )}
          </div>
        ))}
        
        <div className="pt-4 flex space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              {cancelText}
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center ${onCancel ? '' : 'w-full'}`}
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                Submitting...
              </>
            ) : (
              submitText
            )}
          </button>
        </div>
      </div>
    </form>
  );
} 