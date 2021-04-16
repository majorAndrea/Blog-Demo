const Joi = require(".");

const commentValidationSchema = Joi.object({
  text: Joi.string().escapeHTML().min(12).max(224).required(),
}).required();

module.exports = commentValidationSchema;
