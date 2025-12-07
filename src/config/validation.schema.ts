import * as Joi from 'joi';

export function validateEnv(): void {
  const envSchema = Joi.object({
    // Database configuration
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),

    // Application configuration
    NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
    PORT: Joi.number().optional().default(3000),
    API_VERSION: Joi.string().optional().default('v1'),

    // JWT configuration
    JWT_ACCESS_SECRET: Joi.string().min(32).required(),
    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
    JWT_ACCESS_EXPIRATION: Joi.string().required(),
    JWT_REFRESH_EXPIRATION: Joi.string().required(),

    // Frontend URL - required and must be valid URI without trailing slash
    FRONTEND_URL: Joi.string()
      .uri()
      .pattern(/[^\/]$/, 'no trailing slash')
      .required()
      .messages({
        'string.pattern.name': 'FRONTEND_URL must not have a trailing slash',
        'any.required': 'FRONTEND_URL is required',
        'string.uri': 'FRONTEND_URL must be a valid URI',
      }),

    // Optional Google OAuth configuration
    GOOGLE_CLIENT_ID: Joi.string().optional(),
    GOOGLE_CLIENT_SECRET: Joi.string().optional(),
    GOOGLE_CALLBACK_URL: Joi.string().uri().optional(),

    // Optional email configuration
    EMAIL_HOST: Joi.string().optional(),
    EMAIL_PORT: Joi.number().optional(),
    EMAIL_USER: Joi.string().optional(),
    EMAIL_PASSWORD: Joi.string().optional(),
    EMAIL_FROM: Joi.string().email().optional(),

    // Nodemailer configuration (used in email service)
    NODEMAILER_EMAIL: Joi.string().email().optional(),
    NODEMAILER_PASSWORD: Joi.string().optional(),
  }).unknown(true); // Allow other environment variables

  const { error } = envSchema.validate(process.env, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail: Joi.ValidationErrorItem) => detail.message).join(', ');
    throw new Error(`Environment validation failed: ${errorMessages}`);
  }
}