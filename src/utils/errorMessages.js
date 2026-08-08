export function friendlyError(message) {
  if (!message) return 'Something went wrong. Please try again.'

  const lower = message.toLowerCase()

  if (lower.includes('duplicate key') && lower.includes('email')) {
    return 'An account with this email already exists.'
  }
  if (lower.includes('user already registered')) {
    return 'An account with this email already exists.'
  }
  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.'
  }
  if (lower.includes('password') && lower.includes('6 character')) {
    return 'Password must be at least 6 characters.'
  }
  if (lower.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error. Please check your connection and try again.'
  }
  if (lower.includes('violates row-level security') || lower.includes('permission denied')) {
    return "You don't have permission to do that."
  }

  return message
}