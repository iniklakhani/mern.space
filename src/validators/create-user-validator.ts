import { checkSchema } from 'express-validator'
import { Roles } from '../constants'

export default checkSchema({
  email: {
    trim: true,
    errorMessage: 'Email is required.',
    notEmpty: true,
    isEmail: {
      errorMessage: 'Email should be a valid email.',
    },
  },
  firstName: {
    errorMessage: 'First name is required.',
    notEmpty: true,
    trim: true,
  },
  lastName: {
    errorMessage: 'Last name is required.',
    notEmpty: true,
    trim: true,
  },
  password: {
    trim: true,
    errorMessage: 'Last name is required.',
    notEmpty: true,
    isLength: {
      options: {
        min: 8,
      },
      errorMessage: 'Password length should be at least 8 chars.',
    },
  },
  role: {
    errorMessage: 'Role is required.',
    notEmpty: true,
    trim: true,
    isIn: {
      options: [[Roles.CUSTOMER, Roles.MANAGER]],
      errorMessage: 'Selected role is not allowed.',
    },
  },
})
