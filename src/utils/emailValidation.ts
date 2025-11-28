// List of common temporary/disposable email domains
const TEMP_EMAIL_DOMAINS = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'throwaway.email',
  'yopmail.com',
  'tempmail.com',
  'fakemailgenerator.com',
  'maildrop.cc',
  'getnada.com',
  'trashmail.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamail.info',
  'spam4.me',
  'mailnesia.com',
  'temp-mail.io',
  'tempinbox.com',
  'mohmal.com',
  'dispostable.com',
  '0-mail.com',
  'getairmail.com',
  'mintemail.com',
  'mytemp.email',
  'emailondeck.com',
  'throwawaymail.com'
];

export function isTemporaryEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  return TEMP_EMAIL_DOMAINS.some(tempDomain => domain.includes(tempDomain));
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (isTemporaryEmail(email)) {
    return { valid: false, error: 'Temporary/disposable email addresses are not allowed' };
  }
  
  return { valid: true };
}

export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (name.trim().length > 100) {
    return { valid: false, error: 'Name must be less than 100 characters' };
  }
  
  // Check for valid name characters (Unicode letters, spaces, hyphens, apostrophes)
  // Using Unicode property escapes for international character support
  const nameRegex = /^[\p{L}\s'-]+$/u;
  if (!nameRegex.test(name.trim())) {
    return { valid: false, error: 'Name contains invalid characters' };
  }
  
  return { valid: true };
}
