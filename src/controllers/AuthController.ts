import { NextFunction, Response } from 'express'
import { validationResult } from 'express-validator'
import { Logger } from 'winston'
import { UserService } from '../services/UserService'
import { RegisterUserRequest } from '../types'

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // Validation
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
    }

    // Create user
    const { firstName, lastName, email, password } = req.body
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      })

      this.logger.info('User has been registered:', { id: user.id })
      res.status(201).json({ id: user.id })
    } catch (error) {
      next(error)
      return
    }
  }
}
