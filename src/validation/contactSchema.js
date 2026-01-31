const Joi = require("joi");

const contactSchema = Joi.object({
  firstName: Joi.string().alphanum().min(3).max(30).required(),

  lastName: Joi.string().alphanum().min(3).max(30).required(),

  email: Joi.string().email().required(),

  favoriteColor: Joi.string().min(2).max(20),

  birthday: Joi.date().min("1-1-1900").max("now"),
});

module.exports = {
  contactSchema,
};
