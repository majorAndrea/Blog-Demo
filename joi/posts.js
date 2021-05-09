const Joi = require(".");

const postValidationSchema = Joi.object({
  title: Joi.string().escapeHTML().min(24).max(96).required(),
  image: Joi.any(),
  text: Joi.string().escapeHTML().min(128).max(2048).required(),
  categories: Joi.alternatives()
    .try(Joi.array(), Joi.string().escapeHTML())
    .required(),
  location: Joi.string().escapeHTML().allow(""),
}).required();

module.exports = postValidationSchema;
