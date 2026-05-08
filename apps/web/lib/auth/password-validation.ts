export function validatePassword(pw: string): { valid: boolean; message: string } {
  if (pw.length < 8) return { valid: false, message: 'Password must be at least 8 characters.' }
  if (!/[A-Z]/.test(pw)) return { valid: false, message: 'Password must contain at least one uppercase letter.' }
  if (!/[!@#$%^&*]/.test(pw)) return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*).' }
  return { valid: true, message: '' }
}
