import * as Joi from "joi";

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").required(),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_PASSWORD: Joi.string().optional(),

  RESEND_API_KEY: Joi.string().required(),
  RESEND_FROM_EMAIL: Joi.string().email().required(),

  //GOOGLE_CLIENT_ID: Joi.string().required(),
  //GOOGLE_CLIENT_SECRET: Joi.string().required(),
  //GOOGLE_REDIRECT_URI: Joi.string().uri().required(),

});