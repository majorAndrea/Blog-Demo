const Joi = require(".");

const postRules = {
  title: {
    MIN_LENGTH: 24,
    MAX_LENGTH: 96,
  },
  text: {
    MIN_LENGTH: 256,
    MAX_LENGTH: 2048,
  },
  location: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 36,
  },
};

const postValidationSchema = Joi.object({
  title: Joi.string()
    .escapeHTML()
    .min(postRules.title.MIN_LENGTH)
    .max(postRules.title.MAX_LENGTH)
    .required(),
  image: Joi.any(),
  text: Joi.string()
    .escapeHTML()
    .min(postRules.text.MIN_LENGTH)
    .max(postRules.text.MAX_LENGTH)
    .required(),
  categories: Joi.alternatives()
    .try(Joi.array(), Joi.string().escapeHTML())
    .required(),
  location: Joi.string()
    .escapeHTML()
    .min(postRules.location.MIN_LENGTH)
    .max(postRules.location.MAX_LENGTH)
    .allow(""),
}).required();

module.exports = { postValidationSchema, postRules };
