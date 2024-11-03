import { NextFunction, Response } from 'express'
import { validationResult } from 'express-validator'
import createHttpError from 'http-errors'
import { JwtPayload } from 'jsonwebtoken'
import { Logger } from 'winston'
import { CredentialService } from '../services/CredentialService'
import { TokenService } from '../services/TokenService'
import { UserService } from '../services/UserService'
import { AuthRequest, RegisterUserRequest } from '../types'

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialService: CredentialService,
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

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // Validation
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
    }

    // Login user
    const { email, password } = req.body
    try {
      // Check if username (email) exists in the database
      const user = await this.userService.findByEmail(email)
      if (!user) {
        const error = createHttpError(400, 'Email or password does not match.')
        next(error)
        return
      }

      // Compare password
      const passwordMatch = await this.credentialService.comparePassword(
        password,
        user.password,
      )
      if (!passwordMatch) {
        const error = createHttpError(400, 'Email or password does not match.')
        next(error)
        return
      }

      // Generate tokens
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      }
      const accessToken = this.tokenService.generateAccessToken(payload)
      const newRefreshToken = await this.tokenService.persistRefreshToken(user)
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      })

      // Add tokens to cookie
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

      // Return the response (id)
      res.status(200).json({ id: user.id })
    } catch (error) {
      next(error)
      return
    }
  }

  async self(req: AuthRequest, res: Response) {
    const user = await this.userService.findById(Number(req.auth.sub))
    res.status(200).json({ ...user, password: undefined })
    return
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const auth = req.auth

      const payload: JwtPayload = {
        sub: String(auth.sub),
        role: auth.role,
      }

      const accessToken = this.tokenService.generateAccessToken(payload)
      const user = await this.userService.findById(Number(req.auth.sub))
      if (!user) {
        const error = createHttpError(
          400,
          'User with the token could not find.',
        )
        next(error)
        return
      }

      // create new refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user)

      // Delete old refresh token
      await this.tokenService.deleteRefreshToken(Number(req.auth.id))

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      })

      // Add tokens to cookie
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

      res.status(200).json({ id: user.id })
    } catch (error) {
      next(error)
      return
    }
  }
}
