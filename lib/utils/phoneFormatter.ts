/**
 * Utility functions for Indonesian phone number formatting
 */

/**
 * Format phone number to Indonesian format (+62)
 * @param phoneNumber - Raw phone number input
 * @returns Formatted phone number with +62 prefix
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle different input formats
  if (cleaned.startsWith('62')) {
    // Already has country code without +
    cleaned = cleaned;
  } else if (cleaned.startsWith('0')) {
    // Remove leading 0 and add 62
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.length >= 9 && cleaned.length <= 13) {
    // Assume it's a local number without leading 0
    cleaned = '62' + cleaned;
  }
  
  // Add + prefix
  return '+' + cleaned;
};

/**
 * Format phone number for display (with spaces for readability)
 * @param phoneNumber - Phone number with +62 prefix
 * @returns Formatted phone number for display
 */
export const formatPhoneNumberDisplay = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  const formatted = formatPhoneNumber(phoneNumber);
  
  // Add spaces for better readability: +62 812 3456 7890
  if (formatted.startsWith('+62')) {
    const number = formatted.substring(3); // Remove +62
    if (number.length >= 9) {
      return `+62 ${number.substring(0, 3)} ${number.substring(3, 7)} ${number.substring(7)}`;
    }
  }
  
  return formatted;
};

/**
 * Format phone number for WhatsApp (without + and spaces)
 * @param phoneNumber - Phone number input
 * @returns Clean phone number for WhatsApp URL
 */
export const formatPhoneNumberForWhatsApp = (phoneNumber: string): string => {
  const formatted = formatPhoneNumber(phoneNumber);
  return formatted.replace(/\D/g, ''); // Remove all non-numeric characters including +
};

/**
 * Validate Indonesian phone number
 * @param phoneNumber - Phone number to validate
 * @returns Boolean indicating if phone number is valid
 */
export const validateIndonesianPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;
  
  const formatted = formatPhoneNumber(phoneNumber);
  const cleaned = formatted.replace(/\D/g, '');
  
  // Indonesian phone numbers should be 11-13 digits with 62 prefix
  return cleaned.startsWith('62') && cleaned.length >= 11 && cleaned.length <= 13;
};

/**
 * Get phone number input mask for Indonesian numbers
 * @returns Input mask pattern
 */
export const getPhoneNumberMask = (): string => {
  return '+62 999 9999 9999';
};

/**
 * Parse display format back to storage format
 * @param displayNumber - Phone number in display format
 * @returns Phone number in storage format (+62xxxxxxxxxx)
 */
export const parseDisplayPhoneNumber = (displayNumber: string): string => {
  if (!displayNumber) return '';
  return formatPhoneNumber(displayNumber);
};