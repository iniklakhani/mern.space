import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import createHttpError from 'http-errors'
import { Logger } from 'winston'
import { UserService } from '../services/UserService'
import { CreateUserRequest, UpdateUserRequest } from '../types'

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

    const { firstName, lastName, email, password, role, tenantId } = req.body

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
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

  async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
    // currently, we don't allow to change the email address
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
    }

    const { firstName, lastName, role } = req.body
    const userId = req.params.id

    if (isNaN(Number(userId))) {
      next(createHttpError(400, 'Invalid request.'))
      return
    }

    try {
      await this.userService.update(Number(userId), {
        firstName,
        lastName,
        role,
      })

      res.json({ id: Number(userId) })
    } catch (error) {
      next(error)
      return
    }
  }

  async deleteOne(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id
    if (isNaN(Number(userId))) {
      const error = createHttpError(400, 'Invalid request.')
      next(error)
      return
    }

    try {
      const user = await this.userService.deleteById(Number(userId))
      if (!user.affected) {
        next(createHttpError(404, 'User not found.'))
        return
      }

      res.json({ id: Number(userId) })
    } catch (error) {
      next(error)
      return
    }
  }
}
