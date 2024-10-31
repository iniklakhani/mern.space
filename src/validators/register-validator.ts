import { body } from 'express-validator'

export default [
  body('email').trim().notEmpty().withMessage('Email is required.'),
]
