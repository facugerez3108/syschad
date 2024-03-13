import dotenv from "dotenv";
import path from "path";
import Joi from "joi";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(3000),
    SMTP_HOST: Joi.string().description("servidor que va a enviar los emails"),
    SMTP_PORT: Joi.number().description("puerto que conecta el email server"),
    SMTP_USERNAME: Joi.string().description("username para email server"),
    SMTP_PASSWORD: Joi.string().description("password para email server"),
    EMAIL_FROM: Joi.string().description(
      "emisario que envia el mail desde la app"
    ),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
};
