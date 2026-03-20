const requiredVars = [
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET',
];

const warningVars = [
  'ADMIN_JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

export const validateRuntimeEnv = () => {
  const missingRequired = requiredVars.filter((key) => !process.env[key]);
  if (missingRequired.length > 0) {
    throw new Error(`Missing required environment variables: ${missingRequired.join(', ')}`);
  }

  const missingWarnings = warningVars.filter((key) => !process.env[key]);
  if (missingWarnings.length > 0) {
    console.warn(`⚠️ Optional but recommended env vars are missing: ${missingWarnings.join(', ')}`);
  }
};
