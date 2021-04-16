const Joi = require("joi");
const sanitizeHtml = require("sanitize-html");

// Added a new validator for Joi to check If some user input contains
// any html code. If so throw a validation error.
module.exports = Joi.extend((joi) => {
  return {
    type: "string",
    base: joi.string(),
    messages: {
      "string.escapeHTML": "{{#label}} must not contain any HTML!",
    },
    rules: {
      escapeHTML: {
        validate(value, helpers) {
          const clean = sanitizeHtml(value, {
            allowedTags: [],
            allowedAttributes: {},
          });
          if (value !== clean) {
            return helpers.error("string.escapeHTML", { value });
          }
          return clean;
        },
      },
    },
  };
});
