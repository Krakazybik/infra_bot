const z = require('zod');

const regSchema = z
  .string()
  .min(1, { message: 'This field has to be filled.' })
  .email('This is not a valid email.');

module.exports = {
  regSchema,
};
