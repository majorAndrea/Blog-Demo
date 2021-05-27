const Joi = require(".");

const userValidationSchema = Joi.object({
  username: Joi.string().escapeHTML().alphanum().min(3).max(16).required(),
  email: Joi.string().email().required(),
  password: Joi.string().escapeHTML().min(3).max(36).required(),
  repeat_password: Joi.ref("password"),
  profileVisits: Joi.number(),
})
  .with("password", "repeat_password")
  .required();

const userUpdateValidationSchema = Joi.object({
  bio: Joi.string().escapeHTML().min(12).max(200),
  username: Joi.string().escapeHTML().alphanum().min(3).max(16),
  birthday: Joi.date(),
}).required();

module.exports = { userValidationSchema, userUpdateValidationSchema };
