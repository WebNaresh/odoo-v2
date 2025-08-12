// In-memory storage for OTPs (in production, use Redis or database)
export const otpStorage = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// Cleanup expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStorage.entries()) {
    if (data.expiresAt < now) {
      otpStorage.delete(email);
    }
  }
}, 60000); // Clean up every minute
