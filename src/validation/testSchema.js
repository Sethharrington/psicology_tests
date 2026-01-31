const Joi = require("joi");

const optionSchema = Joi.array().items(
  Joi.object().keys({
    optionNumber: Joi.number().min(0).max(10),
    option: Joi.string().min(1).max(500).required(),
    isCorrect: Joi.boolean().required(),
  }),
);

const questionSchema = Joi.array().items(
  Joi.object().keys({
    question: Joi.string().min(3).max(500).required(),
    questionType: Joi.string().valid('text', 'single choice', 'multiple choice').required(),
    options: optionSchema,
  }),
);
const testSchema = Joi.object().keys({
  testType: Joi.string().min(3).max(100).required(),
  testName: Joi.string().min(2).max(100).required(),
  questions: questionSchema,
});

module.exports = {
  testSchema,
};
