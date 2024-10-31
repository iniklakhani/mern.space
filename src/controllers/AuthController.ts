import { NextFunction, Response } from 'express'
import { validationResult } from 'express-validator'
import fs from 'fs'
import createHttpError from 'http-errors'
import { JwtPayload, sign } from 'jsonwebtoken'
import path from 'path'
import { Logger } from 'winston'
import { Config } from '../config'
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

      let privateKey: Buffer
      try {
        privateKey = fs.readFileSync(
          path.join(__dirname, '../../certs/private.pem'),
        )
      } catch {
        const error = createHttpError(500, 'Error while reading private key')
        next(error)
        return
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      }

      const accessToken = sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '1h',
        issuer: 'auth-service',
      })

      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
        algorithm: 'HS256',
        expiresIn: '1y',
        issuer: 'auth-service',
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
