import { NextFunction, Response } from 'express'
import { validationResult } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { Logger } from 'winston'
import { TokenService } from '../services/TokenService'
import { UserService } from '../services/UserService'
import { RegisterUserRequest } from '../types'

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
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

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      }

      const accessToken = this.tokenService.generateAccessToken(payload)

      // Persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user)
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      })

      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true,
      })

      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
      })

      res.status(201).json({ id: user.id })
    } catch (error) {
      next(error)
      return
    }
  }
}
