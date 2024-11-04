import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import createHttpError from 'http-errors'
import { Logger } from 'winston'
import { Roles } from '../constants'
import { UserService } from '../services/UserService'
import { CreateUserRequest } from '../types'

export class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
    }

    const { firstName, lastName, email, password } = req.body

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.MANAGER,
      })

      res.status(201).json({ id: user.id })
    } catch (error) {
      next(error)
      return
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getAll()
      res.json(users)
    } catch (error) {
      next(error)
      return
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id
    if (isNaN(Number(userId))) {
      const error = createHttpError(400, 'Invalid request.')
      next(error)
      return
    }

    try {
      const user = await this.userService.getById(Number(userId))
      if (!user) {
        next(createHttpError(404, 'User not found.'))
        return
      }

      res.json(user)
    } catch (error) {
      next(error)
      return
    }
  }
}
