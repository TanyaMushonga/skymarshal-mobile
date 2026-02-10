/**
 * Parses backend error responses to extract meaningful error messages.
 * Handles common DRF (Django Rest Framework) error formats.
 */
export const getErrorMessage = (error: any): string => {
  if (!error) return 'An unexpected error occurred.';

  // If it's a string, return it directly
  if (typeof error === 'string') return error;

  // Handle Axios/Network error
  const responseData = error.response?.data;

  if (responseData) {
    // 1. Check for 'detail' (common in DRF for authentication/permission errors)
    if (responseData.detail) {
      return responseData.detail;
    }

    // 2. Check for 'non_field_errors'
    if (responseData.non_field_errors && Array.isArray(responseData.non_field_errors)) {
      return responseData.non_field_errors[0];
    }

    // 3. Handle field-specific validation errors
    // If it's an object, we take the first error of the first field
    if (typeof responseData === 'object') {
      const firstField = Object.keys(responseData)[0];
      const errors = responseData[firstField];

      if (Array.isArray(errors) && errors.length > 0) {
        // Return field name + its first error (e.g., "email: This field is required")
        // Or just the error if it feels too technical to show field names
        return `${errors[0]}`;
      }

      if (typeof errors === 'string') {
        return errors;
      }
    }
  }

  // Fallback to error message from Axios or generic message
  return error.message || 'An unexpected error occurred. Please try again.';
};
